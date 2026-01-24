import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const TokenActual = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const authHeader = request.headers.authorization;
  return authHeader.replace('Bearer ', '');
});
