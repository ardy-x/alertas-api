import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import Redis from 'ioredis';

import { REDIS_CONFIG } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private isConnected = false;
  private logger = new Logger(RedisService.name);
  private connectionErrorLogged = false;
  private readonly ttlSeconds: number;

  constructor() {
    this.ttlSeconds = REDIS_CONFIG.ttl;
  }

  onModuleInit(): void {
    try {
      this.client = new Redis(REDIS_CONFIG.redisUrl);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.connectionErrorLogged = false; // Resetear la bandera al conectar
        this.logger.log('Conectado exitosamente a Redis');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        if (!this.connectionErrorLogged) {
          this.logger.error('Error al conectar a Redis:', error instanceof Error ? error.message : String(error));
          this.connectionErrorLogged = true;
        }
      });
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Error al inicializar Redis:', error instanceof Error ? error.message : String(error));
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Desconectado de Redis');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error('Error al obtener de Redis:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const ttl = ttlSeconds ?? this.ttlSeconds;
      const respuesta = await this.client.set(key, JSON.stringify(value), 'EX', ttl);
      return respuesta === 'OK';
    } catch (error) {
      this.logger.error('Error al guardar en Redis:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const eliminados = await this.client.del(key);
      return eliminados > 0;
    } catch (error) {
      this.logger.error('Error al eliminar de Redis:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}
