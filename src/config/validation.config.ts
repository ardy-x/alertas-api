import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { traducirMensaje } from '@/utils/traducir-validacion.util';

export const VALIDATION_PIPE_CONFIG = new ValidationPipe({
  // Solo permite propiedades declaradas en el DTO.
  whitelist: true,
  // Rechaza la peticion si llegan propiedades no permitidas.
  forbidNonWhitelisted: true,
  // Rechaza payloads/valores desconocidos para class-validator.
  forbidUnknownValues: true,
  // Convierte tipos segun decoradores (ej. query string -> number).
  transform: true,
  // Falla en el primer error para mensajes mas claros y consistentes.
  stopAtFirstError: true,
  exceptionFactory: (errors) => {
    const mensajes = errors.map((error) => {
      const restricciones = Object.values(error.constraints || {});
      return traducirMensaje(restricciones[0]);
    });

    return new BadRequestException(mensajes[0]); // Solo el primer error
  },
});
