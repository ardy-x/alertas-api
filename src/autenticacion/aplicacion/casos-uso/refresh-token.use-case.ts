import * as crypto from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { RefreshTokenResponseDto } from '@/autenticacion/presentacion/dtos/salida/refresh-token-response.dto';
import { APP_CONFIG } from '@/config/app.config';
import { RedisService } from '@/redis/redis.service';
import { KerberosJwtPayload } from '../../infraestructura/estrategias/kerberos-jwt.strategy';

interface SessionDataRedis {
  refreshTokenHash: string;
  payloadFirma: KerberosJwtPayload;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly redisService: RedisService) {}

  async ejecutar(refreshToken: string): Promise<RefreshTokenResponseDto> {
    // 1. Separar el token opaco y el userId usando split('.')
    const partes = refreshToken.split('.');
    if (partes.length !== 2) {
      throw new UnauthorizedException('Token de refresco con formato inválido.');
    }

    const [tokenOpaco, userId] = partes;
    const sessionKey = `alertas:session:${userId}`;

    // 2. Obtener la sesión única del usuario vinculada a su ID de usuario
    const sesionGuardada = await this.redisService.get<SessionDataRedis>(sessionKey);

    if (!sesionGuardada) {
      throw new UnauthorizedException('Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.');
    }

    // 3. Calcular el hash del token opaco provisto y verificarlo contra el almacenado
    const hash = crypto.createHash('sha256').update(tokenOpaco).digest('hex');
    if (sesionGuardada.refreshTokenHash !== hash) {
      throw new UnauthorizedException('Token de refresco inválido o ya utilizado.');
    }

    // 4. Generar un nuevo accessToken con el payload plano (payloadFirma)
    const nuevoAccessToken = jwt.sign(sesionGuardada.payloadFirma, APP_CONFIG.jwt.secret, {
      expiresIn: APP_CONFIG.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    // 5. Generar el nuevo refresh token local bajo el formato KISS: nuevoTokenOpaco.userId
    const nuevoTokenOpaco = crypto.randomBytes(32).toString('hex');
    const nuevoRefreshToken = `${nuevoTokenOpaco}.${userId}`;
    const nuevoHash = crypto.createHash('sha256').update(nuevoTokenOpaco).digest('hex');

    // 6. Actualizar la sesión única del usuario en Redis con el nuevo hash
    sesionGuardada.refreshTokenHash = nuevoHash;
    await this.redisService.set(sessionKey, sesionGuardada, APP_CONFIG.jwt.refreshTokenTtl);

    return {
      accessToken: nuevoAccessToken,
      refreshToken: nuevoRefreshToken,
    };
  }
}
