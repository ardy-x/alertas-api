import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { Response } from 'express';

import { RespuestaBuilder } from '../utilidades/respuesta.builder';

@Catch()
export class ExcepcionGlobalFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExcepcionGlobalFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as { message?: string };
        message = res.message || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const request = ctx.getRequest<{ method: string; url: string }>();
    const statusStr: string = typeof status === 'number' ? String(status) : '500';
    const messageStr: string = typeof message === 'string' ? message : 'Error desconocido';
    this.logger.error(`Excepción ${statusStr} en ${request.method} ${request.url}: ${messageStr}`);

    const respuestaError = RespuestaBuilder.error(status, message);
    response.status(status).json(respuestaError);
    this.logger.error('Respuesta enviada:', { error: true, message: messageStr, response: null, status: statusStr });
  }
}
