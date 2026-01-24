export interface MensajePort {
  enviarMensajeWhatsapp(destinatario: string, mensaje: string): Promise<boolean>;
  enviarEmail(to: string, subject: string, templateName: string, templateData: Record<string, unknown>): Promise<boolean>;
}
