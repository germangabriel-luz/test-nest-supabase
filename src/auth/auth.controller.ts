import { Controller,Post,Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('signup')
    async signUp(@Body()dto:SignUpDto){
        return this.authService.signUp(dto)
    }

    @Post('login')
    async login(@Body()dto:LoginDto){
        return this.authService.login(dto)
    }

}
