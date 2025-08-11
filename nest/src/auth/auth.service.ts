import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compareSync } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import { PublicUser } from './publicUser';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findOneByName(username);
    if (!user || !compareSync(pass, user.password)) {
      throw new UnauthorizedException('no user found or password mismatch');
    }
    return user;
  }

  login(user: User): { access_token: string } {
    const secret = String(this.config.get<string>('HASH'));
    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
    };

    return {
      access_token: sign(publicUser, secret, {
        expiresIn: 86400 * 7, // 7 days in seconds
        algorithm: 'HS256',
      }),
    };
  }

  verifyToken(token: string): PublicUser {
    const secret = String(this.config.get<string>('HASH'));
    try {
      return <PublicUser>verify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
