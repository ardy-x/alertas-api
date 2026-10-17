import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppleReviewService } from './servicios/apple-review.service';
import { HttpClientPrivadoService } from './utilidades/http-client-privado.service';
import { HttpClientPublicoService } from './utilidades/http-client-publico.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  providers: [HttpClientPublicoService, HttpClientPrivadoService, AppleReviewService],
  exports: [HttpClientPublicoService, HttpClientPrivadoService, AppleReviewService],
})
export class CoreModule {}
