---
title: "JWT.io: Decodifica cualquier token de autenticación al instante, sin instalar nada"
description: "JWT.io es la herramienta de referencia en el navegador para decodificar y verificar JSON Web Tokens — sin registro, sin instalación, todo el procesamiento ocurre en tu navegador."
publishedAt: 2026-03-21
author: "nologin.tools"
tags: ["tools", "review", "development", "security"]
featured: false
heroImageQuery: "JSON web token authentication security developer"
locale: es
originalSlug: jwt-io
sourceHash: cbd8ae0cca9dac2a
---

![Hero image](/blog/images/jwt-io/hero.jpg)

Hay un hecho que sorprende a muchos desarrolladores: cada JWT que recibes de un servidor de autenticación no está cifrado por defecto — solo está *firmado*. Eso significa que la cabecera y el payload son texto plano codificado en Base64 que cualquiera puede leer. Lo único que protege la integridad del token es la firma, que prueba que no ha sido alterado.

Sabiendo esto, lo lógico sería que cada desarrollador tuviera una forma rápida de inspeccionar un JWT en cualquier momento. Sin embargo, cuando aparece un misterioso error `401 Unauthorized` a las 2 de la madrugada, la reacción más común es abrir un archivo nuevo, escribir `atob()`, dividir por puntos e intentar parsear el JSON a mano — cuando existe una opción mucho más rápida.

[JWT.io](https://jwt.io) es esa opción. Una herramienta de una sola página que hace una sola cosa bien: te permite pegar cualquier JWT y ver de inmediato su contenido, verificar su firma y entender su estructura. Sin cuenta. Sin instalación. Todo el decodificado ocurre en tu navegador.

## ¿Qué es un JSON Web Token?

Antes de ver la herramienta, conviene entender qué estás decodificando exactamente.

Un JSON Web Token es una cadena compacta y segura para URLs que representa reclamaciones entre dos partes. En la práctica, es lo que tu servidor te entrega tras el login y que incluyes en cada petición posterior como prueba de identidad. La mayoría de las APIs REST y las single-page apps los utilizan.

Un JWT tiene exactamente tres partes, separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

- **Header** (primer segmento): algoritmo y tipo de token — p. ej. `{"alg": "HS256", "typ": "JWT"}`
- **Payload** (segundo segmento): las reclamaciones en sí — ID de usuario, roles, expiración, y todo lo que tu app necesite incluir
- **Signature** (tercer segmento): firma HMAC o RSA sobre los dos primeros segmentos

La cabecera y el payload están codificados en Base64URL, no cifrados. Cualquiera que intercepte el token puede leer esas dos partes. La firma es lo que impide la manipulación: sin la clave secreta, no puedes forjar una firma válida.

Por eso importa poder leer un JWT rápidamente durante el desarrollo y la depuración: quieres confirmar que las reclamaciones correctas están en el payload, comprobar el timestamp de expiración (`exp`), verificar que el algoritmo coincide con lo que espera tu backend, y más.

## Cómo funciona JWT.io

Visita [jwt.io](https://jwt.io) y llegas directamente al debugger — sin página de bienvenida, sin marketing, sin formulario de registro. A la izquierda hay un área de texto grande para tu token codificado, y a la derecha tres paneles de colores que muestran la cabecera decodificada, el payload y la sección de verificación de firma.

Pega un JWT en el panel izquierdo y la salida decodificada aparece al instante. Los paneles utilizan código de colores: rojo/rosa para la parte de la cabecera, morado para el payload y azul para la firma — coincidiendo con el color de cada segmento separado por puntos en la entrada.

El panel del payload muestra tus reclamaciones en JSON formateado, legible de un vistazo:

```json
{
  "sub": "user_8f3a2c",
  "email": "jane@example.com",
  "role": "admin",
  "iat": 1742568000,
  "exp": 1742654400
}
```

Para la verificación de la firma, introduces tu secreto (para algoritmos HMAC como HS256) o pegas una clave pública (para RS256, ES256). La herramienta muestra el indicador "Signature Verified" o "Invalid Signature". Esto es genuinamente útil en trabajos de integración: si estás depurando una llamada entre servicios y necesitas confirmar que un token fue firmado con la clave esperada, lo haces en segundos.

## Por qué importa el procesamiento en el cliente

Pegar tokens de autenticación en herramientas web aleatorias es un riesgo de seguridad real — y los desarrolladores tienen razón en ser precavidos. Muchas "herramientas online" para decodificar JWTs envían tu token a un servidor, lo registran y potencialmente lo exponen.

JWT.io es diferente. Todo el decodificado y la verificación se ejecutan en tu navegador usando JavaScript. No se transmite ningún dato a ningún servidor externo cuando decodificas un token. Puedes verificarlo tú mismo: abre la pestaña de red del navegador, pega un token y observa — no se lanza ninguna petición de red.

No es una afirmación de marketing; es un comportamiento verificable. La herramienta es open source, y la arquitectura de procesamiento en el cliente significa que tus tokens permanecen en tu máquina.

Dicho esto, hay una nota de seguridad práctica que vale la pena tener en mente: evita pegar tokens de producción con datos sensibles de usuarios en cualquier herramienta web desde un ordenador compartido o en el que no confíes. Para tokens de desarrollo, staging o pruebas, JWT.io es completamente seguro.

## Algoritmos soportados

JWT.io soporta la gama completa de algoritmos que encontrarás en sistemas reales:

| Algoritmo | Tipo | Uso común |
|-----------|------|------------|
| HS256 / HS384 / HS512 | HMAC + SHA | Apps de servicio único, secreto compartido |
| RS256 / RS384 / RS512 | Firma RSA | Sistemas distribuidos, verificación con clave pública |
| ES256 / ES384 / ES512 | ECDSA | Tokens compactos, IoT |
| PS256 / PS384 / PS512 | RSA-PSS | Requisitos de alta seguridad |

Para algoritmos HMAC, proporcionas el secreto compartido para verificar la firma. Para algoritmos asimétricos (RS*, ES*, PS*), pegas la clave pública en formato PEM. La herramienta gestiona el parseo y muestra el resultado de inmediato.

## Casos de uso prácticos

**Depuración de fallos de autenticación**: Cuando un usuario informa de que no puede acceder a una ruta protegida, la primera pregunta suele ser "¿qué dice exactamente su token?" Decodificarlo en JWT.io lleva tres segundos. Puedes comprobar si el token ha expirado, si la reclamación de rol está configurada correctamente y si la audiencia (`aud`) coincide con lo que espera tu API.

**Pruebas de integración**: Si te conectas a un proveedor de identidad externo — Auth0, Okta, Cognito, Keycloak — los tokens que emiten pueden contener reclamaciones que necesitas mapear a tu propio modelo de usuario. Decodificar un token de muestra te permite ver exactamente qué campos existen antes de escribir una sola línea de código.

**Aprendizaje y onboarding**: Para desarrolladores que se inician en la autenticación, JWT.io es una herramienta de enseñanza excelente. Ver el payload decodificado junto a la cadena codificada hace que la codificación Base64URL sea concreta, no abstracta. Es uno de esos casos en que el momento «¡ajá!» ocurre en el primer uso.

**Comprobaciones rápidas**: Antes de desplegar un cambio en tu código de generación de tokens, pega un ejemplo de salida en JWT.io para confirmar que el payload contiene los campos correctos en el formato correcto.

Para equipos que hacen trabajo intensivo con APIs — elaborar peticiones, probar endpoints, gestionar colecciones — [Hoppscotch](/tool/hoppscotch-io) encaja muy bien junto a JWT.io. Puedes obtener un token de un endpoint de autenticación en Hoppscotch, decodificarlo en JWT.io para comprobar las reclamaciones y luego usar el token en peticiones posteriores. Las dos herramientas se complementan en un flujo de trabajo puramente en el navegador.

## Comparando alternativas

Antes de que existiera JWT.io (o cuando los desarrolladores no lo conocen), surgen varias alternativas:

**Decodificación manual de Base64**: Dividir el token por `.`, ejecutar `atob()` en cada segmento en la consola del navegador y parsear el JSON. Funciona, pero lleva más tiempo, maneja de forma torpe las variantes Base64 seguras para URLs y no ofrece verificación de firma.

**Escribir un script rápido**: Importar una librería JWT y escribir una llamada de verificación está bien para código de producción, pero es excesivo para una sesión de depuración rápida. Además, requiere tener configurado un entorno local.

**Otros decodificadores online**: Existen varios, pero muchos no verifican firmas, no soportan la gama completa de algoritmos o envían tu token a un backend. La combinación de soporte completo de algoritmos, procesamiento en el cliente y salida visual clara de JWT.io es difícil de superar.

Para tareas de codificación y transformación de datos de propósito general — Base64, hexadecimal, codificación URL y cientos más — [IT Tools](/tool/it-tools-tech) merece estar en tus favoritos junto a JWT.io. Es otra herramienta sin login y basada en el navegador con una amplia gama de utilidades para el desarrollo diario.

## Una nota sobre la especificación JWT

JWT está definido en [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519), con los algoritmos de firma cubiertos en [RFC 7515 (JWS)](https://datatracker.ietf.org/doc/html/rfc7515). Si alguna vez necesitas entender por qué existe una reclamación particular o cómo funciona la codificación a nivel de bytes, esos documentos son la fuente autoritativa.

La especificación deja algo muy claro: JWT es un formato, no un protocolo de seguridad. Usar JWTs no hace que tu autenticación sea segura automáticamente. Los tiempos de expiración cortos, la correcta verificación de la firma y el manejo cuidadoso del campo `alg` (para prevenir ataques de confusión de algoritmos) siguen siendo tu responsabilidad. JWT.io te ayuda a inspeccionar y verificar tokens rápidamente, pero entender la especificación es lo que previene los bugs que importan.

## Más allá del debugger

El sitio de JWT.io también mantiene una lista de librerías JWT para todos los principales lenguajes de programación — Node.js, Python, Go, Java, Ruby, PHP, .NET y muchos otros. Cada entrada de librería incluye información verificada sobre qué algoritmos soporta. Si estás eligiendo una librería para un proyecto nuevo, esta página de referencia puede ahorrarte el ir y volver a la documentación.

El debugger en sí es el plato fuerte, pero el directorio de librerías es un recurso secundario muy útil cuando configuras el manejo de JWT desde cero.

---

La próxima vez que estés mirando una cadena de token opaca preguntándote qué hay dentro, pégala en [jwt.io](https://jwt.io). El resultado decodificado suele responder tu pregunta en menos de diez segundos. Sin cuenta, sin instalar nada, sin enviar datos a ningún servidor.

A medida que más servicios adoptan la autenticación basada en tokens y los sistemas distribuidos donde la confianza debe establecerse sin sesiones compartidas, herramientas como JWT.io pasan de ser una referencia ocasional a formar parte del kit de trabajo diario. Guárdala en favoritos ahora — la usarás antes de lo que crees.
