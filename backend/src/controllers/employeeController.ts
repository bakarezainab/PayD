import { Request, Response } from 'express';
import employeeService, { CreateEmployeeInput, UpdateEmployeeInput } from '../services/employeeService';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  organization_id: z.number().int().positive(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  wallet_address: z.string().max(56).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  job_title: z.string().max(100).optional(),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  emergency_contact_name: z.string().max(200).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  withdrawal_preference: z.enum(['bank', 'mobile_money', 'crypto']).optional(),
  bank_name: z.string().max(100).optional(),
  bank_account_number: z.string().max(50).optional(),
  bank_routing_number: z.string().max(50).optional(),
  mobile_money_provider: z.string().max(50).optional(),
  mobile_money_account: z.string().max(50).optional(),
  notes: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  wallet_address: z.string().max(56).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  job_title: z.string().max(100).optional(),
  hire_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  emergency_contact_name: z.string().max(200).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
  withdrawal_preference: z.enum(['bank', 'mobile_money', 'crypto']).optional(),
  bank_name: z.string().max(100).optional(),
  bank_account_number: z.string().max(50).optional(),
  bank_routing_number: z.string().max(50).optional(),
  mobile_money_provider: z.string().max(50).optional(),
  mobile_money_account: z.string().max(50).optional(),
  notes: z.string().optional(),
});

export class EmployeeController {
  async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const data = createEmployeeSchema.parse(req.body) as CreateEmployeeInput;
      const employee = await employeeService.createEmployee(data);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const organizationId = parseInt(req.params.organizationId, 10);

      if (isNaN(id) || isNaN(organizationId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      const employee = await employeeService.getEmployeeById(id, organizationId);
      
      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      res.json(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = parseInt(req.params.organizationId, 10);

      if (isNaN(organizationId)) {
        res.status(400).json({ error: 'Invalid organization ID' });
        return;
      }

      const employees = await employeeService.getAllEmployees(organizationId);
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const organizationId = parseInt(req.params.organizationId, 10);

      if (isNaN(id) || isNaN(organizationId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      const data = updateEmployeeSchema.parse(req.body) as UpdateEmployeeInput;
      const employee = await employeeService.updateEmployee(id, organizationId, data);

      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const organizationId = parseInt(req.params.organizationId, 10);

      if (isNaN(id) || isNaN(organizationId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      const deleted = await employeeService.deleteEmployee(id, organizationId);

      if (!deleted) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EmployeeController();
