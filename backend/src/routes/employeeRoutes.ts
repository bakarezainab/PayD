import { Router } from 'express';
import employeeController from '../controllers/employeeController';

const router = Router();

/**
 * @route POST /api/employees
 * @desc Create a new employee
 * @body CreateEmployeeInput
 */
router.post('/', employeeController.createEmployee.bind(employeeController));

/**
 * @route GET /api/employees/organizations/:organizationId
 * @desc Get all employees for an organization
 */
router.get(
  '/organizations/:organizationId',
  employeeController.getAllEmployees.bind(employeeController)
);

/**
 * @route GET /api/employees/organizations/:organizationId/:id
 * @desc Get a specific employee by ID
 */
router.get(
  '/organizations/:organizationId/:id',
  employeeController.getEmployee.bind(employeeController)
);

/**
 * @route PUT /api/employees/organizations/:organizationId/:id
 * @desc Update an employee
 * @body UpdateEmployeeInput
 */
router.put(
  '/organizations/:organizationId/:id',
  employeeController.updateEmployee.bind(employeeController)
);

/**
 * @route DELETE /api/employees/organizations/:organizationId/:id
 * @desc Delete an employee
 */
router.delete(
  '/organizations/:organizationId/:id',
  employeeController.deleteEmployee.bind(employeeController)
);

export default router;
