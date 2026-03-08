import { Controller, Get, HttpStatus, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ObtenerFuncionarioUseCase } from '../../aplicacion/casos-uso/obtener-funcionario.use-case';
import { OBTENER_FUNCIONARIO_USE_CASE } from '../../dominio/tokens/integracion.tokens';
import { BuscarFuncionarioQueryDto, BuscarFuncionarioResponseDto } from '../dto/funcionario.dto';

@ApiTags('FUNCIONARIOS')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('funcionarios')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.OPERADOR)
export class FuncionariosController {
  constructor(
    @Inject(OBTENER_FUNCIONARIO_USE_CASE)
    private readonly obtenerFuncionarioUseCase: ObtenerFuncionarioUseCase,
  ) {}

  @Get('buscar')
  @ApiOperation({ summary: 'Obtener funcionario por cédula de identidad' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funcionario obtenido exitosamente', type: BuscarFuncionarioResponseDto })
  async obtenerPorCi(@Query() query: BuscarFuncionarioQueryDto): Promise<RespuestaBaseDto<BuscarFuncionarioResponseDto>> {
    const funcionarios = await this.obtenerFuncionarioUseCase.ejecutar(query.ci);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Funcionario obtenido exitosamente', {
      funcionarios: funcionarios,
    });
  }
}
