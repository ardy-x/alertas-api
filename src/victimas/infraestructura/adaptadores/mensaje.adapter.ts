import { Injectable, Logger } from '@nestjs/common';

import FormData from 'form-data';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp } from '@/core/utilidades/http-error.util';
import { MensajePort } from '../../dominio/puertos/mensaje.port';

@Injectable()
export class MensajeAdapter implements MensajePort {
  private readonly logger = new Logger(MensajeAdapter.name);

  constructor(private readonly httpClientPublico: HttpClientPublicoService) {}

  async enviarMensajeWhatsapp(destinatario: string, mensaje: string): Promise<boolean> {
    const url = `${SERVICIOS_CONFIG.whatsappApiBase}/mensaje/enviar`;
    try {
      const response = await this.httpClientPublico.post<{ exito?: boolean }>(url, {
        destinatario,
        mensaje,
      });
      return response.exito === true;
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error enviando mensaje WhatsApp en ${url}: ${infoError.mensaje}`);
      throw new Error('Error al enviar mensaje en servicio de WhatsApp');
    }
  }

  async enviarEmail(to: string, subject: string, templateName: string, templateData: unknown): Promise<boolean> {
    const url = `${SERVICIOS_CONFIG.emailApiBase}/email/send-template`;
    try {
      const data = {
        to,
        subject,
        templateName,
        templateData: JSON.stringify(templateData),
        attachments: '',
      };
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        form.append(key, value);
      });

      const response = await this.httpClientPublico.post<{ success?: boolean }>(url, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.success === true;
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error enviando email en ${url}: ${infoError.mensaje}`);
      throw new Error('Error al enviar email en servicio de correo');
    }
  }
}
