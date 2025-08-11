import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { PublicUser } from './publicUser';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    type RequestWithUser = Request & { user: PublicUser };
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = <string>request.headers['access_token'];
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = this.authService.verifyToken(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
