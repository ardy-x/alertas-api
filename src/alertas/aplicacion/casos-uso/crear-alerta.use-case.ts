import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { NuevaAlerta } from '@/alertas/dominio/entidades/alerta.entity';
import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AlertaValidacionDominioService } from '@/alertas/dominio/servicios/alerta-validacion-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ValidarVictimaService } from '@/alertas/dominio/servicios/validar-victima.service';
import { ALERTA_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { CrearAlertaRequestDto } from '@/alertas/presentacion/dto/entrada/alertas-entrada.dto';
import { CrearAlertaResponseDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { EncontrarDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/encontrar-departamento.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { convertirAUbicacionGeoJSON } from '@/utils/ubicacion.utils';

import { NotificarCreacionAlertaUseCase } from './notificar-creacion-alerta.use-case';

@Injectable()
export class CrearAlertaUseCase {
  private readonly logger = new Logger(CrearAlertaUseCase.name);

  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
    private readonly encontrarDepartamentoUseCase: EncontrarDepartamentoUseCase,
    private readonly validarVictimaService: ValidarVictimaService,
    private readonly notificarCreacionAlertaUseCase: NotificarCreacionAlertaUseCase,
  ) {}

  async ejecutar(entrada: CrearAlertaRequestDto): Promise<CrearAlertaResponseDto> {
    const idAlerta = uuidv4();
    this.logger.log(`Iniciando creación de alerta con ID: ${idAlerta} para víctima: ${entrada.idVictima}`);

    // 1. Validaciones iniciales
    AlertaValidacionDominioService.validarProcesamientoPermitido(new Date(entrada.fechaHora));
    await this.validarVictimaService.validarVictimaExiste(entrada.idVictima);
    await this.validarVictimaService.validarVictimaSinAlertaActiva(entrada.idVictima);

    // 2. Obtener datos de la víctima
    const datosVictima = await this.alertaRepositorio.obtenerDatosVictimaParaAlerta(entrada.idVictima);

    // 3. Determinar idMunicipio e idDepartamento
    let idMunicipio: number | null = null;
    let idDepartamento: number | null = null;

    if (entrada.ubicacion) {
      const datosGeo = await this.encontrarDepartamentoUseCase.ejecutar({
        latitud: entrada.ubicacion.latitud,
        longitud: entrada.ubicacion.longitud,
      });
      if (datosGeo) {
        idMunicipio = Number(datosGeo.municipio.id);
        idDepartamento = Number(datosGeo.departamento.id);
      }
    }

    if (!idMunicipio && datosVictima.idMunicipio) {
      idMunicipio = datosVictima.idMunicipio;
      const datosProvinciaDepartamento = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(idMunicipio);
      if (datosProvinciaDepartamento) {
        idDepartamento = datosProvinciaDepartamento.departamento.id;
      }
    }

    if (!idDepartamento) {
      this.logger.error(`No se pudo determinar el departamento para la alerta ${idAlerta}`);
      throw new BadRequestException('No se pudo determinar el departamento para enviar la alerta.');
    }

    // 4. Preparar datos para crear alerta
    const ubicacionGeoJSON = entrada.ubicacion ? convertirAUbicacionGeoJSON(entrada.ubicacion) : null;
    const nuevaAlerta: NuevaAlerta = {
      id: idAlerta,
      idVictima: entrada.idVictima,
      fechaHora: new Date(entrada.fechaHora),
      codigoCud: entrada.codigoDenuncia || null,
      codigoRegistro: entrada.codigoRegistro || null,
      ubicacion: ubicacionGeoJSON,
      estadoAlerta: EstadoAlerta.PENDIENTE,
      origen: OrigenAlerta.FELCV,
      idMunicipio: idMunicipio,
    };

    // 5. Crear alerta en base de datos
    this.logger.log(`Creando alerta en base de datos para ID: ${idAlerta}`);
    const alertaCreada = await this.alertaRepositorio.crearAlerta(nuevaAlerta);
    this.logger.log(`Alerta creada exitosamente: ${alertaCreada.id} con estado: ${alertaCreada.estadoAlerta}`);

    // 6. Registrar evento automático
    await this.eventoDominioService.registrarEventoAutomatico(idAlerta, TipoEvento.ALERTA_RECIBIDA, ubicacionGeoJSON);

    // 7. Notificar creación de alerta
    await this.notificarCreacionAlertaUseCase.ejecutar({
      idAlerta: alertaCreada.id,
      estado: alertaCreada.estadoAlerta,
      origen: OrigenAlerta.FELCV,
      fechaHora: new Date().toISOString(),
      victima: datosVictima.nombreCompleto,
      idDepartamento: idDepartamento,
    });

    return {
      alerta: {
        id: alertaCreada.id,
        estadoAlerta: alertaCreada.estadoAlerta,
      },
    };
  }
}
