import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { RedisService } from '@/redis/redis.service';
import { CodigoValidacionRepositorioPort } from '@/victimas/dominio/puertos/codigo-validacion.port';

@Injectable()
export class CodigoValidacionRedisAdapter implements CodigoValidacionRepositorioPort {
  constructor(private readonly redisService: RedisService) {}

  private hashCodigo(codigo: string): string {
    return createHash('sha256').update(codigo).digest('hex');
  }

  async crear(codigo: { celular?: string; email?: string; codigo: string }, ttlSegundos: number): Promise<void> {
    const key = codigo.celular ? `codigo:celular:${codigo.celular}` : `codigo:email:${codigo.email}`;
    const hashedCode = this.hashCodigo(codigo.codigo);
    await this.redisService.set(key, hashedCode, ttlSegundos);
  }

  async validarCodigoPorCelular(celular: string, codigo: string): Promise<boolean> {
    const key = `codigo:celular:${celular}`;
    const storedHashedCode = await this.redisService.get<string>(key);
    if (!storedHashedCode) return false;
    return storedHashedCode === this.hashCodigo(codigo);
  }

  async validarCodigoPorEmail(email: string, codigo: string): Promise<boolean> {
    const key = `codigo:email:${email}`;
    const storedHashedCode = await this.redisService.get<string>(key);
    if (!storedHashedCode) return false;
    return storedHashedCode === this.hashCodigo(codigo);
  }

  async eliminarCodigoPorCelular(celular: string, codigo?: string): Promise<void> {
    const key = `codigo:celular:${celular}`;

    if (codigo === undefined) {
      await this.redisService.del(key);
      return;
    }

    const storedCode = await this.redisService.get<string>(key);
    if (storedCode === this.hashCodigo(codigo)) {
      await this.redisService.del(key);
    }
  }

  async eliminarCodigoPorEmail(email: string, codigo?: string): Promise<void> {
    const key = `codigo:email:${email}`;

    if (codigo === undefined) {
      await this.redisService.del(key);
      return;
    }

    const storedCode = await this.redisService.get<string>(key);
    if (storedCode === this.hashCodigo(codigo)) {
      await this.redisService.del(key);
    }
  }

  async obtenerIntentosPorCelular(celular: string, fecha: string): Promise<number> {
    const key = `intentos:whatsapp:${celular}:${fecha}`;
    const value = await this.redisService.get<number>(key);
    return value ?? 0;
  }

  async obtenerIntentosPorEmail(email: string, fecha: string): Promise<number> {
    const key = `intentos:email:${email}:${fecha}`;
    const value = await this.redisService.get<number>(key);
    return value ?? 0;
  }

  async incrementarIntentosPorCelular(celular: string, fecha: string, ttlSegundos: number): Promise<number> {
    const key = `intentos:whatsapp:${celular}:${fecha}`;
    const valor = await this.redisService.incr(key);

    if (valor === null) {
      throw new Error('No se pudo incrementar el contador de intentos en Redis');
    }

    await this.redisService.expire(key, ttlSegundos);
    return valor;
  }

  async incrementarIntentosPorEmail(email: string, fecha: string, ttlSegundos: number): Promise<number> {
    const key = `intentos:email:${email}:${fecha}`;
    const valor = await this.redisService.incr(key);

    if (valor === null) {
      throw new Error('No se pudo incrementar el contador de intentos en Redis');
    }

    await this.redisService.expire(key, ttlSegundos);
    return valor;
  }
}
