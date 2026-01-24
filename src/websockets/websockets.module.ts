import { Global, Module } from '@nestjs/common';
import { AuthWebSocketService } from './dominio/servicios/auth-websocket.service';
import { ALERTAS_GATEWAY_TOKEN } from './dominio/tokens/websockets.tokens';
import { AlertasGateway } from './infraestructura/alertas.gateway';

@Global()
@Module({
  providers: [
    AuthWebSocketService,
    {
      provide: ALERTAS_GATEWAY_TOKEN,
      useClass: AlertasGateway,
    },
  ],
  exports: [ALERTAS_GATEWAY_TOKEN],
})
export class WebsocketsModule {}
