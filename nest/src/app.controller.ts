import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwtAuthGuard';
import { CurrentUser } from './auth/currentUser.decorator';
import type { PublicUser } from './auth/publicUser';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(@CurrentUser() user: PublicUser): string {
    return this.appService.getHello(user);
  }
}
