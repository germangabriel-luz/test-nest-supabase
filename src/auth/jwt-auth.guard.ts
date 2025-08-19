import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid token format');

    try {
      const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
      request.user = payload; // attach user info to request
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
