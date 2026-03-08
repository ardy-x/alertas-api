import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';

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
    // Validar código en Redis
    const codigoValido = await this.codigoValidacionRepositorio.validarCodigoPorEmail(request.email.trim(), request.codigo.trim());

    if (!codigoValido) {
      throw new Error('Código inválido o expirado');
    }

    // Buscar víctima por email
    const victima = await this.victimaRepositorio.obtenerPorEmail(request.email.trim());

    if (!victima) {
      throw new Error('Víctima no encontrada');
    }

    const timestamp = Date.now().toString();
    const randomData = Math.random().toString();
    const apiKey = createHash('sha256')
      .update(victima.id + timestamp + randomData)
      .digest('hex');

    // Guardar API key hasheada y activar cuenta
    await this.victimaRepositorio.actualizarApiKey(victima.id, apiKey);

    // Eliminar código usado
    await this.codigoValidacionRepositorio.eliminarCodigoPorEmail(request.email.trim(), request.codigo.trim());

    return {
      victima: {
        id: victima.id,
        apiKey,
      },
    };
  }
}
