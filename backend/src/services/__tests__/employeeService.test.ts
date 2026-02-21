import { EmployeeService, CreateEmployeeInput, UpdateEmployeeInput } from '../employeeService';
import { Pool } from 'pg';

// Mock the config module before importing
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };
    service = new EmployeeService(mockPool);
  });

  describe('createEmployee', () => {
    it('should create an employee with all fields', async () => {
      const input: CreateEmployeeInput = {
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        job_title: 'Software Engineer',
        department: 'Engineering',
        withdrawal_preference: 'bank',
        bank_name: 'Test Bank',
        bank_account_number: '123456789',
      };

      const mockEmployee = { id: 1, ...input, created_at: new Date(), updated_at: new Date() };
      mockPool.query.mockResolvedValue({ rows: [mockEmployee] } as any);

      const result = await service.createEmployee(input);

      expect(result).toEqual(mockEmployee);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should create an employee with minimal required fields', async () => {
      const input: CreateEmployeeInput = {
        organization_id: 1,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
      };

      const mockEmployee = { id: 2, ...input, created_at: new Date(), updated_at: new Date() };
      mockPool.query.mockResolvedValue({ rows: [mockEmployee] } as any);

      const result = await service.createEmployee(input);

      expect(result).toEqual(mockEmployee);
    });
  });

  describe('getEmployeeById', () => {
    it('should return an employee when found', async () => {
      const mockEmployee = {
        id: 1,
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      };

      mockPool.query.mockResolvedValue({ rows: [mockEmployee] } as any);

      const result = await service.getEmployeeById(1, 1);

      expect(result).toEqual(mockEmployee);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM employees'),
        [1, 1]
      );
    });

    it('should return null when employee not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await service.getEmployeeById(999, 1);

      expect(result).toBeNull();
    });
  });

  describe('getAllEmployees', () => {
    it('should return all employees for an organization', async () => {
      const mockEmployees = [
        { id: 1, organization_id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, organization_id: 1, first_name: 'Jane', last_name: 'Smith' },
      ];

      mockPool.query.mockResolvedValue({ rows: mockEmployees } as any);

      const result = await service.getAllEmployees(1);

      expect(result).toEqual(mockEmployees);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no employees found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await service.getAllEmployees(1);

      expect(result).toEqual([]);
    });
  });

  describe('updateEmployee', () => {
    it('should update employee fields', async () => {
      const updateData: UpdateEmployeeInput = {
        phone: '+9876543210',
        job_title: 'Senior Engineer',
      };

      const mockUpdatedEmployee = {
        id: 1,
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        ...updateData,
      };

      mockPool.query.mockResolvedValue({ rows: [mockUpdatedEmployee] } as any);

      const result = await service.updateEmployee(1, 1, updateData);

      expect(result).toEqual(mockUpdatedEmployee);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE employees'),
        expect.arrayContaining([1, 1])
      );
    });

    it('should return null when employee not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await service.updateEmployee(999, 1, { phone: '123' });

      expect(result).toBeNull();
    });

    it('should return existing employee when no fields to update', async () => {
      const mockEmployee = { id: 1, organization_id: 1, first_name: 'John' };
      mockPool.query.mockResolvedValue({ rows: [mockEmployee] } as any);

      const result = await service.updateEmployee(1, 1, {});

      expect(result).toEqual(mockEmployee);
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an employee and return true', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1, rows: [{ id: 1 }] } as any);

      const result = await service.deleteEmployee(1, 1);

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM employees'),
        [1, 1]
      );
    });

    it('should return false when employee not found', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0, rows: [] } as any);

      const result = await service.deleteEmployee(999, 1);

      expect(result).toBe(false);
    });
  });
});
