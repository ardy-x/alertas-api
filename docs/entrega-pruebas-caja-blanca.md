# Informe Formal de Pruebas de Caja Blanca

Fecha: 2026-04-11  
Proyecto: Alertas API (NestJS)

## 1. Objetivo

Verificar, mediante pruebas unitarias de caja blanca, la logica interna de tres servicios funcionales del sistema:

1. Servicio de activacion de cuenta.
2. Servicio de emision de alerta.
3. Servicio de autenticacion.

## 2. Alcance

Las pruebas cubren rutas de ejecucion internas, validaciones, manejo de errores y contratos de colaboracion con dependencias externas simuladas (mocks).

## 3. Artefactos de prueba

1. src/autenticacion/aplicacion/casos-uso/activacion-cuenta.servicio.spec.ts
2. src/alertas/aplicacion/casos-uso/emision-alerta.servicio.spec.ts
3. src/autenticacion/aplicacion/casos-uso/autenticacion.servicio.spec.ts

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
| Suite | Un grupo de pruebas de un archivo. En este informe hay 3 suites (una por servicio). |
| Test | Una verificacion puntual dentro de una suite. Ejemplo: "si el codigo OTP es invalido, debe fallar". |
| PASS | La prueba salio bien. Se comporto como se esperaba. |
| FAIL | La prueba salio mal. El sistema no respondio como se esperaba. |
| Coverage | Porcentaje de codigo que realmente se ejecuto durante las pruebas. |

Regla rapida para interpretar resultados:

1. Si todas las suites estan en `PASS`, los servicios probados funcionan segun los casos definidos.
2. Si todos los tests estan en `PASS`, no hubo fallas en los escenarios evaluados.
3. Si el `exit code` es `0`, la ejecucion termino correctamente.

Ejemplo con este informe:

1. Suites aprobadas: 3 de 3.
2. Tests aprobados: 10 de 10.
3. Conclusion sencilla: las pruebas de caja blanca salieron correctas.

## 5. Matriz de casos por servicio

| Servicio | Caso validado | Resultado esperado |
|---|---|---|
| Activacion de cuenta | Validacion CI/CUD contra JUPITER | Retorno de datos de victima validos |
| Activacion de cuenta | Generacion de OTP | Codigo numerico de 6 digitos |
| Activacion de cuenta | Persistencia de OTP en Redis | Registro con TTL de 600 segundos |
| Activacion de cuenta | Verificacion OTP correcta | Generacion de API Key y persistencia de hash |
| Activacion de cuenta | OTP invalido/expirado | Excepcion `BadRequestException` |
| Activacion de cuenta | Victima inexistente | Excepcion `NotFoundException` |
| Emision de alerta | Resolucion de jurisdiccion por GPS (GeoServer) | Obtencion de municipio/departamento |
| Emision de alerta | Creacion de alerta | Estado `PENDIENTE` persistido |
| Emision de alerta | Notificacion operativa | Emision de evento de notificacion |
| Emision de alerta | Jurisdiccion no disponible | Excepcion `BadRequestException` |
| Autenticacion | Intercambio OAuth 2.0 con Kerberos | Recepcion de token |
| Autenticacion | Verificacion JWT | Token validado con clave publica |
| Autenticacion | Extraccion de rol | Rol de usuario mapeado correctamente |
| Autenticacion | Token expirado | Excepcion `UnauthorizedException` |
| Autenticacion | Token invalido | Excepcion `BadRequestException` |

## 6. Cobertura tecnica relevante

Fuente de estos porcentajes: archivo de cobertura del proyecto `coverage/lcov.info` generado en la ultima corrida.

| Archivo de produccion | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| src/victimas/aplicacion/casos-uso/verificar-denuncia.use-case.ts | 87.50% | 0.00% | 100.00% | 87.50% |
| src/victimas/aplicacion/casos-uso/validacion/solicitar-codigo.use-case.ts | 55.22% | 26.09% | 80.00% | 55.22% |
| src/victimas/aplicacion/casos-uso/validacion/verificar-codigo.use-case.ts | 66.67% | 47.06% | 100.00% | 66.67% |
| src/alertas/aplicacion/casos-uso/crear-alerta.use-case.ts | 91.84% | 61.54% | 100.00% | 91.84% |
| src/autenticacion/aplicacion/casos-uso/decodificar-token.use-case.ts | 93.10% | 83.33% | 100.00% | 93.10% |

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

`pnpm jest activacion-cuenta.servicio.spec.ts emision-alerta.servicio.spec.ts autenticacion.servicio.spec.ts --runInBand --coverage`

Resultado consolidado:

| Indicador | Valor |
|---|---:|
| Suites ejecutadas | 3 |
| Suites aprobadas | 3 |
| Tests ejecutados | 10 |
| Tests aprobados | 10 |
| Exit code | 0 |

Suites aprobadas en la re-ejecucion final:

1. PASS src/autenticacion/aplicacion/casos-uso/activacion-cuenta.servicio.spec.ts
2. PASS src/alertas/aplicacion/casos-uso/emision-alerta.servicio.spec.ts
3. PASS src/autenticacion/aplicacion/casos-uso/autenticacion.servicio.spec.ts

## 8. Conclusiones

1. Los tres servicios definidos en el alcance fueron validados con enfoque de caja blanca.
2. Se obtuvo aprobacion completa de ejecucion (`PASS`) en suites y tests.
3. Las metricas de cobertura muestran alta verificacion de la logica principal en los casos de uso criticos evaluados.
