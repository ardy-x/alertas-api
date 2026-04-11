# Informe Formal de Pruebas de Caja Negra (E2E)

Fecha: 2026-04-09  
Proyecto: Alertas API (NestJS)

## 1. Objetivo

Validar el comportamiento observable del sistema (entrada/salida), sin depender de la implementacion interna, para los flujos funcionales principales del dominio.

## 2. Metodologia de ejecucion

Las pruebas E2E de caja negra se ejecutaron desde la documentacion interactiva de API (Swagger + Scalar), verificando:

1. Codigo HTTP de respuesta.
2. Estructura y contenido de respuesta JSON.
3. Efecto funcional esperado sobre el flujo de negocio.

## 3. Matriz de casos de prueba

| Caso de prueba | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1. Activar cuenta con datos validos | CI y CUD validos | API Key generada | ✓ |
| 2. Emitir alerta con API Key valida | Coordenadas GPS | Alerta registrada | ✓ |
| 3. Autenticar usuario con codigo OAuth valido | Codigo OAuth, latitud y longitud validas | Token decodificado y rol de usuario obtenido | ✓ |

## 4. Trazabilidad de endpoints (referencia)

| Caso | Endpoint de referencia | Metodo |
|---|---|---|
| 1 | /victimas/verificar-denuncia y flujo /codigos/* | GET / POST |
| 2 | /alertas | POST |
| 3 | /autenticacion/decodificar-token | POST |

## 5. Criterio de aceptacion

Se considera aprobada la validacion E2E cuando:

1. El codigo de respuesta coincide con el esperado para el caso.
2. El contenido de respuesta cumple la regla funcional definida.
3. El resultado obtenido en la matriz se registra como conforme (✓).

## 6. Resultado consolidado

| Indicador | Valor |
|---|---:|
| Casos planificados | 3 |
| Casos ejecutados | 3 |
| Casos conformes | 3 |
| Porcentaje de conformidad | 100% |

## 7. Evidencia grafica (capturas)

Instruccion: coloca las imagenes en `docs/capturas/` y reemplaza cada ruta por tu archivo real.

### Figura 1. Caso 1 - Activar cuenta con datos validos

![Figura 1 - Activar cuenta valida](docs/capturas/caso-1-activar-cuenta-valida.png)

Descripcion sugerida: solicitud y respuesta en Swagger/Scalar mostrando CI/CUD validos y generacion de API Key.

### Figura 2. Caso 2 - Emitir alerta con API Key valida

![Figura 2 - Emitir alerta valida](docs/capturas/caso-2-emision-alerta-valida.png)

Descripcion sugerida: solicitud con coordenadas GPS y respuesta de alerta registrada.

### Figura 3. Caso 3 - Autenticar usuario con codigo OAuth valido

![Figura 3 - Autenticacion valida](docs/capturas/caso-3-autenticacion-valida.png)

Descripcion sugerida: solicitud de decodificacion de token y respuesta con rol de usuario.

## 8. Conclusion

La validacion de caja negra E2E confirma que los tres escenarios funcionales definidos presentan comportamiento conforme a los resultados esperados en el entorno de prueba documentado.
