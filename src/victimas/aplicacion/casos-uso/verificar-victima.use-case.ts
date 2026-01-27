import { Inject, Injectable } from '@nestjs/common';

import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

import { VerificarVictimaParamsDto } from '../../presentacion/dto/entrada/victima.dto';
import { VerificarVictimaResponse } from '../../presentacion/dto/salida/victima.dto';

@Injectable()
export class VerificarVictimaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(params: VerificarVictimaParamsDto): Promise<VerificarVictimaResponse> {
    const victima = await this.victimaRepositorio.obtenerPorCedula(params.ci.trim());
    return {
      existe: !!victima,
      idVictima: victima?.id,
      estadoCuenta: victima?.estadoCuenta,
      idDispositivo: victima?.idDispositivo || undefined,
    };
  }
}
