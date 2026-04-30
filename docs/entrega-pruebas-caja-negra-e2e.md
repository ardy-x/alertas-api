# Informe Formal de Pruebas de Caja Negra (E2E)

Fecha: 2026-04-09  
Proyecto: Alertas API (NestJS)

## 1. Objetivo

Definir y validar, en enfoque de caja negra E2E, el comportamiento observable del sistema (entrada/salida), sin depender de la implementacion interna, para cinco incrementos funcionales del dominio.

## 2. Metodologia de ejecucion

Las pruebas E2E de caja negra se planifican y ejecutan desde la documentacion interactiva de API (Swagger + Scalar), verificando:

1. Codigo HTTP de respuesta.
2. Estructura y contenido de respuesta JSON.
3. Efecto funcional esperado sobre el flujo de negocio.

## 3. Incrementos funcionales evaluados

1. Incremento 1: Activacion y autenticacion de cuenta de victima.
2. Incremento 2: Emision inicial de alerta.
3. Incremento 3: Seguimiento operativo del caso.
4. Incremento 4: Estadisticas y distribucion geografica.
5. Incremento 5: Monitoreo de estado de plataforma e integraciones.

## 4. Matriz de casos de prueba E2E (caja negra)

| Caso de prueba | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| I1-C1. Verificar denuncia con CI/CUD validos | CI y CUD correctos | Respuesta valida de victima habilitada para flujo OTP | Pendiente |
| I1-C2. Verificar OTP correcto y generar API Key | API Key, codigo OTP valido y canal de verificacion | API Key renovada/confirmada y acceso habilitado | Pendiente |
| I1-C3. Decodificar token OAuth valido | Codigo OAuth, latitud y longitud validas | Token decodificado con rol y datos de usuario | Pendiente |
| I2-C1. Crear alerta con datos minimos validos | API Key valida y payload de alerta | Alerta creada en estado `PENDIENTE` | Pendiente |
| I2-C2. Crear alerta con georreferencia valida | Coordenadas GPS validas | Alerta creada con jurisdiccion resuelta (municipio/departamento) | Pendiente |
| I2-C3. Crear alerta sin datos suficientes de jurisdiccion | Payload sin ubicacion ni municipio resoluble | Error funcional controlado (`400`) | Pendiente |
| I3-C1. Notificar operadores por nueva alerta | Alerta pendiente recien creada | Difusion operativa a canales conectados | Pendiente |
| I3-C2. Asignar investigador a victima | Ids validos de victima e investigador | Asignacion registrada como activa | Pendiente |
| I3-C3. Desasignar investigador activo | Id de victima con asignacion previa | Asignacion activa eliminada correctamente | Pendiente |
| I3-C4. Suspender cuenta de victima | Id de victima valida | Cuenta suspendida y acceso bloqueado | Pendiente |
| I4-C1. Obtener metricas generales operativas | Solicitud de consulta de metricas | Respuesta agregada de volumen y tiempos operativos | Pendiente |
| I4-C2. Obtener alertas por ubicacion | Solicitud de distribucion geografica | Alertas agrupadas por departamento/ubicacion | Pendiente |
| I5-C1. Consultar estado integral de plataforma | Solicitud de estado de sistema | Estado consolidado de BD, Redis, WebSocket, PM2 y servicios externos | Pendiente |
| I5-C2. Verificar degradacion de servicio externo | Servicio externo inalcanzable (simulado/controlado) | Estado reportado en `offline` sin caida global del endpoint | Pendiente |

## 5. Trazabilidad de endpoints (referencia)

| Caso | Endpoint de referencia | Metodo |
|---|---|---|
| I1-C1 | /victimas/verificar-denuncia | GET |
| I1-C2 | /codigos/verificar-codigo | POST |
| I1-C3 | /autenticacion/decodificar-token | POST |
| I2-C1, I2-C2, I2-C3 | /alertas | POST |
| I3-C1 | /alertas (flujo de emision operativa posterior al alta) | POST |
| I3-C2 | /victimas/investigadores/asignar | POST |
| I3-C3 | /victimas/investigadores/desasignar | POST |
| I3-C4 | /victimas/web/suspender-cuenta | POST |
| I4-C1 | /dashboard/metricas-generales | GET |
| I4-C2 | /dashboard/alertas-por-ubicacion | GET |
| I5-C1, I5-C2 | /dashboard/estado-plataforma | GET |

## 6. Criterio de aceptacion

Se considera aprobada la validacion E2E cuando:

1. El codigo de respuesta coincide con el esperado para el caso.
2. El contenido de respuesta cumple la regla funcional definida.
3. El resultado obtenido en la matriz se registra como conforme (✓) o no conforme (✗).

## 7. Resultado consolidado

| Indicador | Valor |
|---|---:|
| Casos planificados | 14 |
| Casos ejecutados | 0 |
| Casos conformes | 0 |
| Porcentaje de conformidad | 0% |

## 8. Evidencia grafica (capturas)

Instruccion: coloca las imagenes en `docs/capturas/` y reemplaza cada ruta por tu archivo real.

### Figura 1. Incremento 1 - Activacion y autenticacion

![Figura 1 - Activar cuenta valida](docs/capturas/caso-1-activar-cuenta-valida.png)

Descripcion sugerida: verificacion de denuncia, OTP y decodificacion OAuth para habilitar acceso.

### Figura 2. Incremento 2 - Emision inicial de alerta

![Figura 2 - Emitir alerta valida](docs/capturas/caso-2-emision-alerta-valida.png)

Descripcion sugerida: alta de alerta con respuesta en estado `PENDIENTE` y datos de jurisdiccion.

### Figura 3. Incremento 3 - Seguimiento operativo

![Figura 3 - Autenticacion valida](docs/capturas/caso-3-autenticacion-valida.png)

Descripcion sugerida: notificacion a operadores, asignacion/desasignacion y suspension de cuenta.

### Figura 4. Incremento 4 - Estadisticas y ubicacion

![Figura 4 - Estadisticas y ubicacion](docs/capturas/caso-4-estadisticas-ubicacion.png)

Descripcion sugerida: consultas de metricas generales y distribucion geografica de alertas.

### Figura 5. Incremento 5 - Estado de plataforma

![Figura 5 - Estado de plataforma](docs/capturas/caso-5-estado-plataforma.png)

Descripcion sugerida: estado de BD, Redis, WebSocket, PM2 y servicios externos.

## 9. Conclusion

La validacion de caja negra E2E queda estructurada en cinco incrementos funcionales con 14 casos trazables. Tras la ejecucion, este informe debe actualizar la columna "Resultado obtenido" y el consolidado final con evidencia objetiva de conformidad.
