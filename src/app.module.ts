import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';
import { FormsLogsModule } from './forms_logs/forms_logs.module';

@Module({
  imports: [AuthModule, FormsModule, FormsLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
