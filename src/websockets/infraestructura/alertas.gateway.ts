import { Logger, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { EstadoAlerta, EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';

import { AlertasGatewayPort, NotificarAlertaCreadaDatos, NotificarCancelacionSolicitudDatos, NotificarPuntoRutaAgregadoDatos } from '../dominio/puertos/alertas-gateway.port';
import { AuthWebSocketService } from '../dominio/servicios/auth-websocket.service';

interface DatosConexion {
  idUsuario: string;
  tipo: string;
  idDepartamento: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN!,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AlertasGateway implements OnGatewayConnection, OnGatewayDisconnect, AlertasGatewayPort {
  @WebSocketServer()
  servidor!: Server;

  private readonly logger = new Logger(AlertasGateway.name);

  constructor(private alertasAuthService: AuthWebSocketService) {
    this.logger.log('AlertasGateway inicializado - Solo para operadores');
  }

  // --- MÉTODOS DEL CICLO DE VIDA ---
  handleConnection(client: Socket) {
    try {
      // Leer token desde auth
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        throw new UnauthorizedException('No se proporcionó un token de acceso');
      }

      const { idUsuario } = this.alertasAuthService.validarToken(token);

      const query = client.handshake.query as unknown as DatosConexion;
      const { tipo, idDepartamento } = this.alertasAuthService.validarDatosConexion(query as unknown as Record<string, unknown>);

      // Guardar datos en client.data
      const clientData = client.data as { idUsuario?: string; tipo?: string; idDepartamento?: number };
      clientData.idUsuario = idUsuario;
      clientData.tipo = tipo;
      clientData.idDepartamento = idDepartamento;

      // Unir a sala específica por departamento
      void client.join(`operadores-${idDepartamento}`);
      this.logger.log(`OPERADOR conectado: usuario ${idUsuario}, departamento ${idDepartamento}`);
    } catch (error) {
      this.logger.warn(`Error de autenticación en WebSocket: ${error instanceof Error ? error.message : String(error)}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientData = client.data as { idUsuario?: string; tipo?: string } | undefined;
    const idUsuario = clientData?.idUsuario;
    const tipo = clientData?.tipo;

    if (!idUsuario) {
      return;
    }
    this.logger.log(`${tipo} desconectado: usuario ${idUsuario}`);
  }

  /**
   * Método helper para emitir eventos a la sala de operadores de un departamento
   */
  private emitirASala(idDepartamento: number, evento: string, datos: unknown): void {
    const salaDepartamento = `operadores-${idDepartamento}`;
    this.servidor.to(salaDepartamento).emit(evento, datos);
    this.logger.log(`Evento '${evento}' emitido a operadores del departamento ${idDepartamento}`);
  }

  /**
   * Notificar nueva alerta a operadores
   */
  notificarAlertaCreada(datosAlerta: NotificarAlertaCreadaDatos): void {
    this.logger.log(`Nueva alerta - ID: ${datosAlerta.idAlerta}, Estado: ${datosAlerta.estado}, Departamento: ${datosAlerta.idDepartamento}`);

    if (String(datosAlerta.estado) !== String(EstadoAlerta.PENDIENTE)) return;

    this.emitirASala(datosAlerta.idDepartamento, 'nuevaAlerta', {
      idAlerta: datosAlerta.idAlerta,
      estado: datosAlerta.estado,
      origen: datosAlerta.origen,
      fechaHora: datosAlerta.fechaHora,
      victima: datosAlerta.victima,
    });
  }

  /**
   * Notificar cancelación de solicitud a operadores
   */
  notificarCancelacionSolicitud(datosCancelacion: NotificarCancelacionSolicitudDatos): void {
    this.logger.log(`Cancelación de solicitud - ID: ${datosCancelacion.idSolicitud}, Alerta: ${datosCancelacion.idAlerta}`);

    if (String(datosCancelacion.estado) !== String(EstadoSolicitudCancelacion.PENDIENTE)) return;

    this.emitirASala(datosCancelacion.idDepartamento, 'cancelacionSolicitud', {
      idSolicitud: datosCancelacion.idSolicitud,
      idAlerta: datosCancelacion.idAlerta,
      estado: datosCancelacion.estado,
      fechaHora: datosCancelacion.fechaHora,
      victima: datosCancelacion.victima,
    });
  }

  /**
   * Notificar nuevo punto en ruta de alerta
   */
  notificarPuntoRutaAgregado(datosRuta: NotificarPuntoRutaAgregadoDatos): void {
    this.logger.log(`Nuevo punto en ruta - Alerta: ${datosRuta.idAlerta}, Lat: ${datosRuta.ultimoPunto.latitud}, Lng: ${datosRuta.ultimoPunto.longitud}`);

    this.emitirASala(datosRuta.idDepartamento, 'puntoRutaAgregado', {
      idAlerta: datosRuta.idAlerta,
      coordenadas: [datosRuta.ultimoPunto.latitud, datosRuta.ultimoPunto.longitud],
    });
  }
}
