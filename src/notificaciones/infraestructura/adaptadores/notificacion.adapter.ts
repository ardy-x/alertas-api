import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import * as admin from 'firebase-admin';

import { NotificacionRepositorioPort, NotificacionRepositorioRequest } from '../../dominio/puertos/notificacion.port';

@Injectable()
export class NotificacionAdapter implements NotificacionRepositorioPort {
  private readonly logger = new Logger(NotificacionAdapter.name);
  private readonly expo: Expo;

  constructor() {
    // Inicializar Firebase Admin
    if (!admin.apps.length) {
      const firebaseConfigPath = path.join(process.cwd(), 'firebase-admin.json');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      admin.initializeApp({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        credential: admin.credential.cert(firebaseConfig),
      });
    }
    // Inicializar Expo
    this.expo = new Expo();
  }

  async enviarNotificacionFirebase(dato: NotificacionRepositorioRequest): Promise<void> {
    try {
      const message = {
        token: dato.fcmToken,
        notification: {
          title: dato.titulo,
          body: dato.cuerpo,
        },
        data: dato.datos || {},
      };

      await admin.messaging().send(message);
      this.logger.log(`Notificación Firebase enviada exitosamente a ${dato.fcmToken}`);
    } catch (error) {
      this.logger.error(`Error al enviar notificación Firebase: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async enviarNotificacionExpo(dato: NotificacionRepositorioRequest): Promise<void> {
    try {
      if (!Expo.isExpoPushToken(dato.fcmToken)) {
        const token: string = String(dato.fcmToken);
        throw new Error(`Token Expo inválido: ${token}`);
      }

      const message: ExpoPushMessage = {
        to: dato.fcmToken,
        sound: 'default',
        title: dato.titulo,
        body: dato.cuerpo,
        data: dato.datos || {},
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      for (const chunk of chunks) {
        const results = await this.expo.sendPushNotificationsAsync(chunk);

        // Check each result for errors
        for (const result of results) {
          if (result.status === 'error') {
            const errorMsg = result.message ? String(result.message) : 'Error desconocido';
            const errorDetails = result.details ? JSON.stringify(result.details) : '';
            throw new Error(`Error al enviar notificación Expo: ${errorMsg} - ${errorDetails}`);
          }
        }
      }

      this.logger.log(`Notificación Expo enviada exitosamente a ${dato.fcmToken}`);
    } catch (error) {
      this.logger.error(`Error al enviar notificación Expo: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async enviarNotificacionesMultiplesFirebase(datos: NotificacionRepositorioRequest[]): Promise<void> {
    try {
      const messages = datos.map((dato) => ({
        token: dato.fcmToken,
        notification: {
          title: dato.titulo,
          body: dato.cuerpo,
        },
        data: dato.datos || {},
      }));

      const response = await admin.messaging().sendEach(messages);
      this.logger.log(`Notificaciones Firebase enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`);
    } catch (error) {
      this.logger.error(`Error al enviar notificaciones múltiples Firebase: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async enviarNotificacionesMultiplesExpo(datos: NotificacionRepositorioRequest[]): Promise<void> {
    try {
      const messages: ExpoPushMessage[] = datos
        .filter((dato) => Expo.isExpoPushToken(dato.fcmToken))
        .map((dato) => ({
          to: dato.fcmToken,
          sound: 'default',
          title: dato.titulo,
          body: dato.cuerpo,
          data: dato.datos || {},
        }));

      const chunks = this.expo.chunkPushNotifications(messages);

      for (const chunk of chunks) {
        const results = await this.expo.sendPushNotificationsAsync(chunk);

        for (const result of results) {
          if (result.status === 'error') {
            const errorMsg = 'message' in result ? String(result.message) : 'Error desconocido';
            const errorDetails = 'details' in result ? JSON.stringify(result.details) : '';
            this.logger.error(`Error al enviar notificación Expo múltiple: ${errorMsg} - ${errorDetails}`);
          }
        }
      }

      this.logger.log(`Notificaciones Expo enviadas exitosamente`);
    } catch (error) {
      this.logger.error(`Error al enviar notificaciones múltiples Expo: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
