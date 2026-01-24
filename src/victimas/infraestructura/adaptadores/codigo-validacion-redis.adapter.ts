import { Injectable } from '@nestjs/common';

import { RedisService } from '@/redis/redis.service';
import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';

@Injectable()
export class CodigoValidacionRedisAdapter implements CodigoValidacionRepositorioPort {
  constructor(private readonly redisService: RedisService) {}

  async crear(codigo: { celular?: string; email?: string; codigo: string }, ttlSegundos: number): Promise<void> {
    const key = codigo.celular ? `codigo:celular:${codigo.celular}` : `codigo:email:${codigo.email}`;
    await this.redisService.set(key, codigo.codigo, ttlSegundos);
  }

  async validarCodigoPorCelular(celular: string, codigo: string): Promise<boolean> {
    const key = `codigo:celular:${celular}`;
    const storedCode = await this.redisService.get<string>(key);
    return storedCode === codigo;
  }

  async validarCodigoPorEmail(email: string, codigo: string): Promise<boolean> {
    const key = `codigo:email:${email}`;
    const storedCode = await this.redisService.get<string>(key);
    return storedCode === codigo;
  }

  async eliminarCodigoPorCelular(celular: string, codigo: string): Promise<void> {
    const key = `codigo:celular:${celular}`;
    const storedCode = await this.redisService.get<string>(key);

    if (storedCode === codigo) {
      await this.redisService.del(key);
    }
  }

  async eliminarCodigoPorEmail(email: string, codigo: string): Promise<void> {
    const key = `codigo:email:${email}`;
    const storedCode = await this.redisService.get<string>(key);

    if (storedCode === codigo) {
      await this.redisService.del(key);
    }
  }
}
