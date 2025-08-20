import { Test, TestingModule } from '@nestjs/testing';
import { FormsLogsService } from './forms_logs.service';

describe('FormsLogsService', () => {
  let service: FormsLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormsLogsService],
    }).compile();

    service = module.get<FormsLogsService>(FormsLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
