# Guia de Pruebas de Estres

## 1. Alcance definido

Se ejecutaran pruebas de estres HTTP sobre endpoints publicos sin reglas de negocio de estado para evitar falsos errores funcionales en la medicion de carga.

Objetivo principal:

1. Endpoint publico de geolocalizacion de departamentos.
2. Endpoint publico de verificacion de denuncia.
3. Endpoint publico de historial de alertas (consulta a BD).

## 2. Endpoints HTTP a probar con K6

1. GET /api/departamentos/encontrar?latitud=...&longitud=...
2. GET /api/victimas/verificar-denuncia?codigoDenuncia=1-030-20-00-25-00003&cedulaIdentidad=6666
3. GET /api/victimas/historial-alertas?ci=6666

Script listo: tests/performance/k6-http-stress.js

## 3. WebSocket (Socket.IO)

Tu gateway usa Socket.IO. Para carga de conexiones concurrentes se recomienda Artillery con engine Socket.IO.

Script listo:

1. tests/performance/artillery-socketio.yml
2. tests/performance/ws-processor.js

## 4. Ejecucion K6

### 4.1 Instalacion de K6 (macOS)

K6 es un binario externo (no se instala con pnpm). En macOS:

`brew install k6`

Verificar instalacion:

`k6 version`

### 4.2 Ejecucion

Comando base:

`k6 run tests/performance/k6-http-stress.js`

Con variable de entorno para tu API:

`BASE_URL=https://tu-host/api k6 run tests/performance/k6-http-stress.js`

Ejemplo contra entorno remoto:

`BASE_URL=https://tu-host/api k6 run tests/performance/k6-http-stress.js`

Nota: este script usa solo una variable de entorno (`BASE_URL`) y no requiere API key ni codigo OAuth.
Nota: `BASE_URL` es obligatoria. El script no usa fallback a localhost.

## 5. Ejecucion Artillery para WebSocket

Instalar (si no esta):

`pnpm add -D artillery artillery-engine-socketio-v3`

Ejecutar:

`WS_BASE_URL=https://tu-host WS_TOKEN=jwt_valido WS_ID_DEPARTAMENTO=1 pnpm exec artillery run tests/performance/artillery-socketio.yml`

Nota: `WS_BASE_URL`, `WS_TOKEN` y `WS_ID_DEPARTAMENTO` son obligatorias. El script no usa fallback a localhost.

## 6. Metricas recomendadas para el informe

1. p95 de latencia por endpoint.
2. Throughput (req/s o conexiones/s).
3. Error rate total.
4. Maximo de usuarios/conexiones concurrentes sostenidas sin degradacion critica.

## 7. Nota de interpretacion

El script K6 considera exitoso todo codigo menor a 500 para medir estabilidad de infraestructura. Para validacion funcional detallada (casos de negocio) usar caja negra con datos validos en Swagger/Scalar.
