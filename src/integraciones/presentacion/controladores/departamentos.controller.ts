import { BadRequestException, Controller, Get, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { Public } from '@/autenticacion/infraestructura/decoradores/public.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { EncontrarDepartamentoUseCase } from '../../aplicacion/casos-uso/encontrar-departamento.use-case';
import { ObtenerDepartamentosUseCase } from '../../aplicacion/casos-uso/obtener-departamentos.use-case';
import { ObtenerMunicipiosPorProvinciaUseCase } from '../../aplicacion/casos-uso/obtener-municipios-por-provincia.use-case';
import { ObtenerProvinciasPorDepartamentoUseCase } from '../../aplicacion/casos-uso/obtener-provincias-por-departamento.use-case';

@ApiTags('DEPARTAMENTOS')
@Controller('departamentos')
@UseGuards(KerberosJwtAuthGuard)
export class DepartamentosController {
  constructor(
    private readonly obtenerDepartamentosUseCase: ObtenerDepartamentosUseCase,
    private readonly obtenerProvinciasPorDepartamentoUseCase: ObtenerProvinciasPorDepartamentoUseCase,
    private readonly obtenerMunicipiosPorProvinciaUseCase: ObtenerMunicipiosPorProvinciaUseCase,
    private readonly encontrarDepartamentoUseCase: EncontrarDepartamentoUseCase,
  ) {}

  @Get()
  async obtenerDepartamentos() {
    const departamentos = await this.obtenerDepartamentosUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Departamentos obtenidos exitosamente', departamentos);
  }

  @Get(':idDepartamento/provincias')
  async obtenerProvincias(@Param('idDepartamento') idDepartamento: string) {
    const id = parseInt(idDepartamento, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestException('ID de departamento inválido');
    }
    const provincias = await this.obtenerProvinciasPorDepartamentoUseCase.ejecutar(id);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Provincias obtenidas exitosamente', provincias);
  }

  @Get('provincias/:idProvincia/municipios')
  async obtenerMunicipios(@Param('idProvincia') idProvincia: string) {
    const id = parseInt(idProvincia, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestException('ID de provincia inválido');
    }
    const municipios = await this.obtenerMunicipiosPorProvinciaUseCase.ejecutar(id);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Municipios obtenidos exitosamente', municipios);
  }

  @ApiQuery({ name: 'latitud', example: '-16.5000' })
  @ApiQuery({ name: 'longitud', example: '-68.1501' })
  @Public()
  @Get('encontrar')
  async encontrarDepartamento(@Query('latitud') latitud: string, @Query('longitud') longitud: string) {
    const lat = parseFloat(latitud);
    const lon = parseFloat(longitud);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new BadRequestException('Latitud y longitud deben ser números válidos');
    }
    const departamento = await this.encontrarDepartamentoUseCase.ejecutar({ latitud: lat, longitud: lon });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Departamento encontrado exitosamente', departamento);
  }
}
