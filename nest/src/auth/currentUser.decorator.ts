import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUser } from './publicUser';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const http: HttpArgumentsHost = ctx.switchToHttp();
    const request: { user: PublicUser } = http.getRequest();
    return request['user'];
  },
);
