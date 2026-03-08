import { Controller, Get, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { Public } from '@/autenticacion/infraestructura/decoradores/public.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { EncontrarDepartamentoUseCase } from '../../aplicacion/casos-uso/encontrar-departamento.use-case';
import { ObtenerDepartamentosUseCase } from '../../aplicacion/casos-uso/obtener-departamentos.use-case';
import { ObtenerMunicipiosPorProvinciaUseCase } from '../../aplicacion/casos-uso/obtener-municipios-por-provincia.use-case';
import { ObtenerProvinciasPorDepartamentoUseCase } from '../../aplicacion/casos-uso/obtener-provincias-por-departamento.use-case';
import { DepartamentoDto, MunicipioProvinciaDepartamentoDto, MunicipioSimpleDto, ProvinciaDto } from '../dto/departamento.dto';
import { EncontrarDepartamentoQueryDto } from '../dto/encontrar-departamento-query.dto';

@ApiTags('DEPARTAMENTOS')
@ApiRespuestasComunes()
@Controller('departamentos')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.INVESTIGADOR, RolesPermitidos.OPERADOR)
export class DepartamentosController {
  constructor(
    private readonly obtenerDepartamentosUseCase: ObtenerDepartamentosUseCase,
    private readonly obtenerProvinciasPorDepartamentoUseCase: ObtenerProvinciasPorDepartamentoUseCase,
    private readonly obtenerMunicipiosPorProvinciaUseCase: ObtenerMunicipiosPorProvinciaUseCase,
    private readonly encontrarDepartamentoUseCase: EncontrarDepartamentoUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos de Bolivia', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Departamentos obtenidos exitosamente', type: [DepartamentoDto] })
  async obtenerDepartamentos(): Promise<RespuestaBaseDto<DepartamentoDto[]>> {
    const departamentos = await this.obtenerDepartamentosUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Departamentos obtenidos exitosamente', departamentos);
  }

  @Get(':idDepartamento/provincias')
  @ApiOperation({ summary: 'Obtener provincias de un departamento específico', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provincias obtenidas exitosamente', type: [ProvinciaDto] })
  async obtenerProvincias(@Param('idDepartamento', ParseIntPipe) idDepartamento: number): Promise<RespuestaBaseDto<ProvinciaDto[]>> {
    const provincias = await this.obtenerProvinciasPorDepartamentoUseCase.ejecutar(idDepartamento);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Provincias obtenidas exitosamente', provincias);
  }

  @Get('provincias/:idProvincia/municipios')
  @ApiOperation({ summary: 'Obtener municipios de una provincia específica', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Municipios obtenidos exitosamente', type: [MunicipioSimpleDto] })
  async obtenerMunicipios(@Param('idProvincia', ParseIntPipe) idProvincia: number): Promise<RespuestaBaseDto<MunicipioSimpleDto[]>> {
    const municipios = await this.obtenerMunicipiosPorProvinciaUseCase.ejecutar(idProvincia);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Municipios obtenidos exitosamente', municipios);
  }

  @ApiOperation({ summary: 'Encontrar departamento, provincia y municipio por coordenadas geográficas', description: 'Esta ruta es pública.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Departamento encontrado exitosamente', type: MunicipioProvinciaDepartamentoDto })
  @Public()
  @Get('encontrar')
  async encontrarDepartamento(@Query() query: EncontrarDepartamentoQueryDto): Promise<RespuestaBaseDto<MunicipioProvinciaDepartamentoDto>> {
    const departamento = await this.encontrarDepartamentoUseCase.ejecutar({ latitud: query.latitud, longitud: query.longitud });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Departamento encontrado exitosamente', departamento);
  }
}
