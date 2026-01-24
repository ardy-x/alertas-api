import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';

import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CODIGO_VALIDACION_REPOSITORIO_TOKEN, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { VerificarCodigoCelularRequestDto } from '@/victimas/presentacion/dto/entrada/validacion/codigo-verificacion-celular-request.dto';

@Injectable()
export class VerificarCodigoCelularUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CODIGO_VALIDACION_REPOSITORIO_TOKEN)
    private readonly codigoValidacionRepositorio: CodigoValidacionRepositorioPort,
  ) {}

  async ejecutar(request: VerificarCodigoCelularRequestDto): Promise<{ victima: { id: string; apiKey: string } }> {
    // Validar código en Redis
    const codigoValido = await this.codigoValidacionRepositorio.validarCodigoPorCelular(request.celular.trim(), request.codigo.trim());

    if (!codigoValido) {
      throw new Error('Código inválido o expirado');
    }

    // Buscar víctima por celular
    const victima = await this.victimaRepositorio.obtenerPorCelular(request.celular.trim());

    if (!victima) {
      throw new Error('Víctima no encontrada');
    }

    // Generar API key hasheada (sin salt como solicitaste)
    const timestamp = Date.now().toString();
    const randomData = Math.random().toString();
    const apiKey = createHash('sha256')
      .update(victima.id + timestamp + randomData)
      .digest('hex');

    // Guardar API key hasheada y activar cuenta
    await this.victimaRepositorio.actualizarApiKey(victima.id, apiKey);

    // Eliminar código usado
    await this.codigoValidacionRepositorio.eliminarCodigoPorCelular(request.celular.trim(), request.codigo.trim());

    return {
      victima: {
        id: victima.id,
        apiKey,
      },
    };
  }
}
