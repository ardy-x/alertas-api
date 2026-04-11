# Informe de Prueba de Estres WebSocket (Produccion)

## 1. Datos de ejecucion

| Campo | Valor |
| --- | --- |
| Fecha | 2026-04-11 |
| Entorno | Produccion |
| WS URL | https://jupiter-guardian-api.policia.bo |
| Script | tests/performance/artillery-socketio.yml |
| Motor | artillery-engine-socketio-v3 |
| Duracion total | 5m12s |
| VUs creados | 1440 |

## 2. Perfil de carga

| Fase | Duracion | Arrival Rate |
| --- | ---: | ---: |
| calentamiento | 60s | 1 |
| operacion_real | 180s | 5 |
| pico_controlado | 60s | 8 |

### 2.1 Formula de usuarios creados

Para Artillery en escenarios por fases, la cantidad estimada de usuarios creados se calcula como:

$$
vusers.created \approx \sum_{i=1}^{n}(arrivalRate_i \times duracion_i\_en\_segundos)
$$

Aplicado al perfil ejecutado:

$$
(1 \times 60) + (5 \times 180) + (8 \times 60) = 1440
$$

Este valor coincide con el resultado observado en la corrida (`vusers.created = 1440`).

## 3. Resultados principales

### 3.1 Resumen final

| Metrica | Valor |
| --- | ---: |
| vusers.created | 1440 |
| vusers.completed | 1429 |
| vusers.failed | 11 |
| tasa de exito | 99.24% |
| tasa de fallo | 0.76% |
| errors.timeout | 0 |
| errors.xhr poll error | 5 |
| errors.xhr post error | 6 |

### 3.2 Latencia de sesion

| Metrica | Valor |
| --- | ---: |
| min | 4166 ms |
| media | 4652.6 ms |
| mediana | 4231.1 ms |
| p95 | 4676.2 ms |
| p99 | 14332.3 ms |
| max | 53398.4 ms |

## 4. Interpretacion tecnica

1. El handshake y la autenticacion de operadores funcionan de forma consistente.
2. Con perfil moderado, el canal WebSocket mantiene estabilidad operativa (99.24% de exito).
3. Los errores observados son bajos y aislados (11 fallos de 1440 sesiones).
4. La latencia de sesion se mantiene en rangos aceptables para monitoreo en tiempo real.

## 5. Evidencia de ejecucion (captura textual)

```text
Summary report:
- vusers.created: 1440
- vusers.completed: 1429
- vusers.failed: 11
- errors.xhr poll error: 5
- errors.xhr post error: 6
- session_length p95: 4676.2 ms
```

## 6. Recomendaciones

1. Mantener este perfil como prueba base de aceptacion para produccion.
2. Ejecutar la misma prueba de forma periodica para detectar degradacion temprana.
3. Monitorear especialmente `errors.xhr poll error` y `session_length p95` como indicadores de salud.
4. Si el trafico crece, escalar gradualmente arrivalRate y registrar el nuevo punto de saturacion.

## 7. Comando ejecutado

`WS_BASE_URL=https://jupiter-guardian-api.policia.bo WS_ID_DEPARTAMENTO=1 WS_TOKEN=<token_valido> pnpm exec artillery run tests/performance/artillery-socketio.yml`
