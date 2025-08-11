import { Injectable } from '@nestjs/common';
import { PublicUser } from './auth/publicUser';

@Injectable()
export class AppService {
  getHello(user: PublicUser): string {
    return 'Hello ' + user.name + '!';
  }
}
