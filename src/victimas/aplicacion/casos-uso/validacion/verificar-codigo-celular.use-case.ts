import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { generarApiKey, hashString } from '@/utils/security.utils';

import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { VerificarCodigoCelularRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/codigo-verificacion-celular-request.dto';
import { VerificarCodigoResponseDto } from '@/victimas/presentacion/dto/salida/verificar-codigo-response.dto';

@Injectable()
export class VerificarCodigoCelularUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
  ) {}

  async ejecutar(request: VerificarCodigoCelularRequestDto): Promise<VerificarCodigoResponseDto> {
    // Validar código en Redis
    const codigoValido = await this.codigoValidacionRepositorio.validarCodigoPorCelular(request.celular.trim(), request.codigo.trim());

    if (!codigoValido) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Buscar víctima por celular
    const victima = await this.victimaRepositorio.obtenerPorCelular(request.celular.trim());

    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Generar API key aleatoria y segura
    const apiKeyRaw = generarApiKey();
    const apiKeyHash = hashString(apiKeyRaw);

    // Guardar hash de API key en DB y activar cuenta
    await this.victimaRepositorio.actualizarApiKey(victima.id, apiKeyHash);

    // Eliminar código usado
    await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(request.celular.trim(), request.codigo.trim());

    return {
      victima: {
        id: victima.id,
        apiKey: apiKeyRaw,
      },
    };
  }
}
