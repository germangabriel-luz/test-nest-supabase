import { Test, TestingModule } from '@nestjs/testing';
import { FormsLogsController } from './forms_logs.controller';
import { FormsLogsService } from './forms_logs.service';
import { FormsLog } from './entities/forms_log.entity';

// Create a mock version of the FormsLogsService to simulate its behavior.
const mockFormsLogsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findUserLogs: jest.fn(),
  findFormLogs: jest.fn(),
  remove: jest.fn(),
};

describe('FormsLogsController', () => {
  let controller: FormsLogsController;
  let service: FormsLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormsLogsController],
      providers: [
        {
          // Provide our mock service whenever the FormsLogsService is requested.
          provide: FormsLogsService,
          useValue: mockFormsLogsService,
        },
      ],
    }).compile();

    controller = module.get<FormsLogsController>(FormsLogsController);
    service = module.get<FormsLogsService>(FormsLogsService); // Get a reference to the mock
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test suite for the 'findAll' controller method
  describe('findAll', () => {
    it('should call the service to find all logs and return them', async () => {
      const expectedResult: FormsLog[] = [{ id: 'log1', form_id: 1, operation_type: 'INSERT', performed_at: '', performed_by: 'user1', details: {} }];
      mockFormsLogsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // Test suite for the 'findOne' controller method
  describe('findOne', () => {
    it('should call the service to find one log and return it', async () => {
      const logId = 'some-uuid';
      const expectedResult: FormsLog = { id: logId, form_id: 1, operation_type: 'UPDATE', performed_at: '', performed_by: 'user1', details: {} };
      mockFormsLogsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(logId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(logId);
    });
  });

  // Test suite for the 'findUserLogs' controller method
  describe('findUserLogs', () => {
    it('should call the service to find logs for a user and return them', async () => {
      const userId = 'user-uuid';
      const expectedResult: FormsLog[] = [{ id: 'log1', form_id: 1, operation_type: 'INSERT', performed_at: '', performed_by: userId, details: {} }];
      mockFormsLogsService.findUserLogs.mockResolvedValue(expectedResult);

      const result = await controller.findUserLogs(userId);

      expect(result).toEqual(expectedResult);
      expect(service.findUserLogs).toHaveBeenCalledWith(userId);
    });
  });

  // Test suite for the 'findFormLogs' controller method
  describe('findFormLogs', () => {
    it('should call the service to find logs for a form and return them', async () => {
      const formId = 123;
      const expectedResult: FormsLog[] = [{ id: 'log1', form_id: Number(formId), operation_type: 'DELETE', performed_at: '', performed_by: 'user1', details: {} }];
      mockFormsLogsService.findFormLogs.mockResolvedValue(expectedResult);

      const result = await controller.findFormLogs(formId);

      expect(result).toEqual(expectedResult);
      // Controller params are strings, but the service expects a number for this method
      expect(service.findFormLogs).toHaveBeenCalledWith(Number(formId));
    });
  });

  // Test suite for the 'remove' controller method
  describe('remove', () => {
    it('should call the service to remove a log', async () => {
      const logId = 'log-to-delete';
      // The remove service method doesn't return anything, so we just mock it to resolve
      mockFormsLogsService.remove.mockResolvedValue(undefined);

      await controller.remove(logId);

      expect(service.remove).toHaveBeenCalledWith(logId);
    });
  });
});
