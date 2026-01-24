import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { traducirMensaje } from '@/utils/traducir-validacion.util';

export const VALIDATION_PIPE_CONFIG = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) => {
    const mensajes = errors.map((error) => {
      const restricciones = Object.values(error.constraints || {});
      return traducirMensaje(restricciones[0]);
    });

    return new BadRequestException(mensajes[0]); // Solo el primer error
  },
});
