import request from 'supertest';
import express from 'express';
import employeeController from '../employeeController';
import employeeService from '../../services/employeeService';

jest.mock('../../services/employeeService');
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.post('/employees', employeeController.createEmployee.bind(employeeController));
app.get('/employees/organizations/:organizationId', employeeController.getAllEmployees.bind(employeeController));
app.get('/employees/organizations/:organizationId/:id', employeeController.getEmployee.bind(employeeController));
app.put('/employees/organizations/:organizationId/:id', employeeController.updateEmployee.bind(employeeController));
app.delete('/employees/organizations/:organizationId/:id', employeeController.deleteEmployee.bind(employeeController));

describe('EmployeeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /employees', () => {
    it('should create an employee with valid data', async () => {
      const input = {
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        job_title: 'Software Engineer',
        withdrawal_preference: 'bank',
      };

      const mockEmployee = { id: 1, ...input, created_at: new Date(), updated_at: new Date() };
      (employeeService.createEmployee as jest.Mock).mockResolvedValue(mockEmployee);

      const response = await request(app)
        .post('/employees')
        .send(input)
        .expect(201);

      expect(response.body).toMatchObject(input);
      expect(employeeService.createEmployee).toHaveBeenCalledWith(input);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/employees')
        .send({ first_name: 'John' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/employees')
        .send({
          organization_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid withdrawal preference', async () => {
      const response = await request(app)
        .post('/employees')
        .send({
          organization_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          withdrawal_preference: 'invalid',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /employees/organizations/:organizationId/:id', () => {
    it('should return an employee when found', async () => {
      const mockEmployee = {
        id: 1,
        organization_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      (employeeService.getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);

      const response = await request(app)
        .get('/employees/organizations/1/1')
        .expect(200);

      expect(response.body).toEqual(mockEmployee);
    });

    it('should return 404 when employee not found', async () => {
      (employeeService.getEmployeeById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/employees/organizations/1/999')
        .expect(404);

      expect(response.body.error).toBe('Employee not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/employees/organizations/1/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID');
    });
  });

  describe('GET /employees/organizations/:organizationId', () => {
    it('should return all employees for an organization', async () => {
      const mockEmployees = [
        { id: 1, organization_id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, organization_id: 1, first_name: 'Jane', last_name: 'Smith' },
      ];

      (employeeService.getAllEmployees as jest.Mock).mockResolvedValue(mockEmployees);

      const response = await request(app)
        .get('/employees/organizations/1')
        .expect(200);

      expect(response.body).toEqual(mockEmployees);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no employees found', async () => {
      (employeeService.getAllEmployees as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/employees/organizations/1')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /employees/organizations/:organizationId/:id', () => {
    it('should update an employee', async () => {
      const updateData = {
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

      (employeeService.updateEmployee as jest.Mock).mockResolvedValue(mockUpdatedEmployee);

      const response = await request(app)
        .put('/employees/organizations/1/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedEmployee);
    });

    it('should return 404 when employee not found', async () => {
      (employeeService.updateEmployee as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/employees/organizations/1/999')
        .send({ phone: '123' })
        .expect(404);

      expect(response.body.error).toBe('Employee not found');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .put('/employees/organizations/1/1')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /employees/organizations/:organizationId/:id', () => {
    it('should delete an employee', async () => {
      (employeeService.deleteEmployee as jest.Mock).mockResolvedValue(true);

      await request(app)
        .delete('/employees/organizations/1/1')
        .expect(204);

      expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1, 1);
    });

    it('should return 404 when employee not found', async () => {
      (employeeService.deleteEmployee as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .delete('/employees/organizations/1/999')
        .expect(404);

      expect(response.body.error).toBe('Employee not found');
    });
  });
});
