# Informe Formal de Pruebas de Caja Blanca

Fecha: 2026-04-13  
Proyecto: Alertas API (NestJS)

## 1. Objetivo

Verificar, mediante pruebas unitarias de caja blanca, la logica interna de casos de uso criticos distribuidos en cuatro incrementos funcionales del sistema.

## 2. Alcance

Las pruebas cubren rutas de ejecucion internas, validaciones, manejo de errores y contratos de colaboracion con dependencias externas simuladas (mocks).

## 3. Artefactos de prueba

1. Intercambio OAuth 2.0 con KERBEROS y decodificacion de token.
2. Validacion CI/CUD contra JUPITER.
3. Verificacion OTP correcta y generacion de API Key.
4. Resolucion de jurisdiccion por GPS (GeoServer).
5. Creacion de alerta con estado PENDIENTE.
6. Notificacion a operadores conectados.
7. Asignacion de investigador a victima.
8. Desasignacion de investigador anterior.
9. Suspension de cuenta y deshabilitacion de API Key.
10. Calculo de estadisticas operativas y tiempos de respuesta.
11. Consulta de distribucion geografica de alertas.
12. Verificacion de estado de la plataforma.

## 4. Definiciones de resultado (Jest)

| Termino | Definicion formal |
|---|---|
| Suite | Conjunto de casos de prueba agrupados en un archivo o bloque `describe`. |
| Test | Caso de prueba individual definido con `it` o `test`. |
| PASS | Estado de prueba aprobada: el comportamiento real coincide con el esperado. |

### 4.1 Explicacion en palabras simples

Si no eres tecnico, puedes leerlo asi:

| Termino | Que significa en sencillo |
|---|---|
| Suite | Un grupo de pruebas de un archivo. En este informe hay 12 suites (una por artefacto de prueba). |
| Test | Una verificacion puntual dentro de una suite. Ejemplo: "si el codigo OTP es invalido, debe fallar". |
| PASS | La prueba salio bien. Se comporto como se esperaba. |
| FAIL | La prueba salio mal. El sistema no respondio como se esperaba. |
| Coverage | Porcentaje de codigo que realmente se ejecuto durante las pruebas. |

Regla rapida para interpretar resultados:

1. Si todas las suites estan en `PASS`, los servicios probados funcionan segun los casos definidos.
2. Si todos los tests estan en `PASS`, no hubo fallas en los escenarios evaluados.
3. Si el `exit code` es `0`, la ejecucion termino correctamente.

Ejemplo con este informe:

1. Suites aprobadas: 12 de 12.
2. Tests aprobados: 54 de 54.
3. Conclusion sencilla: las pruebas de caja blanca salieron correctas.

## 5. Matriz de casos por servicio

| Servicio | Caso validado | Resultado esperado |
|---|---|---|
| Activacion de cuenta | Intercambio OAuth 2.0 con KERBEROS y decodificacion de token | Token decodificado y claims validados |
| Activacion de cuenta | Validacion CI/CUD contra JUPITER | Retorno de datos de victima validos |
| Activacion de cuenta | Verificacion OTP correcta y generacion de API Key | API Key generada y hash persistido |
| Emision de alerta | Resolucion de jurisdiccion por GPS (GeoServer) | Obtencion de municipio/departamento |
| Emision de alerta | Creacion de alerta con estado `PENDIENTE` | Persistencia correcta y evento de dominio |
| Emision de alerta | Notificacion a operadores conectados | Emision por WebSocket y notificacion push |
| Seguimiento de casos | Asignacion de investigador a victima | Registro de asignacion activa |
| Seguimiento de casos | Desasignacion de investigador anterior | Eliminacion de asignacion activa |
| Seguimiento de casos | Suspension de cuenta y deshabilitacion de API Key | Cambio de estado y notificacion a victima |
| Estadisticas y monitoreo | Calculo de estadisticas operativas y tiempos de respuesta | Metricas generales calculadas para operacion y tiempos |
| Estadisticas y monitoreo | Consulta de distribucion geografica de alertas | Alertas agrupadas por departamento |
| Estadisticas y monitoreo | Verificacion de estado de la plataforma | Salud operativa de BD, Redis, WebSocket, PM2 y servicios externos |

### 5.1 Detalle de lo probado por suite

#### Suite 1: Intercambio OAuth 2.0 con KERBEROS y decodificacion de token (4 tests)

1. Valida intercambio de codigo con Kerberos, verificacion JWT y registro de usuario web.
2. Valida manejo de token expirado con `UnauthorizedException`.
3. Valida manejo de JWT invalido con `BadRequestException`.
4. Valida error por datos requeridos faltantes en el token decodificado.

#### Suite 2: Validacion CI/CUD contra JUPITER (2 tests)

5. Valida respuesta correcta de victima cuando JUPITER retorna datos.
6. Valida `NotFoundException` cuando JUPITER no retorna victima.

#### Suite 3: Verificacion OTP correcta y generacion de API Key (11 tests)

7. Valida OTP por WhatsApp y retorna API Key.
8. Valida `NotFoundException` cuando la victima no existe.
9. Valida `BadRequestException` cuando WhatsApp no tiene celular (blanco).
10. Valida `BadRequestException` cuando WhatsApp no tiene celular (nullish).
11. Valida `BadRequestException` por codigo WhatsApp invalido.
12. Valida flujo por email con normalizacion y actualizacion de API Key.
13. Valida `BadRequestException` en canal email sin correo (blanco).
14. Valida `BadRequestException` en canal email sin correo (nullish).
15. Valida `BadRequestException` por codigo email invalido.
16. Valida notificacion de cierre remoto cuando hay sesion activa y token push.
17. Valida tolerancia a fallo push con registro de warning.

#### Suite 4: Resolucion de jurisdiccion por GPS (GeoServer) (1 test)

18. Valida consulta a GeoServer y retorno de municipio/departamento.

#### Suite 5: Creacion de alerta con estado PENDIENTE (3 tests)

19. Valida creacion de alerta pendiente, registro de evento y notificacion operativa.
20. Valida fallback a municipio de victima cuando no llega ubicacion GPS.
21. Valida `BadRequestException` cuando no se puede determinar departamento.

#### Suite 6: Notificacion a operadores conectados (3 tests)

22. Valida emision por WebSocket y envio push cuando hay tokens FCM.
23. Valida escenario sin tokens FCM (solo notificacion WebSocket).
24. Valida continuidad del flujo cuando falla el envio push.

#### Suite 7: Asignacion de investigador a victima (3 tests)

25. Valida asignacion exitosa cuando no existe asignacion activa igual.
26. Valida `NotFoundException` cuando la victima no existe.
27. Valida `BadRequestException` cuando el investigador ya esta asignado.

#### Suite 8: Desasignacion de investigador anterior (3 tests)

28. Valida desasignacion exitosa de investigador activo.
29. Valida `NotFoundException` cuando la victima no existe.
30. Valida `NotFoundException` cuando no existe investigador activo.

#### Suite 9: Suspension de cuenta y deshabilitacion de API Key (4 tests)

31. Valida suspension con notificacion push cuando existe token FCM.
32. Valida `NotFoundException` cuando no existe victima.
33. Valida suspension sin push cuando no hay token FCM.
34. Valida que fallo push no interrumpe la suspension de cuenta.

#### Suite 10: Calculo de estadisticas operativas y tiempos de respuesta (1 test)

35. Valida calculo de metricas generales a partir de datos crudos del repositorio.

#### Suite 11: Consulta de distribucion geografica de alertas (2 tests)

36. Valida agrupacion por departamento incluyendo departamentos con valor 0.
37. Valida acumulacion en departamento `Desconocido` cuando no hay mapeo geografico.

#### Suite 12: Verificacion de estado de la plataforma (17 tests agrupados en 5 caminos)

38. Camino PM2: valida conexion/no conexion con PM2, mapeo de estados y formato de uptime/recursos.
39. Camino servidor WebSocket: valida estado, conteo de operadores y agrupacion por departamento.
40. Camino PostgreSQL: valida ruta exitosa y ruta de error.
41. Camino Redis: valida rutas conectado/desconectado y manejo de error de lectura.
42. Camino servicios externos: valida rutas `online/offline` y fallo de red.

### 5.2 Caminos de ejecucion cubiertos (caja blanca)

En esta seccion, camino se usa en sentido de caja blanca como camino de ejecucion sobre decisiones internas (`if/else`, validaciones y manejo de excepciones).

1. OAuth/Kerberos: camino de token valido y caminos de excepcion por token invalido/expirado.
2. JUPITER: camino con victima encontrada y camino sin resultado.
3. OTP/API Key: caminos por canal (WhatsApp/Email), datos invalidos y fallo de notificacion.
4. Jurisdiccion GPS: camino con respuesta geografica valida.
5. Creacion de alerta: camino normal, camino con fallback y camino de error por departamento ausente.
6. Notificacion operativa: camino con push, camino sin push y camino con fallo push tolerado.
7. Asignacion: camino exitoso, camino sin victima y camino de duplicidad.
8. Desasignacion: camino exitoso, camino sin victima y camino sin asignacion activa.
9. Suspension: camino con push, camino sin push y camino con fallo push tolerado.
10. Metricas operativas: camino de agregacion de datos del repositorio.
11. Distribucion geografica: camino con departamentos mapeados y camino `Desconocido`.
12. Estado de plataforma (soporte operativo): caminos de estado para PostgreSQL, Redis, PM2, WebSocket y servicios externos.

## 6. Cobertura tecnica relevante

Fuente de estos porcentajes: archivo de cobertura del proyecto `coverage/lcov.info` generado en la ultima corrida.

| Caso de uso evaluado | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| Decodificar token (autenticacion) | 96.77% | 100.00% | 100.00% | 96.55% |
| Crear alerta | 100.00% | 92.30% | 100.00% | 100.00% |
| Notificar creacion de alerta | 100.00% | 100.00% | 100.00% | 100.00% |
| Obtener metricas generales | 100.00% | 100.00% | 100.00% | 100.00% |
| Obtener alertas por ubicacion | 100.00% | 100.00% | 100.00% | 100.00% |
| Monitor de sistema | 96.07% | 77.96% | 92.85% | 97.10% |
| Encontrar departamento | 100.00% | 100.00% | 100.00% | 100.00% |
| Verificar denuncia | 100.00% | 100.00% | 100.00% | 100.00% |
| Asignar investigador | 100.00% | 100.00% | 100.00% | 100.00% |
| Desasignar investigador | 100.00% | 100.00% | 100.00% | 100.00% |
| Verificar codigo | 100.00% | 100.00% | 100.00% | 100.00% |
| Suspender cuenta | 100.00% | 100.00% | 100.00% | 100.00% |

Cobertura global de la corrida:

1. Statements: 99.53%
2. Branches: 87.27%
3. Functions: 96.36%
4. Lines: 98.64%

### 6.1 Significado de los porcentajes de cobertura

| Metrica | Significado |
|---|---|
| Statements | Porcentaje de sentencias/instrucciones del codigo que fueron ejecutadas por las pruebas. |
| Branches | Porcentaje de ramas de decision cubiertas (por ejemplo, caminos `if/else`, `switch`, condiciones verdaderas y falsas). |
| Functions | Porcentaje de funciones o metodos invocados al menos una vez durante la ejecucion de pruebas. |
| Lines | Porcentaje de lineas de codigo ejecutadas por las pruebas. |

Interpretacion general:

1. Un porcentaje alto indica mayor evidencia de ejecucion sobre la logica evaluada.
2. `Branches` suele ser el indicador mas estricto para caja blanca, porque valida caminos alternos de decision.
3. La combinacion de las cuatro metricas permite una evaluacion mas completa que usar solo una.

## 7. Evidencia de ejecucion

Comando ejecutado:

pnpm run test:captura

Detalle tecnico del script ejecutado (`test:captura`):

Ejecucion en modo silencioso con cobertura enfocada unicamente a los casos de uso evaluados en los cuatro incrementos.

Resultado consolidado:

| Indicador | Valor |
|---|---:|
| Suites ejecutadas | 12 |
| Suites aprobadas | 12 |
| Tests ejecutados | 54 |
| Tests aprobados | 54 |
| Exit code | 0 |

Suites aprobadas en la re-ejecucion final:

1. PASS Intercambio OAuth 2.0 con KERBEROS y decodificacion de token.
2. PASS Validacion CI/CUD contra JUPITER.
3. PASS Verificacion OTP correcta y generacion de API Key.
4. PASS Resolucion de jurisdiccion por GPS (GeoServer).
5. PASS Creacion de alerta con estado PENDIENTE.
6. PASS Notificacion a operadores conectados.
7. PASS Asignacion de investigador a victima.
8. PASS Desasignacion de investigador anterior.
9. PASS Suspension de cuenta y deshabilitacion de API Key.
10. PASS Calculo de estadisticas operativas y tiempos de respuesta.
11. PASS Consulta de distribucion geografica de alertas.
12. PASS Verificacion de estado de la plataforma.

## 8. Conclusiones

1. Se aplicaron pruebas de caja blanca a cuatro incrementos funcionales, verificando la lógica interna de servicios críticos.
2. La ejecución final obtuvo aprobación completa (PASS) en 12 suites y 54 tests.
3. La evidencia de cobertura confirma ejecución efectiva sobre la lógica crítica evaluada, con `Branches` global por encima del umbral requerido (87.27% > 85.5%).
