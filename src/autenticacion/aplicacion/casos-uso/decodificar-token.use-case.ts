import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DecodificarTokenRequestDto } from '@/autenticacion/presentacion/dtos/entrada/decodificar-token-request.dto';
import { DecodificarTokenDatosDto } from '@/autenticacion/presentacion/dtos/salida/decodificar-token-response.dto';
import { APP_CONFIG } from '@/config/app.config';
import { EncontrarDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/encontrar-departamento.use-case';
import { RedisService } from '@/redis/redis.service';
import { RegistrarUsuarioWebUseCase } from '@/usuarios-web/aplicacion/casos-uso/registrar-usuario-web.use-case';
import { DecodedJWT } from '../../dominio/entidades/jwt-entity';
import { KerberosPort } from '../../dominio/puertos/kerberos.port';
import { KERBEROS_PORT_TOKEN } from '../../dominio/tokens/autenticacion.tokens';
import { JwtMapeoUtilidades } from '../../dominio/utilidades/jwt-mapeo.utilidades';

@Injectable()
export class DecodificarTokenUseCase {
  private readonly logger = new Logger(DecodificarTokenUseCase.name);
  private publicKey: string;

  constructor(
    @Inject(KERBEROS_PORT_TOKEN) private readonly kerberosPort: KerberosPort,
    private readonly registrarUsuarioWebUseCase: RegistrarUsuarioWebUseCase,
    private readonly encontrarDepartamentoUseCase: EncontrarDepartamentoUseCase,
    private readonly redisService: RedisService,
  ) {
    this.publicKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8');
  }

  async ejecutar(entrada: DecodificarTokenRequestDto): Promise<DecodificarTokenDatosDto> {
    // 1. Intercambiar código por token en Kerberos
    const token = await this.kerberosPort.intercambioCodigo(entrada.codigo);

    // 2. Verificar JWT original de Kerberos usando clave pública
    let datosOriginales: DecodedJWT;
    try {
      datosOriginales = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as DecodedJWT;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expirado. Por favor, vuelve a iniciar sesión.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Token JWT inválido. Verifica el token recibido del servicio Kerberos.');
      }
      throw new InternalServerErrorException('Error al verificar el token JWT.');
    }

    // 3. Verificación de datos requeridos
    if (!datosOriginales.systemData || !datosOriginales.userData || !datosOriginales.tokens) {
      throw new BadRequestException('faltan datos en el token decodificado.');
    }

    this.logger.log(`Token decodificado exitosamente para usuario: ${datosOriginales.userData.username}`);

    // 4. Encontrar departamento basado en coordenadas
    const departamento = await this.encontrarDepartamentoUseCase.ejecutar({
      latitud: entrada.latitud,
      longitud: entrada.longitud,
    });

    // 5. Registrar o actualizar usuario en la base de datos
    await this.registrarUsuarioWebUseCase.ejecutar({
      id: datosOriginales.userData.userId,
      grado: datosOriginales.userData.grado,
      nombreCompleto: datosOriginales.userData.fullName,
      unidad: datosOriginales.userData.unidad,
      idDepartamento: departamento.departamento.id,
      rol: datosOriginales.systemData.role,
      estadoSession: true,
    });

    // 6. Generación de Tokens Locales de Alertas
    // Decodificamos el accessToken original de Kerberos para obtener el payload plano (KerberosJwtPayload)
    const accessTokenOriginal = datosOriginales.tokens.access_token;
    const datosAccessTokenOriginal = (jwt.decode(accessTokenOriginal) || {}) as {
      userId?: string;
      userSystemId?: string;
      nroDocumento?: string;
      sid?: string;
      role?: string;
      systems?: string[];
    };

    // El payload local que firmamos debe ser el payload plano equivalente a KerberosJwtPayload
    const localPayloadFirma = {
      userId: datosAccessTokenOriginal.userId || datosOriginales.userData.userId,
      userSystemId: datosAccessTokenOriginal.userSystemId || datosOriginales.systemData.id,
      nroDocumento: datosAccessTokenOriginal.nroDocumento || datosOriginales.userData.username,
      sid: datosAccessTokenOriginal.sid || '',
      role: datosAccessTokenOriginal.role || datosOriginales.systemData.role,
      systems: datosAccessTokenOriginal.systems || [],
    };

    // Firmar JWT local (con el payload plano esperado por la estrategia)
    const localAccessToken = jwt.sign(localPayloadFirma, APP_CONFIG.jwt.secret, {
      expiresIn: APP_CONFIG.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const tokenOpaco = crypto.randomBytes(32).toString('hex');
    const userId = datosOriginales.userData.userId;
    const localRefreshToken = `${tokenOpaco}.${userId}`;
    const hash = crypto.createHash('sha256').update(tokenOpaco).digest('hex');

    // 7. Almacenar la sesión única vinculada al ID de usuario
    const sessionKey = `alertas:session:${userId}`;
    await this.redisService.set(
      sessionKey,
      {
        refreshTokenHash: hash,
        payloadFirma: localPayloadFirma,
      },
      APP_CONFIG.jwt.refreshTokenTtl,
    );

    // Creamos la estructura completa DecodedJWT para el mapper del frontend
    const decodedCompleto: DecodedJWT = {
      systemData: datosOriginales.systemData,
      userData: datosOriginales.userData,
      tokens: {
        access_token: localAccessToken,
        refresh_token: localRefreshToken,
      },
      latitude: entrada.latitud,
      longitude: entrada.longitud,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };

    const datosTraducidos = JwtMapeoUtilidades.mapearADecodificarTokenResponse(decodedCompleto, departamento, entrada);

    return datosTraducidos;
  }
}
