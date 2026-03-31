---
title: "Tu navegador está filtrando datos — esto es lo que puedes hacer"
description: "Tu navegador expone tu IP real, GPU, fuentes tipográficas y zona horaria a cada sitio que visitas. Aquí te contamos qué se está filtrando y cómo evitarlo."
publishedAt: 2026-03-31
updatedAt: 2026-03-31
author: nologin.tools
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak surveillance"
locale: es
originalSlug: browser-leaking-data-how-to-stop-it
sourceHash: fd14e428ffc082f9
---

![Hero image](/blog/images/browser-leaking-data-how-to-stop-it/hero.jpg)

Abre una pestaña de incógnito. Sin cookies, sin historial, sin sesión iniciada. Te sientes anónimo.

Pero no lo eres. Ni de lejos.

La [investigación Panopticlick de la EFF](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) descubrió que **el 83,6% de los navegadores tiene una huella digital única** — suficiente para identificarte en cada sitio que visitas sin necesidad de guardar una sola cookie. Si añades extensiones del navegador, esa cifra sube hasta el 94,2%. El modo incógnito no hace nada al respecto. Borrar las cookies tampoco.

Aquí te explicamos qué se está filtrando realmente, y qué puedes hacer para evitarlo.

## Qué envía tu navegador en realidad

Cada vez que cargas una página, tu navegador revela una cantidad sorprendente de información sobre sí mismo. Antes de que JavaScript siquiera se ejecute, las cabeceras HTTP ya delatan el nombre y versión de tu navegador, tu sistema operativo, los idiomas preferidos y la compatibilidad con codificaciones. Todo esto ocurre de forma automática, sin avisos y sin tu consentimiento.

JavaScript lo empeora mucho más. Los sitios web pueden leer la resolución de tu pantalla (incluido el espacio que ocupa la barra de tareas), tu zona horaria exacta, el número de núcleos de tu CPU, la cantidad de RAM de tu dispositivo (redondeada a la potencia de dos más cercana, pero igualmente útil) y el esquema de colores que prefieres. Nada de esto requiere ningún permiso especial.

La cifra total es alarmante: las bibliotecas modernas de fingerprinting como FingerprintJS recopilan **más de 100 atributos individuales** por navegador. Combinados en un hash, generan un identificador que persiste entre sesiones, entre navegadores del mismo ordenador e incluso en el modo incógnito. FingerprintJS afirma tener un 99,5% de precisión a la hora de reidentificar a visitantes que regresan, aunque hayan borrado sus cookies.

La verdad incómoda es esta: la mayoría de las cosas que crees que te hacen "privado" en internet — borrar cookies, usar VPN, abrir incógnito — no tienen ningún efecto sobre el fingerprinting. Son soluciones a un problema diferente.

## El problema de WebRTC (y por qué tu VPN no ayuda)

WebRTC es la API del navegador que hace posibles las videollamadas: Google Meet, Discord, Zoom web. Funciona estableciendo conexiones directas entre navegadores, lo que significa que necesita conocer tu dirección de red real.

El problema es el siguiente: cualquier sitio web puede iniciar un intento de conexión WebRTC con unas pocas líneas de JavaScript, sin interacción del usuario y sin pedir permiso. Para encontrar la ruta más rápida entre pares, WebRTC usa un protocolo llamado ICE (Interactive Connectivity Establishment), que contacta con un servidor STUN público. La respuesta de ese servidor STUN incluye tu **IP pública real**.

Tu VPN no intercepta esto. El tráfico WebRTC usa UDP y se gestiona a nivel del sistema operativo de forma diferente al tráfico HTTP del navegador. La mayoría de las implementaciones de VPN simplemente no lo interceptan. Así que, incluso con una VPN activa, un sitio web puede ejecutar este código y descubrir tu IP real en menos de un segundo:

```js
const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
pc.createDataChannel("");
pc.createOffer().then(o => pc.setLocalDescription(o));
pc.onicecandidate = e => { /* tu IP real está en e.candidate.candidate */ };
```

Esto se denomina fuga de WebRTC, y está documentada en SDKs comerciales de fingerprinting, plataformas de publicidad programática y sistemas antifraude por igual.

**Cómo bloquearlo:** Firefox te permite desactivar WebRTC completamente estableciendo `media.peerconnection.enabled` en `false` dentro de `about:config`. Esto rompe las videollamadas en el navegador, así que implica un compromiso. La configuración avanzada de uBlock Origin incluye una opción para "Evitar que WebRTC filtre las direcciones IP locales", que es menos agresiva: bloquea la exposición de la IP local pero permite que WebRTC siga funcionando. Brave bloquea la filtración de IP local por defecto desde su panel de Escudos.

Puedes verificar si estás filtrando datos con [IPLeak](/tool/ipleak-net), que muestra todos los candidatos ICE de WebRTC que tu navegador expone en este momento.

## Fugas de DNS: el otro agujero en tu VPN

Cuando escribes un dominio en tu navegador, un resolvedor DNS lo convierte en una dirección IP. Si usas una VPN, esa consulta debería ir a través del túnel VPN hasta el resolvedor de tu proveedor de VPN, no al de tu ISP.

Una fuga de DNS ocurre cuando la consulta llega igualmente a tu ISP, revelándole todos los dominios que visitas independientemente de la VPN. El contenido de tu tráfico permanece cifrado, pero tu ISP puede ver que visitaste `ejemplo.com` el martes a las 21:14. Eso es suficiente para construir un perfil de comportamiento detallado.

Las fugas de DNS ocurren por varias razones técnicas aburridas. Windows tiene una función llamada Smart Multi-Homed Name Resolution que envía consultas DNS a **todos** los adaptadores de red disponibles simultáneamente y usa la respuesta más rápida. Esto significa que las consultas van tanto al resolvedor de la VPN como al del ISP al mismo tiempo. Muchos clientes VPN no gestionan esto correctamente.

IPv6 es otro culpable habitual. Muchas VPNs solo tunelizar tráfico IPv4. Si tu router y sistema operativo soportan IPv6, las consultas DNS por esa vía evitan completamente el túnel VPN.

Algunos ISPs empeoran la situación ejecutando proxies DNS transparentes: interceptan todo el tráfico UDP saliente en el puerto 53 y lo redirigen a sus propios resolvedores, aunque hayas configurado tu sistema para usar un servidor DNS diferente como 1.1.1.1 u 8.8.8.8.

**Para comprobar si tienes fugas:** Ejecuta una prueba extendida en [DNS Leak Test](/tool/dnsleaktest-com). Envía consultas DNS a un conjunto de subdominios únicos y observa qué resolvedores los recogen. Si los resultados muestran los servidores de tu ISP en lugar de los de tu proveedor de VPN, tienes una fuga confirmada.

La solución depende de tu configuración, pero habilitar DNS sobre HTTPS (DoH) en tu navegador es un buen punto de partida que evita por completo el resolvedor del sistema. En Firefox lo encuentras en Configuración → Privacidad y Seguridad → DNS sobre HTTPS. Ponlo en "Protección máxima" para evitar que use el resolvedor del sistema como alternativa.

## Canvas y audio fingerprinting (lo más inquietante)

Aunque tengas WebRTC bloqueado y el DNS asegurado, existe una categoría de fingerprinting que no depende en absoluto de tu red. Explota las pequeñas diferencias en cómo tu hardware renderiza gráficos.

El canvas fingerprinting funciona así: un script dibuja texto y formas en un elemento `<canvas>` invisible y luego lee los datos de píxeles resultantes. La salida varía — de forma sutil pero medible — según el modelo de GPU, la versión del controlador, el sistema operativo y el motor de renderizado de fuentes. macOS usa CoreText, Windows usa DirectWrite, Linux usa FreeType. Cada uno produce un antialiasing de subpíxel ligeramente diferente. Cada controlador de GPU tiene su propio comportamiento de redondeo de punto flotante. El artículo académico de 2014 ["The Web Never Forgets"](https://dl.acm.org/doi/10.1145/2660267.2660347) encontró canvas fingerprinting desplegado en el 5% de los 100.000 sitios más visitados en ese momento, y eso fue hace más de una década.

El audio fingerprinting es similar. Un script crea un `AudioContext`, hace pasar un oscilador por un analizador y lee los valores de salida. Las pequeñas diferencias de punto flotante en cómo tu hardware procesa el audio son suficientemente consistentes como para identificarte entre sesiones. No se requiere acceso al micrófono.

Estas dos señales combinadas — canvas + huella WebGL — aportan aproximadamente 15 o más bits de entropía cada una. Eso significa que aproximadamente 1 de cada 32.768 navegadores comparte la misma huella canvas de forma aislada. Combinada con tu resolución de pantalla, zona horaria, número de núcleos de CPU y User-Agent, llegas a una muestra de uno.

> La ironía incómoda es esta: tener extensiones de privacidad puede hacerte *más* identificable. Si eres una de las pocas personas que usa uBlock Origin en "modo medio" con un conjunto específico de extensiones, esa configuración en sí misma se convierte en una señal diferenciadora.

## Cómo comprobarte ahora mismo

Antes de cambiar nada, vale la pena ver qué estás exponiendo realmente.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) de la EFF es el mejor punto de partida. Compara tu navegador con una base de datos de millones de huellas reales y te dice lo única que es la tuya, con puntuaciones de entropía por atributo. "Tu navegador tiene una huella única" significa que puedes ser identificado. "Protección fuerte" significa que tu navegador se parece a muchos otros, que es el objetivo real.

[BrowserLeaks](/tool/browserleaks-com) profundiza más, con páginas separadas para fugas WebRTC, huellas canvas, detalles WebGL, fuentes instaladas, fingerprinting TLS y más. Ejecuta primero la prueba de WebRTC — es la sorpresa más probable.

[PrivacyTests](/tool/privacytests-org), creado por un exingeniero de privacidad de Firefox, compara navegadores entre sí en más de 20 pruebas de privacidad. No se trata tanto de analizar tu navegador específico, sino de comparar Chrome, Firefox, Brave, Safari y Tor Browser en escenarios estandarizados. Merece la pena leerlo antes de decidir si cambias de navegador.

## Qué ayuda realmente

La respuesta honesta es que ningún ajuste por sí solo lo arregla todo. Pero estos cambios tienen efectos documentados y medibles:

**Cambia de navegador.** Este es el paso de mayor impacto. Brave bloquea la exposición de IP local por WebRTC y el canvas fingerprinting por defecto — añade ruido aleatorio a la salida del canvas y del audio en cada sesión, haciendo imposible la correlación entre sitios sin que tengas que romper la web. Firefox con `privacy.resistFingerprinting = true` adopta un enfoque diferente: normaliza todo para parecer un navegador genérico (tamaño de pantalla fijo de 1000×900, zona horaria UTC, cadena UA genérica). Esto hace que parezcas como cualquier otro usuario de Firefox con ese ajuste activado, que es el modelo correcto.

| Navegador | Canvas FP | IP por WebRTC | DNS-over-HTTPS | Cookies de terceros |
|---|---|---|---|---|
| Chrome | Ninguna | Filtra | Opcional | Bloqueos parciales |
| Firefox (por defecto) | Ninguna | Filtra | Opcional | Estricto (ETP) |
| Firefox (RFP) | Aleatorizada | Desactivada | Opcional | Estricto |
| Brave | Aleatorizada | Bloqueada | Opcional | Bloqueadas |
| Tor Browser | Uniforme | Desactivada | N/A (usa Tor) | Bloqueadas |

**Instala uBlock Origin.** En Firefox, usa el modo medio (bloquea todos los scripts de terceros por defecto, añade excepciones según necesites). Activa "Evitar que WebRTC filtre las direcciones IP locales" en la configuración avanzada. Esto bloquea la mayoría de los scripts de fingerprinting antes de que siquiera se ejecuten. En Chrome, úsalo antes de que los cambios de Manifest V3 de Google limiten aún más las capacidades de las extensiones.

**Activa DNS-over-HTTPS.** Tanto Firefox como Chrome lo soportan de forma nativa. Usa Cloudflare (1.1.1.1) o NextDNS. NextDNS en particular te permite ver exactamente qué dominios resuelve tu navegador, lo cual es muy útil para auditar qué está ejecutándose en una página.

**Congela tu User-Agent.** Tu cadena UA sola lleva unos 10,5 bits de entropía, según la investigación original de Panopticlick. El ajuste `privacy.resistFingerprinting` de Firefox lo gestiona automáticamente. En Chrome, la API UA-CH (User-Agent Client Hints) ha ido reemplazando gradualmente la cadena UA antigua — la intención era reducir la entropía, pero el despliegue ha sido inconsistente.

Tor Browser sigue siendo el estándar de oro para la resistencia al fingerprinting. Normaliza todos los atributos que pueden ser detectados para que sean idénticos en todos los usuarios de Tor — mismo UA, mismo tamaño de pantalla, mismas fuentes, misma zona horaria. El objetivo es la uniformidad, no el bloqueo. Todos los usuarios de Tor Browser parecen idénticos. Es el único enfoque que verdaderamente derrota el fingerprinting en lugar de simplemente aumentar su coste.

Para la mayoría de personas, Brave o Firefox con uBlock Origin te acerca al 80% sin romper los sitios que usas habitualmente. Es un compromiso razonable.

Lo que no puedes solucionar completamente por tu cuenta es el fingerprinting TLS — el orden de las cipher suites y los valores de las extensiones TLS que envía tu navegador durante el handshake HTTPS son lo suficientemente característicos como para identificar tu navegador a nivel de red, antes de cualquier HTTP. Cloudflare y otras CDNs ya usan hashes JA3 (una huella TLS estandarizada) para la detección de bots. Ninguna extensión del navegador toca esto. Es un problema solucionable, pero solo los propios navegadores pueden arreglarlo.

La web tiene más infraestructura de vigilancia integrada de lo que la mayoría de usuarios imagina. La buena noticia es que unos pocos cambios concretos — un mejor navegador, una extensión, DNS-over-HTTPS activado — reducen significativamente lo que estás filtrando. Empieza con Cover Your Tracks. Mira qué dice. Luego decide con qué nivel estás cómodo.

Una cosa más que vale la pena mencionar: las herramientas que más respetan tu privacidad son las que no te piden que te identifiques. Las herramientas que funcionan sin registro no pueden correlacionar los datos de tu sesión con un perfil porque no hay ningún perfil al que correlacionar. Si quieres ver cuántas herramientas capaces existen sin necesidad de login, [nologin.tools](/tool/nologin-tools) mantiene una lista curada — desde editores de imagen hasta compartición de archivos y utilidades para desarrolladores, todo usable sin crear una cuenta. Es una forma práctica de reducir tu huella digital mientras sigues haciendo las cosas.
