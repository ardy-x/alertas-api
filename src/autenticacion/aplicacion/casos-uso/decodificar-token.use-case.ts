import * as fs from 'node:fs';
import * as path from 'node:path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DecodificarTokenRequestDto } from '@/autenticacion/presentacion/dtos/entrada/decodificar-token-request.dto';
import { DecodificarTokenDatosDto, ModuloDto } from '@/autenticacion/presentacion/dtos/salida/decodificar-token-response.dto';
import { EncontrarDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/encontrar-departamento.use-case';
import { RegistrarUsuarioWebUseCase } from '@/usuarios-web/aplicacion/casos-uso/registrar-usuario-web.use-case';
import { RolUsuarioWeb } from '@/usuarios-web/dominio/interfaces/rol-usuario.interface';
import { DecodedJWT, ModuloJWT } from '../../dominio/entidades/jwt-entity';
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
    try {
      // Primero, intercambiar el código por el token
      const exchangeData = await this.kerberosPort.intercambioCodigo(entrada.codigo);

      const token = exchangeData.token;

      // Ahora, decodificar el token
      const decoded = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as DecodedJWT;

      // Validar que los datos obligatorios estén presentes
      if (!decoded.systemData || !decoded.userData || !decoded.tokens) {
        throw new Error('Datos obligatorios faltan en el token JWT');
      }

      const sistema = decoded.systemData;
      const usuario = decoded.userData;

      if (!sistema.modules || !Array.isArray(sistema.modules)) {
        throw new Error('Módulos no encontrados o inválidos en systemData');
      }

      const modulos = sistema.modules.map((modulo: ModuloJWT) => JwtMapeoUtilidades.mapearModuloRecursivo(modulo)) as ModuloDto[];

      this.logger.log(`Token decodificado exitosamente para usuario: ${usuario.username || usuario.userId}`);

      // Encontrar departamento basado en coordenadas del entrada
      const departamento = await this.encontrarDepartamentoUseCase.ejecutar({
        latitud: entrada.latitud,
        longitud: entrada.longitud,
      });

      const datosTraducidos = JwtMapeoUtilidades.mapearADecodificarTokenResponse(decoded, departamento, modulos, entrada);

      // Crear objeto de autorización tipado
      const autorizacion: RolUsuarioWeb = {
        rol: sistema.role,
        modulos,
      };

      // Registrar o actualizar usuario en la base de datos
      await this.registrarUsuarioWebUseCase.ejecutar({
        id: usuario.userId,
        grado: usuario.grado,
        nombreCompleto: usuario.fullName,
        unidad: usuario.unidad,
        idDepartamento: departamento.departamento.id,
        autorizacion,
        estadoSession: true,
      });

      this.logger.log(`Usuario registrado exitosamente: ${usuario.username}`);

      return datosTraducidos;
    } catch (error) {
      if ((error as Error).message.includes('403')) {
        throw new Error('Código de autenticación expirado o ya utilizado. Obtén un nuevo código.');
      } else {
        // Para otros errores, relanzar la excepción original para que conserve el mensaje correcto
        throw error;
      }
    }
  }
}
