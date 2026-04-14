---
title: "¿Es Excalidraw privado? Pizarra online gratuita, sin login"
description: "Excalidraw cifra la colaboración con claves que nunca salen de tu navegador. Descubre cómo esta pizarra gratuita mantiene tus diagramas privados por diseño."
publishedAt: 2026-04-08
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source"]
featured: false
heroImageQuery: "privacy encryption whiteboard digital security"
locale: "es"
originalSlug: "excalidraw-privacy-review"
sourceHash: "9dbf0a033cb42d45"
---

![Hero image](/blog/images/excalidraw-privacy-review/hero.jpg)

Piensa en el último diagrama que dibujaste en una pizarra colaborativa online. Quizás era un boceto de arquitectura para un producto que aún no has anunciado. Un mapa de procesos que muestra cómo opera realmente tu equipo. Un análisis de la competencia. Una línea de tiempo de financiación.

Ese contenido vive en algún lugar. En la mayoría de las plataformas de pizarra, vive en sus servidores — legible por sus empleados, accesible a requerimientos legales, sujeto a lo que diga la política de privacidad. La mayoría de la gente no lo considera hasta que lo hace.

Excalidraw lo maneja de otra manera. Cuando compartes un dibujo mediante un enlace de colaboración, tu contenido se cifra antes de salir de tu navegador. Los servidores de Excalidraw transmiten datos entre participantes pero no pueden leer qué contienen esos bytes. La clave de cifrado nunca toca su infraestructura.

Es una elección de diseño significativa para una herramienta web gratuita. Aquí te explicamos qué significa realmente y cuándo importa.

## Lo que hacen la mayoría de las pizarras con tus datos

Las pizarras populares operan como servicios en la nube. Tu contenido vive en sus servidores, y la plataforma tiene acceso de lectura a él. Eso no es necesariamente malicioso — así funciona el software en la nube. Pero tiene consecuencias prácticas.

Miro almacena tus tableros en su infraestructura y sus términos de servicio les otorgan derechos para usar el contenido para mejorar el producto. FigJam es parte de la suite empresarial de Figma, sujeta al manejo de datos de Figma y a las revisiones de seguridad empresarial. Lucidchart almacena tus diagramas en la nube; las opciones de residencia de datos son una característica del nivel empresarial.

Las políticas de privacidad no están ocultas. Nadie las lee, pero la situación que describen es: todo lo que dibujas está almacenado por una empresa que puede verlo. Para un boceto rápido esto probablemente está bien. Para una hoja de ruta de producto antes del lanzamiento o un diagrama de flujo de trabajo sanitario, el cálculo cambia.

La alternativa tradicional a las pizarras en la nube era "herramientas que almacenan localmente pero no pueden colaborar". Excalidraw rompió ese compromiso.

## Cómo funciona realmente la arquitectura de privacidad de Excalidraw

Cuando inicias una sesión de colaboración en [Excalidraw](https://excalidraw.com), la app genera dos cosas: un ID de sala aleatorio y una clave de cifrado aleatoria. Ambas se incrutan en la URL después del símbolo `#`.

Esta colocación es significativa. Los navegadores nunca envían el fragmento de URL a los servidores. Cuando tu navegador carga `https://excalidraw.com/#room=abc123,encryptionKey456`, envía una solicitud GET a `excalidraw.com/` sin información de sala o clave incluida. El servidor recibe solo la solicitud base — nunca ve el fragmento.

Los datos del dibujo se cifran en el navegador usando la [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) antes de la transmisión. El servidor almacena y reenvía solo texto cifrado. Sin la clave — que no tiene y no puede obtener — los datos son ilegibles para la infraestructura de Excalidraw.

Esta es la misma arquitectura usada por [Yopass](/tool/yopass-se) para compartir secretos cifrados y [hat.sh](/tool/hat-sh) para cifrar archivos en el navegador: el servidor maneja el transporte, el usuario tiene las claves. Es un enfoque fundamentado, no un accidente de implementación.

Para uso en solitario, la situación es aún más simple. Excalidraw almacena tu dibujo actual en el `localStorage` del navegador. Nada se sube a ningún lado a menos que explícitamente inicies una sesión de colaboración o exportes un archivo. Si estás esbozando solo, tu dibujo no sale de tu máquina.

## Verificar las afirmaciones de privacidad

Una afirmación de privacidad de una herramienta de código cerrado requiere confianza. Cualquiera puede decir "no leemos tus datos".

Excalidraw es [MIT y está disponible públicamente en GitHub](https://github.com/excalidraw/excalidraw). La implementación del cifrado está en el código fuente, legible por cualquiera con un navegador y unos minutos. El código de la sesión de colaboración, la generación de claves y el paso de mensajes pueden auditarse. No se requiere confianza — el código es la prueba.

El proyecto ha acumulado más de 80.000 estrellas en GitHub. Eso significa que un gran número de desarrolladores ha mirado el código durante varios años de desarrollo activo. El rastreador de problemas es público. Si hubiera un problema de privacidad en la implementación, sería encontrable. Ese nivel de escrutinio es una señal de calidad significativa.

Esta es la brecha significativa entre "valoramos tu privacidad" (lenguaje de marketing) y "aquí está el código que implementa la privacidad" (propiedad verificable).

## Colaboración sin cuentas — y sin compromisos

La suposición típica sobre el software que respeta la privacidad es que sacrifica funciones por protección. La colaboración en tiempo real generalmente requiere cuentas, que requieren entregar una dirección de correo electrónico, lo que inicia una relación con una plataforma que tiene acceso a tu contenido.

El modelo de colaboración de Excalidraw rompe esta suposición. Dos personas pueden editar el mismo lienzo en tiempo real — los cursores aparecen con nombres, los cambios se propagan inmediatamente — sin que ninguna de las dos tenga una cuenta. El enlace cifrado es el mecanismo de acceso. Compártelo y tu colaborador se une. No lo compartas y no pueden acceder.

Para casos de uso donde la creación de cuentas es una barrera — obtener feedback de un cliente que no quiere otro login de SaaS, o realizar una entrevista técnica donde quieres que el candidato se centre en el problema, no en un flujo de registro — esto importa de forma práctica.

Las sesiones son efímeras por defecto. Cuando la última persona cierra la pestaña, la sesión termina. No hay sala permanente en la nube a la que volver a menos que exportes el archivo `.excalidraw`. Para una lluvia de ideas puntual o una única sesión de trabajo, eso está bien. Para trabajo de equipo continuo, exportar regularmente a una carpeta compartida es el flujo de trabajo.

## Excalidraw vs. las alternativas: comparativa centrada en la privacidad

Cuando la pregunta es específicamente sobre privacidad de datos, la comparación no son características vs. características — son modelos de datos.

| | Excalidraw | Miro | FigJam | tldraw |
|---|---|---|---|---|
| El servidor lee el contenido | No (E2E cifrado) | Sí | Sí | No |
| Login requerido | No | Sí | Sí | No |
| Autoalojable | Sí (MIT) | No | No | Sí |
| Código fuente visible | Sí | No | No | Sí |
| Colaboración E2E cifrada | Sí | No | No | Parcial |

[tldraw](/tool/tldraw-com) es el competidor más cercano en privacidad. También es de código abierto, también sin login requerido, y tiene una experiencia colaborativa limpia. La principal diferencia es el modelo de cifrado — la arquitectura de tldraw no usa actualmente el mismo enfoque de fragmento de URL para el cifrado de extremo a extremo durante la colaboración. Ambas herramientas son más privadas que Miro; la arquitectura de Excalidraw hace que el servidor sea funcionalmente ciego al contenido incluso durante sesiones en vivo.

[Diagrams.net](/tool/app-diagrams-net) es otra opción sin login que vale la pena mencionar por razones de privacidad. Guarda localmente por defecto y no requiere cuenta. Pero no ofrece colaboración en tiempo real de la misma manera, por lo que sirve a un flujo de trabajo diferente.

Miro es potente y refinado. Si tu equipo ya lo paga y la privacidad no es una preocupación para tu caso de uso, no hay razón de peso para cambiar. Pero si estás dibujando algo que no debería ser legible por terceros, la diferencia arquitectónica es real.

## La opción de autoalojamiento

Si "el servidor de colaboración es ciego en E2E" todavía implica demasiada confianza en un operador externo — porque estás en una industria regulada, o la política de tu organización requiere que las herramientas se ejecuten en la infraestructura de la empresa — Excalidraw se puede autoalojar.

La [imagen oficial de Docker](https://hub.docker.com/r/excalidraw/excalidraw) hace el despliegue sencillo. Ejecutas Excalidraw en tu propio servidor, sin infraestructura de Excalidraw involucrada. Todo el tráfico se enruta a través de tu servidor, en tu jurisdicción, detrás de tu firewall.

Esta opción existe porque la licencia MIT lo permite explícitamente. Organizaciones en sanidad, finanzas y gobierno han desplegado Excalidraw en redes internas precisamente porque la alternativa — una pizarra SaaS que almacena diagramas en servidores externos — crea exposición al cumplimiento normativo.

Para individuos y equipos pequeños, la versión alojada está bien. Pero el camino del autoalojamiento importa para situaciones donde la arquitectura de privacidad necesita estar enteramente bajo tu control.

## Dónde tiene límites el modelo de privacidad

La precisión importa aquí. El modelo de privacidad de Excalidraw es sólido de formas específicas y bien definidas. Tiene límites que vale la pena conocer.

Si exportas un PNG y lo subes a Slack, Google Drive, o lo envías por correo electrónico, las garantías de Excalidraw terminan en la exportación. Las plataformas a través de las que compartes tienen acceso normal a esos archivos.

Excalidraw+ — la versión alojada de pago que añade almacenamiento en la nube persistente y salas protegidas con contraseña — es un producto diferente con un modelo de almacenamiento diferente. El cifrado E2E para la colaboración en vivo sigue aplicando, pero el almacenamiento persistente involucra sus servidores de formas que el modelo efímero gratuito no lo hace.

El `localStorage` del navegador generalmente no está cifrado a nivel de sistema operativo. Si alguien tiene acceso físico a tu máquina y sabe dónde buscar, podría extraer un dibujo del almacenamiento del navegador. Es una preocupación remota para la mayoría de la gente, pero vale la pena saber si estás en un entorno de mayor amenaza.

Los metadatos no están cifrados. Excalidraw sabe cuándo accedes al sitio, cuánto duran las sesiones y qué direcciones IP participaron. Eso es registro estándar del servidor web, presente independientemente del cifrado de contenido. No es específico de Excalidraw — todas las herramientas web lo tienen.

Ninguna de estas es razón para evitar la herramienta. Son el panorama preciso de lo que "privado" significa en este contexto.

## Cómo empezar

Ve a [excalidraw.com](https://excalidraw.com). Empieza a dibujar. Sin registro. Sin instalación.

Tu dibujo se autoguarda en `localStorage` mientras trabajas. Cerrar la pestaña y reabrirla recupera tu último lienzo. Para almacenamiento permanente, exporta como `.excalidraw` (un archivo JSON que puedes reabrir y editar más tarde), PNG o SVG.

Para colaborar, haz clic en el icono de persona en la barra de herramientas y comparte el enlace generado. Tu colaborador no necesita nada instalado, ninguna cuenta, ninguna descarga. El enlace es la sesión.

Si quieres explorar más herramientas sin login que respetan la privacidad más allá de las pizarras, [nologin.tools](/tool/nologin-tools) reúne herramientas por categorías que comparten la misma filosofía de diseño — sin cuenta requerida, recopilación mínima de datos.

Lo interesante de Excalidraw no es que sea gratuito. Es que las personas que lo construyeron eligieron, por diseño, hacer que el servidor sea ciego al contenido. La colaboración en tiempo real donde el intermediario no puede leer los datos se consideró un problema de ingeniería. Lo resolvieron, y luego pusieron la solución en código abierto. A medida que más herramientas de pizarra avanzan hacia cuentas obligatorias y licencias empresariales, esa elección parece más distintiva con cada año que pasa.
