import { Controller, Get, HttpStatus, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { Public } from '@/autenticacion/infraestructura/decoradores/public.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ObtenerFuncionarioUseCase } from '../../aplicacion/casos-uso/obtener-funcionario.use-case';
import { FuncionarioEntity } from '../../dominio/entidades/funcionario.entity';
import { OBTENER_FUNCIONARIO_USE_CASE } from '../../dominio/tokens/integracion.tokens';

@ApiTags('FUNCIONARIOS')
@Controller('funcionarios')
@UseGuards(KerberosJwtAuthGuard)
@ApiSecurity('jwt-auth')
export class FuncionariosController {
  constructor(
    @Inject(OBTENER_FUNCIONARIO_USE_CASE)
    private readonly obtenerFuncionarioUseCase: ObtenerFuncionarioUseCase,
  ) {}

  @Get('buscar')
  @Public()
  @ApiOperation({ summary: 'Obtener funcionario por cédula de identidad' })
  async obtenerPorCi(@Query('ci') ci: string): Promise<RespuestaBaseDto<{ funcionarios: FuncionarioEntity[] }>> {
    const funcionarios = await this.obtenerFuncionarioUseCase.ejecutar(ci);

    return RespuestaBuilder.exito(HttpStatus.OK, 'Funcionario obtenido exitosamente', {
      funcionarios: funcionarios,
    });
  }
}
