import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { generarApiKey, hashString } from '@/utils/security.utils';

import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { VerificarCodigoEmailRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/codigo-verificacion-email-request.dto';
import { VerificarCodigoResponseDto } from '@/victimas/presentacion/dto/salida/verificar-codigo-response.dto';

@Injectable()
export class VerificarCodigoEmailUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
  ) {}

  async ejecutar(request: VerificarCodigoEmailRequestDto): Promise<VerificarCodigoResponseDto> {
    const email = request.email.toLowerCase();
    const codigo = request.codigo;

    // Validar código en Redis
    const codigoValido = await this.codigoValidacionRepositorio.validarCodigoPorEmail(email, codigo);

    if (!codigoValido) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Buscar víctima por email
    const victima = await this.victimaRepositorio.obtenerPorEmail(email);

    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    const apiKeyRaw = generarApiKey();
    const apiKeyHash = hashString(apiKeyRaw);

    // Guardar hash de API key en DB y activar cuenta
    await this.victimaRepositorio.actualizarApiKey(victima.id, apiKeyHash);

    // Eliminar código usado
    await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(email, codigo);

    return {
      victima: {
        id: victima.id,
        apiKey: apiKeyRaw,
      },
    };
  }
}
