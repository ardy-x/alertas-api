import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { DatosExternosAttEntity } from '@/alertas/dominio/entidades/datos-externos-att.entity';
import { DatosExternosAtt } from '@/alertas/dominio/entidades/persona-datos-att.entity';
import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { DatosExternosAttRepositorioPort } from '@/alertas/dominio/puertos/datos-externos-att.port';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { RecibirDatosAttDto } from '@/alertas/presentacion/dto/entrada/datos-att-entrada.dto';
import { EnviarNotificacionesMultiplesUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificaciones-multiples.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { UsuarioWebKerberosRepositorioPort } from '@/usuarios-web/dominio/puertos/usuario-web-repositorio.port';
import { USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN } from '@/usuarios-web/dominio/tokens/usuario-web.tokens';
import { AlertasGatewayPort } from '@/websockets/dominio/puertos/alertas-gateway.port';
import { ALERTAS_GATEWAY_TOKEN } from '@/websockets/dominio/tokens/websockets.tokens';

@Injectable()
export class crearAlertaAttUseCase {
  private readonly logger = new Logger(crearAlertaAttUseCase.name);

  constructor(
    @Inject(DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN)
    private readonly datosExternosAttRepositorio: DatosExternosAttRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    @Inject(ALERTAS_GATEWAY_TOKEN)
    private readonly alertasGateway: AlertasGatewayPort,
    @Inject(USUARIO_WEB_KERBEROS_REPOSITORIO_TOKEN)
    private readonly usuarioWebRepositorio: UsuarioWebKerberosRepositorioPort,
    private readonly enviarNotificacionesMultiplesUseCase: EnviarNotificacionesMultiplesUseCase,
  ) {}

  async ejecutar(datos: RecibirDatosAttDto): Promise<DatosExternosAttEntity> {
    // Transformar DTO a tipos de dominio
    const datosDominio: DatosExternosAtt = {
      idAlerta: uuidv4(), // Generar ID único para ATT
      fechaRegistro: new Date().toISOString(),
      persona: {
        cedulaIdentidad: datos.persona.cedulaIdentidad,
        nombres: datos.persona.nombres,
        apellidos: datos.persona.apellidos,
        celular: datos.persona.celular,
        fechaNacimiento: undefined, // No viene en el DTO actual
      },
      contacto: {
        nombreCompleto: `${datos.persona.nombres} ${datos.persona.apellidos}`,
        celular: datos.persona.celular,
        correo: undefined, // No viene en el DTO actual
      },
      contactos: datos.persona.contactosAdicionales?.map((contacto) => ({
        nombreCompleto: contacto.nombreCompleto,
        celular: contacto.celular,
        correo: undefined,
        relacion: undefined,
      })),
    };

    // Generar nuestro propio ID único para la alerta usando la misma librería que otros casos de uso
    const nuevoId = uuidv4();
    // Crear la alerta con el ID generado
    const alertaCreada = await this.datosExternosAttRepositorio.crearAlertaATT(datosDominio, nuevoId);

    // Registrar evento automático de creación de alerta desde ATT
    await this.eventoDominioService.registrarEventoAutomatico(nuevoId, TipoEvento.ALERTA_RECIBIDA);

    // Notificar a operadores vía WebSocket y push al mismo tiempo
    const nombreCompletoPersona = `${datos.persona.nombres} ${datos.persona.apellidos}`;
    const idDepartamento = 1; // Por defecto La Paz para alertas ATT

    void this.alertasGateway.notificarAlertaCreada({
      idAlerta: nuevoId,
      estado: EstadoAlerta.PENDIENTE,
      origen: OrigenAlerta.ATT,
      fechaHora: new Date().toISOString(),
      victima: nombreCompletoPersona,
      idDepartamento: idDepartamento,
    });

    const notificacionPush = (async () => {
      try {
        const tokensFCM = await this.usuarioWebRepositorio.obtenerTokensFCMUsuariosWeb(idDepartamento);
        if (tokensFCM.length > 0) {
          const notificaciones = tokensFCM.map((token) => ({
            fcmToken: token,
            titulo: 'Nueva Alerta ATT',
            cuerpo: `Se ha recibido una alerta ATT para ${nombreCompletoPersona}`,
            datos: { idAlerta: nuevoId, tipo: 'alerta_att_creada' },
          }));
          await this.enviarNotificacionesMultiplesUseCase.ejecutar({
            notificaciones,
            tipoDestinatario: TipoDestinatario.USUARIO_WEB,
          });
        }
      } catch (error) {
        this.logger.warn(`Error al enviar notificaciones push: ${error instanceof Error ? error.message : String(error)}`);
      }
    })();

    await notificacionPush;

    return alertaCreada;
  }
}
