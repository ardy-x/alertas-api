import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogDatosInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (process.env.NODE_ENV !== 'development') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;

    console.log(`\n[${method}] ${url}`);
    if (Object.keys(body || {}).length > 0) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
    if (Object.keys(params || {}).length > 0) {
      console.log('Params:', JSON.stringify(params, null, 2));
    }
    if (Object.keys(query || {}).length > 0) {
      console.log('Query:', JSON.stringify(query, null, 2));
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        console.log(`Response:`, JSON.stringify(data, null, 2));
      }),
    );
  }
}
