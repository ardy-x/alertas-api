import * as fs from 'node:fs';
import * as path from 'node:path';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DecodificarTokenRequestDto } from '@/autenticacion/presentacion/dtos/entrada/decodificar-token-request.dto';
import { DecodificarTokenDatosDto } from '@/autenticacion/presentacion/dtos/salida/decodificar-token-response.dto';
import { EncontrarDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/encontrar-departamento.use-case';
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
  ) {
    this.publicKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8');
  }

  async ejecutar(entrada: DecodificarTokenRequestDto): Promise<DecodificarTokenDatosDto> {
    // 1. Intercambiar código por token en Kerberos
    const token = await this.kerberosPort.intercambioCodigo(entrada.codigo);

    // 2. Verificar JWT usando clave pública
    let datos: DecodedJWT;
    try {
      datos = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as DecodedJWT;
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
    if (!datos.systemData || !datos.userData || !datos.tokens) {
      throw new BadRequestException('faltan datos en el token decodificado.');
    }

    this.logger.log(`Token decodificado exitosamente para usuario: ${datos.userData.username}`);

    // 4. Encontrar departamento basado en coordenadas
    const departamento = await this.encontrarDepartamentoUseCase.ejecutar({
      latitud: entrada.latitud,
      longitud: entrada.longitud,
    });

    const datosTraducidos = JwtMapeoUtilidades.mapearADecodificarTokenResponse(datos, departamento, entrada);

    // 5. Registrar o actualizar usuario en la base de datos
    await this.registrarUsuarioWebUseCase.ejecutar({
      id: datos.userData.userId,
      grado: datos.userData.grado,
      nombreCompleto: datos.userData.fullName,
      unidad: datos.userData.unidad,
      idDepartamento: departamento.departamento.id,
      rol: datos.systemData.role,
      estadoSession: true,
    });

    return datosTraducidos;
  }
}
