import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { AppleReviewService } from './servicios/apple-review.service';
import { HttpClientPrivadoService } from './utilidades/http-client-privado.service';
import { HttpClientPublicoService } from './utilidades/http-client-publico.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000 }), forwardRef(() => NotificacionesModule)],
  providers: [HttpClientPublicoService, HttpClientPrivadoService, AppleReviewService],
  exports: [HttpClientPublicoService, HttpClientPrivadoService, AppleReviewService],
})
export class CoreModule {}
