import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { VerificarDenunciaPort } from '../../dominio/puertos/verificar-denuncia.port';
import { VERIFICAR_DENUNCIA_PORT_TOKEN } from '../../dominio/tokens/victima.tokens';
import { VictimaDto } from '../../presentacion/dto/salida/verificar-denuncia.dto';

@Injectable()
export class VerificarDenunciaUseCase {
  constructor(
    @Inject(VERIFICAR_DENUNCIA_PORT_TOKEN)
    private readonly verificarDenunciaPort: VerificarDenunciaPort,
  ) {}

  async ejecutar(codigoDenuncia: string, cedulaIdentidad: string): Promise<VictimaDto> {
    const datos = await this.verificarDenunciaPort.verificarDenuncia(codigoDenuncia, cedulaIdentidad);
    if (!datos.victima) {
      throw new NotFoundException('No se encontró ninguna denuncia con el código proporcionado');
    }
    return datos.victima as VictimaDto;
  }
}
