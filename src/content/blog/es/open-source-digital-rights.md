---
title: "El derecho digital a un software que no te vigila"
description: "Las herramientas de código abierto sin registro no son solo cómodas — implementan derechos digitales en la práctica: comunícate y colabora sin que te rastreen."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["open-source", "privacy", "analysis", "tools", "browser"]
featured: false
heroImageQuery: "digital rights open source privacy freedom"
locale: es
originalSlug: "open-source-digital-rights"
sourceHash: "994e76dd1a720e0b"
---

![Hero image](/blog/images/open-source-digital-rights/hero.jpg)

Una pregunta que vale la pena plantearse: cuando te unes a una videollamada en Zoom, ¿qué has aceptado compartir? Tu nombre. Tu correo. Tu dirección IP. Los metadatos de tu dispositivo. Tus patrones de uso. El contenido de tus llamadas, dependiendo del plan que pague el anfitrión. Todo eso antes de que la llamada siquiera empiece.

[Jitsi Meet](/tool/meet-jit-si) funciona completamente en tu navegador. Sin cuenta. Sin descarga. Sin registro. La llamada empieza en el momento en que alguien comparte un enlace. Jitsi es de código abierto (licencia Apache 2.0), puedes alojarlo tú mismo, y lo usan [millones de personas en todo el mundo](https://jitsi.org/) — incluyendo organizaciones que gestionan comunicaciones genuinamente sensibles. El código fuente es público y ha sido auditado de forma independiente. La arquitectura usa WebRTC, lo que significa que el audio y el vídeo viajan de forma peer-to-peer cuando es posible, no a través de los servidores de Jitsi.

Ese contraste no es solo una comparación de productos. Es sobre qué tipo de software tienes derecho a usar.

## Los derechos digitales no son abstractos

"Derechos digitales" suena a algo que solo concierne a activistas y abogados. No es así. La [Electronic Frontier Foundation](https://www.eff.org/issues/privacy) lleva tres décadas argumentando que tu derecho a comunicarte de forma privada, a usar software sin ser perfilado y a ser dueño de tus propios datos es una cuestión de libertades civiles, no una simple preferencia de consumidor. El RGPD codificó parte de esto en la ley: el Artículo 5 exige que los datos personales se recojan para "fines específicos, explícitos y legítimos" y no se procesen de formas incompatibles con esos fines. El Artículo 25 exige la "protección de datos desde el diseño y por defecto".

Las herramientas de código abierto sin registro son la cara práctica de esos principios. No piden datos porque no los necesitan. No los necesitan porque la arquitectura está construida alrededor del usuario, no alrededor de un modelo de negocio que monetiza sus datos.

Las herramientas sin registro que más importan no son solo las que se saltan un campo de formulario. Son aquellas en las que no hace falta iniciar sesión como consecuencia natural de cómo funciona el software: procesamiento en el lado del cliente, transferencia peer-to-peer, estado cero en el servidor. Prescindir del registro no es una función que añadieron. Es una función que nunca necesitaron.

## Cuando necesitas compartir sin dejar rastro

Alguien te manda una contraseña sensible, una clave de API, un contrato. Necesitas enviárselo a un compañero. El correo electrónico es texto plano. Slack guarda registros. Las apps de mensajería suelen almacenar el historial indefinidamente. El impulso de "mandarlo por el móvil" es comprensible — y a menudo exactamente equivocado.

[Yopass](/tool/yopass-se) resuelve esto de forma correcta. Pegas un secreto, estableces una fecha de caducidad y obtienes un enlace de un solo uso. El destinatario abre el enlace, lee el secreto y este se elimina automáticamente. El secreto se cifra en el lado del cliente antes de abandonar tu navegador; los servidores de Yopass solo ven texto cifrado que no pueden leer. Cuando se usa el enlace (o caduca), los datos cifrados desaparecen. Sin registros, sin persistencia, sin necesidad de cuenta en ninguno de los dos extremos. El [código fuente](https://github.com/jhaals/yopass) es público — puedes verificar esta afirmación en lugar de aceptarla por fe, y puedes alojar Yopass tú mismo si prefieres no confiar ni en su infraestructura.

El contraste con productos como la función de "compartir" de LastPass (requiere cuentas en ambos extremos) o incluso con enviar una contraseña por correo es enorme. Esas herramientas rastrean quién envió qué a quién. Yopass explícitamente no lo hace.

## Transferencia de archivos que se salta el servidor por completo

La forma estándar de compartir un archivo con alguien es subirlo a un servidor — Google Drive, WeTransfer, Dropbox — y enviarle un enlace. Ese servidor almacena tu archivo. Puede ser objeto de una orden judicial, sufrir una brecha de seguridad o aprovecharse para analítica. El archivo existe en algún lugar que no controlas, durante más tiempo del que crees.

[PairDrop](/tool/pairdrop-net) hace algo estructuralmente diferente. Tu archivo va directamente desde tu dispositivo al suyo, usando los canales de datos de WebRTC. El servidor de PairDrop solo gestiona la señalización — el breve apretón de manos que ayuda a dos navegadores a encontrarse. Una vez conectados, el servidor queda fuera de la ecuación. El archivo en sí nunca lo toca.

Esto no es solo una mejora de privacidad. Es una arquitectura diferente. El servidor no puede almacenar lo que nunca recibe. Una brecha en la infraestructura de PairDrop no expondría tus archivos transferidos porque nunca estuvieron allí. [ShareDrop](/tool/sharedrop-io) funciona de la misma manera — merece la pena guardarlo como alternativa que tampoco requiere registro y gestiona la transferencia P2P sin almacenamiento intermedio.

Ambos son de código abierto. Ambos funcionan en cualquier navegador moderno. Ninguno pide tu correo.

## Saber qué revela tu navegador

La diferencia entre "sin registro" y "sin rastreo" es mayor de lo que mucha gente cree. Una herramienta puede saltarse el formulario de registro mientras sigue tomando la huella digital de tu navegador, registrando tu IP y correlacionando tus visitas con píxeles de seguimiento de terceros. Algunas lo hacen. Puedes verificar que tu navegador no está filtrando datos de formas que no has autorizado.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) — mantenido por la EFF — comprueba si la huella digital de tu navegador es suficientemente única como para rastrearte en distintos sitios. Analiza el bloqueo de rastreadores, la aleatorización de huellas digitales y si los scripts de fingerprinting habituales pueden identificar tu configuración específica de navegador. Sin registro. Metodología de prueba de código abierto. La EFF publica la metodología públicamente para que puedas entender exactamente qué se está midiendo.

[BrowserLeaks](/tool/browserleaks-com) va más a fondo: dirección IP, huella digital de WebGL, huella digital de Canvas, contexto de audio, enumeración de fuentes, APIs de geolocalización. Cada prueba te muestra qué pueden aprender los sitios sobre ti sin preguntarte. Los resultados suelen ser incómodos. Saber qué revela tu navegador es un requisito previo para tomar buenas decisiones sobre qué herramientas sin registro puedes confiar de verdad.

| Herramienta | Datos registrados | El servidor ve | Autoalojable |
|------|-------------|-------------|---------------|
| Zoom (gratis) | Cuenta, IP, metadatos, contenido de llamadas | Todo | No (propietario) |
| Jitsi Meet | Opcional: nombre de pantalla | Solo señalización | Sí (Apache 2.0) |
| WeTransfer | IP, correo, contenido del archivo | Archivo + metadatos | No |
| PairDrop | Nada | Solo señalización | Sí (MIT) |
| LastPass Share | Datos de cuenta, registros de acceso | Archivo cifrado | No |
| Yopass | Nada | Secreto cifrado | Sí (MIT) |

## Por qué el código abierto es la capa de confianza

La frase "respetamos tu privacidad" no cuesta nada publicarla. Aparece en prácticamente toda política de privacidad que se haya escrito. La frase "aquí está el código que se ejecuta cuando usas nuestra herramienta" sí significa algo.

El código abierto puede auditarse. Los investigadores de seguridad examinan regularmente las herramientas de código abierto e informan públicamente de lo que encuentran. Cuando [el código de Jitsi](https://github.com/jitsi/jitsi-meet) gestiona la autenticación, la implementación es visible. Cuando Yopass realiza cifrado en el lado del cliente, la [biblioteca criptográfica que usa](https://github.com/jhaals/yopass) está especificada y es revisable. Cuando PairDrop establece una conexión WebRTC, puedes leer exactamente qué datos pasan por el servidor de señalización.

Las herramientas propietarias pueden hacer las mismas afirmaciones y no puedes verificarlas. Puedes comprobar sus peticiones de red con las herramientas de desarrollo del navegador (lo que te dice algo), pero no puedes ver el código del lado del servidor que gestiona tus datos después de que se transmitan. Las herramientas de código abierto con procesamiento en el lado del cliente cortocircuitan este problema: no hay código del lado del servidor manejando tus datos, y el código del lado del cliente es público.

Esta es la combinación que importa. Código abierto pero en el lado del servidor es mejor que código cerrado, pero sigue requiriendo que confíes en el servidor. En el lado del cliente pero código cerrado es mejor que en el lado del servidor, pero sigue siendo opaco sobre lo que el código hace localmente. Código abierto *y* en el lado del cliente significa que ni el servidor ni el código requieren confianza más allá de lo que puedes verificar.

## La garantía del autoalojamiento

Hay una capa más que vale la pena entender: el autoalojamiento. Todas las herramientas mencionadas aquí pueden desplegarse en la infraestructura que tú controlas.

Jitsi Meet está documentado para autoalojamiento en Ubuntu con una [guía paso a paso](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart). Yopass tiene soporte para Docker. La arquitectura de PairDrop es suficientemente simple como para que un solo servidor gestione la señalización de miles de usuarios. Si eres una organización con requisitos regulatorios específicos — sanidad, jurídico, administración pública — esto importa. Las obligaciones del Artículo 28 del RGPD en torno a los encargados del tratamiento de datos quedan sin efecto cuando el encargado eres tú mismo.

Para la mayoría de las personas, el autoalojamiento no vale la carga de mantenimiento. Pero la *posibilidad* de autoalojamiento cambia la relación de confianza con la versión alojada. Una herramienta que podrías ejecutar tú mismo, funcionando de forma idéntica tanto si usas su instancia como la tuya propia, es fundamentalmente diferente de una herramienta donde la versión alojada es la única opción. La arquitectura tiene que ser suficientemente limpia para funcionar sin un back end propietario, lo que descarta muchas decisiones de diseño que habilitan la vigilancia.

## La tendencia apunta hacia menos confianza requerida

El software respetuoso con la privacidad solía significar ejecutar algo en tu propia máquina, desconectada de la red. Esa ya no es la única opción. WebAssembly, WebRTC y el cifrado en el lado del cliente han hecho posible construir herramientas que se ejecutan en el navegador, se comunican entre sí y gestionan operaciones sensibles — sin un servidor que acumule datos de usuario.

El proyecto [PrivacyTests.org](/tool/privacytests-org) rastrea qué navegadores resisten el fingerprinting, el rastreo y las filtraciones de datos. La tendencia es positiva: los navegadores son cada vez mejores limitando lo que terceros pueden recopilar, y los usuarios son más conscientes de la distinción entre "gratis" y "te cuesta tus datos".

Las herramientas sin registro que merece la pena usar a largo plazo son aquellas en las que la arquitectura hace que la vigilancia sea estructuralmente imposible, no solo actualmente prohibida por política. Las políticas cambian. Los modelos de negocio cambian. La arquitectura es más difícil de cambiar — especialmente cuando el código es público y la comunidad se daría cuenta.

Explora las herramientas en [nologin.tools](/tool/nologin-tools) para encontrar opciones de código abierto y respetuosas con la privacidad verificadas para procesamiento en el lado del cliente. Las marcadas como código abierto tienen repositorios públicos que puedes inspeccionar. Ese es el estándar que realmente significa algo.
