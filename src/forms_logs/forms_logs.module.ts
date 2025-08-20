import { Module } from '@nestjs/common';
import { FormsLogsService } from './forms_logs.service';
import { FormsLogsController } from './forms_logs.controller';

@Module({
  controllers: [FormsLogsController],
  providers: [FormsLogsService],
})
export class FormsLogsModule {}
