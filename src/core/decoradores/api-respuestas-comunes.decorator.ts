import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Decorador que aplica respuestas HTTP comunes a todos los endpoints
 * Incluye: 400, 401, 404, 500
 */
export function ApiRespuestasComunes() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Solicitud inválida - Error en los datos enviados',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'boolean', example: true },
          status: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Datos de entrada inválidos' },
          response: { type: 'null', example: null },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'No autorizado - Token inválido o expirado',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'boolean', example: true },
          status: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Token de autenticación inválido' },
          response: { type: 'null', example: null },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Recurso no encontrado',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'boolean', example: true },
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'El recurso solicitado no existe' },
          response: { type: 'null', example: null },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Error interno del servidor',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'boolean', example: true },
          status: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Error interno del servidor' },
          response: { type: 'null', example: null },
        },
      },
    }),
  );
}
