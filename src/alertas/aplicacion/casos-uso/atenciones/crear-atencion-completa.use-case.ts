import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { RolAtencion } from '@/alertas/dominio/enums/atencion-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AtencionRepositorioPort, CrearAtencionCompleta } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionValidacionDominioService } from '@/alertas/dominio/servicios/atencion-validacion-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ATENCION_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { CrearAtencionCompletaRequestDto } from '@/alertas/presentacion/dto/entrada/atenciones-entrada.dto';
import { transformarUbicacionSimpleAUbicacionPoint } from '@/utils/ubicacion.utils';

@Injectable()
export class CrearAtencionCompletaUseCase {
  constructor(
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepositorio: AtencionRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
  ) {}

  async ejecutar(entrada: CrearAtencionCompletaRequestDto, idUsuarioWeb: string): Promise<void> {
    const idAtencion = uuidv4();

    const existeAtencion = await this.atencionRepositorio.existePorAlerta(entrada.idAlerta);
    if (existeAtencion) {
      throw new ConflictException(`La alerta ${entrada.idAlerta} ya tiene personal asignado`);
    }

    AtencionValidacionDominioService.validarListaFuncionarios(entrada.funcionarios);

    const funcionariosPreparados = entrada.funcionarios.map((funcionarioData) => {
      return {
        id: uuidv4(),
        rolAtencion: (funcionarioData.rolAtencion || RolAtencion.ENCARGADO) as string,
        ubicacion: transformarUbicacionSimpleAUbicacionPoint(funcionarioData.ubicacion),
        turnoInicio: funcionarioData.turnoInicio,
        turnoFin: funcionarioData.turnoFin,
        ciFuncionario: funcionarioData.ciFuncionario,
        unidad: funcionarioData.unidad,
      };
    });

    const datosAtencion: CrearAtencionCompleta = {
      idAtencion,
      idAlerta: entrada.idAlerta,
      idUsuarioWeb: idUsuarioWeb,
      siglaVehiculo: entrada.siglaVehiculo,
      siglaRadio: entrada.siglaRadio,
      funcionarios: funcionariosPreparados,
    };

    await this.atencionRepositorio.crearAtencionCompleta(datosAtencion);

    await this.eventoDominioService.registrarEventoSemiautomatico(entrada.idAlerta, TipoEvento.ALERTA_ASIGNADA, idUsuarioWeb);
  }
}
