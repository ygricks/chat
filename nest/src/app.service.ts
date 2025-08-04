import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(private usersService: UsersService) {}

  async getHello(): Promise<string> {
    const user = await this.usersService.findOne('igor');
    const data: object = <object>user;
    delete data['password'];
    return 'Hello World! ' + JSON.stringify(data);
  }
}
