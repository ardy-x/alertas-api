import { Inject, Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import { TipoEvento } from '../enums/evento-enums';
import { CrearEventoDatos, EventoRepositorioPort } from '../puertos/evento.port';
import { EVENTO_REPOSITORIO_TOKEN } from '../tokens/alerta.tokens';

@Injectable()
export class EventoDominioService {
  constructor(
    @Inject(EVENTO_REPOSITORIO_TOKEN)
    private readonly eventoRepositorio: EventoRepositorioPort,
  ) {}

  async registrarEvento(idAlerta: string, tipoEvento: TipoEvento, idUsuarioWeb: string | null = null, ubicacion?: UbicacionPoint | null, ciFuncionario?: string | null): Promise<void> {
    const idEvento = uuidv4();
    const datosCreacion: CrearEventoDatos = {
      id: idEvento,
      idAlerta,
      idUsuarioWeb,
      tipoEvento,
      fechaHora: new Date(),
      ubicacion: ubicacion || null,
      ciFuncionario: ciFuncionario || null,
    };
    await this.eventoRepositorio.crearEvento(datosCreacion);
  }

  /**
   * Registra evento automático (sin usuario)
   */
  async registrarEventoAutomatico(idAlerta: string, tipoEvento: TipoEvento, ubicacion?: UbicacionPoint | null): Promise<void> {
    await this.registrarEvento(idAlerta, tipoEvento, null, ubicacion);
  }

  /**
   * Registra evento semiautomático (con usuario web)
   */
  async registrarEventoSemiautomatico(idAlerta: string, tipoEvento: TipoEvento, idUsuarioWeb: string, ubicacion?: UbicacionPoint | null, ciFuncionario?: string | null): Promise<void> {
    await this.registrarEvento(idAlerta, tipoEvento, idUsuarioWeb, ubicacion, ciFuncionario);
  }
}
