import { Test, TestingModule } from '@nestjs/testing';
import { FormsLogsController } from './forms_logs.controller';
import { FormsLogsService } from './forms_logs.service';

describe('FormsLogsController', () => {
  let controller: FormsLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormsLogsController],
      providers: [FormsLogsService],
    }).compile();

    controller = module.get<FormsLogsController>(FormsLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
