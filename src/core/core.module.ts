import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { HttpClientPrivadoService } from './utilidades/http-client-privado.service';
import { HttpClientPublicoService } from './utilidades/http-client-publico.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  providers: [HttpClientPublicoService, HttpClientPrivadoService],
  exports: [HttpClientPublicoService, HttpClientPrivadoService],
})
export class CoreModule {}
