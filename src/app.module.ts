import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [AuthModule, FormsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
