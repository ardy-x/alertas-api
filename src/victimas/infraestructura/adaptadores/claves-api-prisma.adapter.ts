import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { ClavesApiPort } from '../../dominio/puertos/claves-api.port';

@Injectable()
export class ClavesApiPrismaAdapter implements ClavesApiPort {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerPorClave(claveApi: string): Promise<{ cedulaIdentidad: string; estadoCuenta: string } | null> {
    const victima = await this.prisma.victima.findFirst({
      where: { apiKey: claveApi },
    });
    if (!victima) return null;
    return {
      cedulaIdentidad: victima.cedulaIdentidad,
      estadoCuenta: victima.estadoCuenta,
    };
  }
}
