import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ContactoEmergenciaRepositorioPort } from '@/victimas/dominio/puertos/contacto-emergencia.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CONTACTO_EMERGENCIA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class MarcarContactoPrincipalUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CONTACTO_EMERGENCIA_REPOSITORIO)
    private readonly contactoEmergenciaRepositorio: ContactoEmergenciaRepositorioPort,
  ) {}

  async ejecutar({ idVictima, idContacto }: { idVictima: string; idContacto: string }): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }
    await this.contactoEmergenciaRepositorio.marcarComoPrincipal(idVictima, idContacto);
  }
}
