# Informe de Prueba de Estres K6 (Produccion)

## 1. Datos de ejecucion

`| Campo | Valor |
| --- | --- |
| Fecha | 2026-04-11 |
| Entorno | Produccion |
| Base URL | https://jupiter-guardian-api.policia.bo/api |
| Script | tests/performance/k6-http-stress.js |
| Duracion | ~5m20s |
| Max VUs | 165 |

## 1.1 Justificacion del escenario (165 VUs)

La prueba modela presion concurrente por criticidad de endpoint, no un conteo exacto de usuarios humanos simultaneos.

| Componente | VUs maximos | Justificacion |
| --- | ---: | --- |
| `/departamentos/encontrar` | 100 | Endpoint publico de mayor uso esperado |
| `/victimas/verificar-denuncia` | 40 | Flujo de validacion relevante para activacion |
| `/victimas/verificar` | 25 | Consulta complementaria de verificacion |
| **Total** | **165** | Suma de picos por escenario |

## 2. Criterio de evaluacion

1. Criterio de estabilidad: respuestas 2xx-4xx se consideran esperadas.
2. Errores 5xx o fallos de red se consideran falla de infraestructura.
3. Objetivo de latencia: `http_req_duration p95 < 3000 ms`.

## 3. Resultados (produccion)

### 3.1 Thresholds

| Threshold | Resultado |
| --- | --- |
| `dept_public_failures < 0.05` | PASS (0.00%) |
| `verificar_denuncia_failures < 0.05` | PASS (1.46%) |
| `verificar_victima_failures < 0.05` | PASS (0.00%) |
| `http_req_failed < 0.05` | PASS (0.18%) |
| `http_req_duration p95 < 3000 ms` | PASS (900.93 ms) |

### 3.2 Metricas HTTP globales

| Metrica | Valor |
| --- | ---: |
| `http_reqs` | 55600 |
| `http_req_failed` | 0.18% (102/55600) |
| `http_req_duration avg` | 291.53 ms |
| `http_req_duration p95` | 900.93 ms |
| `http_req_duration p90` | 585.91 ms |

### 3.3 Metricas por endpoint

| Endpoint | Failures | Promedio | p95 |
| --- | ---: | ---: | ---: |
| `GET /departamentos/encontrar` | 0.00% | 211.79 ms | 507.10 ms |
| `GET /victimas/verificar-denuncia` | 1.46% (102/6948) | 738.02 ms | 1470.06 ms |
| `GET /victimas/verificar` | 0.00% | 307.94 ms | 734.68 ms |

## 4. Evidencia de ejecucion (captura textual)

```text
THRESHOLDS:
- http_req_duration: p(95)=900.93ms (PASS)
- http_req_failed: 0.18% (PASS)
- dept_public_failures: 0.00% (PASS)
- verificar_denuncia_failures: 1.46% (PASS)
- verificar_victima_failures: 0.00% (PASS)

HTTP:
- http_reqs: 55600
- avg: 291.53ms
- p95: 900.93ms
```

## 5. Conclusion

1. En produccion, el servicio cumple el objetivo de p95 < 3 segundos con holgura.
2. No se observaron errores de infraestructura significativos bajo el perfil de 165 VUs.
3. El endpoint con mayor sensibilidad fue `verificar-denuncia`, aunque permanecio dentro de umbral aceptable.

## 6. Comando ejecutado

`BASE_URL=https://jupiter-guardian-api.policia.bo/api k6 run tests/performance/k6-http-stress.js`
