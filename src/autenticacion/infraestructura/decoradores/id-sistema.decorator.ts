import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { APP_CONFIG } from '@/config/app.config';

export const IdSistemaActual = createParamDecorator((_data: unknown, _ctx: ExecutionContext): string | undefined => {
  const sistemaEnv = APP_CONFIG.idSistemaActual;

  if (typeof sistemaEnv === 'string' && sistemaEnv.trim().length > 0) {
    return sistemaEnv.trim();
  }

  return undefined;
});
