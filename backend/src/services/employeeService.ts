import { Pool } from 'pg';
import { pool } from '../config/database';

export interface Employee {
  id: number;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
  wallet_address?: string;
  status: 'active' | 'inactive' | 'pending';
  position?: string;
  department?: string;
  phone?: string;
  job_title?: string;
  hire_date?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  withdrawal_preference: 'bank' | 'mobile_money' | 'crypto';
  bank_name?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  mobile_money_provider?: string;
  mobile_money_account?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
  wallet_address?: string;
  status?: 'active' | 'inactive' | 'pending';
  position?: string;
  department?: string;
  phone?: string;
  job_title?: string;
  hire_date?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  withdrawal_preference?: 'bank' | 'mobile_money' | 'crypto';
  bank_name?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  mobile_money_provider?: string;
  mobile_money_account?: string;
  notes?: string;
}

export interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  wallet_address?: string;
  status?: 'active' | 'inactive' | 'pending';
  position?: string;
  department?: string;
  phone?: string;
  job_title?: string;
  hire_date?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  withdrawal_preference?: 'bank' | 'mobile_money' | 'crypto';
  bank_name?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  mobile_money_provider?: string;
  mobile_money_account?: string;
  notes?: string;
}

export class EmployeeService {
  private pool: Pool;

  constructor(dbPool: Pool) {
    this.pool = dbPool;
  }

  async createEmployee(data: CreateEmployeeInput): Promise<Employee> {
    const fields = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO employees (${fields})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getEmployeeById(id: number, organizationId: number): Promise<Employee | null> {
    const query = `
      SELECT * FROM employees
      WHERE id = $1 AND organization_id = $2
    `;

    const result = await this.pool.query(query, [id, organizationId]);
    return result.rows[0] || null;
  }

  async getAllEmployees(organizationId: number): Promise<Employee[]> {
    const query = `
      SELECT * FROM employees
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [organizationId]);
    return result.rows;
  }

  async updateEmployee(
    id: number,
    organizationId: number,
    data: UpdateEmployeeInput
  ): Promise<Employee | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      return this.getEmployeeById(id, organizationId);
    }

    const setClause = fields.map((field, i) => `${field} = $${i + 3}`).join(', ');
    const values = Object.values(data);

    const query = `
      UPDATE employees
      SET ${setClause}
      WHERE id = $1 AND organization_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, organizationId, ...values]);
    return result.rows[0] || null;
  }

  async deleteEmployee(id: number, organizationId: number): Promise<boolean> {
    const query = `
      DELETE FROM employees
      WHERE id = $1 AND organization_id = $2
      RETURNING id
    `;

    const result = await this.pool.query(query, [id, organizationId]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export default new EmployeeService(pool);
