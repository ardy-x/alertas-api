import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

import { VictimaResponseDto } from '../../presentacion/dto/salida/victima.dto';

@Injectable()
export class ObtenerVictimaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar(idVictima: string): Promise<VictimaResponseDto> {
    const victima = await this.victimaRepositorio.obtenerDetalleVictima(idVictima);

    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Obtener información de municipio, provincia y departamento
    const ubicacionData = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(victima.idMunicipio);
    if (!ubicacionData) {
      throw new Error('No se pudo obtener información geográfica de la víctima');
    }

    return {
      id: victima.id,
      cedulaIdentidad: victima.cedulaIdentidad,
      nombreCompleto: victima.nombreCompleto,
      celular: victima.celular,
      idMunicipio: victima.idMunicipio,
      municipio: ubicacionData.municipio.municipio,
      provincia: ubicacionData.provincia.provincia,
      departamento: ubicacionData.departamento.departamento,
      fechaNacimiento: victima.fechaNacimiento,
      correo: victima.correo || undefined,
      estadoCuenta: victima.estadoCuenta,
      creadoEn: victima.creadoEn!,
      direccionDomicilio: victima.direccionDomicilio,
      puntoReferencia: victima.puntoReferencia,
      contactosEmergencia: victima.contactosEmergencia.map((vc) => ({
        id: vc.id,
        parentesco: vc.parentesco,
        nombreCompleto: vc.nombreCompleto,
        celular: vc.celular,
        principal: vc.principal,
      })),
    };
  }
}
