import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { FormsLogsService } from './forms_logs.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('forms_logs')
export class FormsLogsController {
  constructor(private readonly formsLogsService: FormsLogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.formsLogsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.formsLogsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.formsLogsService.remove(id);
  }
}
