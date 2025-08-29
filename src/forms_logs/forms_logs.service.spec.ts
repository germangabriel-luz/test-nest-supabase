import { Test, TestingModule } from '@nestjs/testing';
import { FormsLogsService } from './forms_logs.service';
import { supabase } from '../supabase/supabase.client';
import { BadRequestException } from '@nestjs/common';
import { FormsLog } from './entities/forms_log.entity';

// Mock the Supabase client. This will be reset before each test.
jest.mock('../supabase/supabase.client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('FormsLogsService', () => {
  let service: FormsLogsService;
  const supabaseMock = supabase as jest.Mocked<typeof supabase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormsLogsService],
    }).compile();

    service = module.get<FormsLogsService>(FormsLogsService);

    // Reset all mocks to ensure a clean slate for every test
    jest.resetAllMocks();

    // Redefine the default chaining behavior for the mock before each test
    (supabaseMock.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn(),
      }),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test suite for the 'findAll' method
  describe('findAll', () => {
    it('should return an array of forms logs', async () => {
      const mockLogs: FormsLog[] = [
        { id: 'log1', form_id: 1, operation_type: 'INSERT', performed_at: new Date().toISOString(), performed_by: 'user1', details: {} },
      ];
      (supabaseMock.from('forms_logs').select as jest.Mock).mockResolvedValue({ data: mockLogs, error: null });

      const result = await service.findAll();

      expect(result).toEqual(mockLogs);
      expect(supabaseMock.from).toHaveBeenCalledWith('forms_logs');
      expect(supabaseMock.from('forms_logs').select).toHaveBeenCalledWith('*');
    });

    it('should throw a BadRequestException if there is an error', async () => {
      const error = { message: 'DB Error' };
      (supabaseMock.from('forms_logs').select as jest.Mock).mockResolvedValue({ data: null, error });

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  // Test suite for the 'findOne' method
  describe('findOne', () => {
    it('should return a single forms log', async () => {
      const logId = 'log1';
      const mockLog: FormsLog = { id: logId, form_id: 1, operation_type: 'UPDATE', performed_at: new Date().toISOString(), performed_by: 'user1', details: {} };
      (supabaseMock.from('forms_logs').select('*').eq('id', logId).single as jest.Mock).mockResolvedValue({ data: mockLog, error: null });

      const result = await service.findOne(logId);

      expect(result).toEqual(mockLog);
      expect(supabaseMock.from('forms_logs').select('*').eq).toHaveBeenCalledWith('id', logId);
    });

    it('should throw a BadRequestException for "No rows found" error', async () => {
        const logId = 'not-found-id';
        const error = { code: 'PGRST116', message: 'No rows found' };
        (supabaseMock.from('forms_logs').select('*').eq('id', logId).single as jest.Mock).mockResolvedValue({ data: null, error });

        await expect(service.findOne(logId)).rejects.toThrow(new BadRequestException(`Forms log with ID "${logId}" not found.`));
    });
  });

  // Test suite for the 'findUserLogs' method
  describe('findUserLogs', () => {
    it('should return logs for a specific user', async () => {
      const userId = 'user1';
      const mockLogs: FormsLog[] = [
        { id: 'log1', form_id: 1, operation_type: 'INSERT', performed_at: new Date().toISOString(), performed_by: userId, details: {} },
      ];
      (supabaseMock.from('forms_logs').select('*').eq as unknown as jest.Mock).mockResolvedValue({ data: mockLogs, error: null });

      const result = await service.findUserLogs(userId);

      expect(result).toEqual(mockLogs);
      expect(supabaseMock.from('forms_logs').select('*').eq).toHaveBeenCalledWith('performed_by', userId);
    });
  });

  // Test suite for the 'findFormLogs' method
  describe('findFormLogs', () => {
    it('should return logs for a specific form', async () => {
      const formId = 123;
      const mockLogs: FormsLog[] = [
        { id: 'log1', form_id: formId, operation_type: 'DELETE', performed_at: new Date().toISOString(), performed_by: 'user1', details: {} },
      ];
      (supabaseMock.from('forms_logs').select('*').eq as unknown as jest.Mock).mockResolvedValue({ data: mockLogs, error: null });

      const result = await service.findFormLogs(formId);

      expect(result).toEqual(mockLogs);
      expect(supabaseMock.from('forms_logs').select('*').eq).toHaveBeenCalledWith('form_id', formId);
    });
  });

  // Test suite for the 'remove' method
  describe('remove', () => {
    it('should call delete with the correct id and not throw an error', async () => {
      const logId = 'log-to-delete';
      (supabaseMock.from('forms_logs').delete().eq as unknown as jest.Mock).mockResolvedValue({ error: null });
      
      // Use a spy to check console.log without polluting test output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await service.remove(logId);

      expect(supabaseMock.from('forms_logs').delete().eq).toHaveBeenCalledWith('id', logId);
      expect(consoleSpy).toHaveBeenCalledWith(`Form log deleted id: ${logId}`);
      
      consoleSpy.mockRestore(); // Clean up the spy
    });

    it('should throw a BadRequestException if delete fails', async () => {
        const logId = 'log-to-delete';
        const error = { message: 'Delete failed' };
        (supabaseMock.from('forms_logs').delete().eq as unknown as jest.Mock).mockResolvedValue({ error });

        await expect(service.remove(logId)).rejects.toThrow(BadRequestException);
    });
  });
});
