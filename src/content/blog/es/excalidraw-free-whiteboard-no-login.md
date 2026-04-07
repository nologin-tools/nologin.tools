---
title: "Excalidraw: la pizarra online gratuita que no te pide crear cuenta"
description: "Excalidraw es una herramienta de pizarra libre y de código abierto que funciona en el navegador sin necesidad de registro. Dibuja diagramas con aspecto de boceto y colabora con cifrado de extremo a extremo."
publishedAt: 2026-04-07
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source", "browser"]
featured: false
heroImageQuery: "whiteboard sketching digital drawing hand-drawn"
locale: "es"
originalSlug: "excalidraw-free-whiteboard-no-login"
sourceHash: "ba7bcfac58d58f30"
---

![Hero image](/blog/images/excalidraw-free-whiteboard-no-login/hero.jpg)

La mayoría de las herramientas de pizarra te piden que crees una cuenta antes de dibujar la primera línea. Miro quiere tu correo electrónico. FigJam necesita tu cuenta de Figma. Lucidchart levanta un muro de pago cuando llevas cinco formas dibujadas. Y si pagas, tienen acceso a todo lo que dibujas.

[Excalidraw](https://excalidraw.com) abre directamente con un lienzo en blanco, listo para usar. Sin registro. Sin inicio de sesión. Sin ningún pop-up pidiendo tu correo. Solo una pizarra.

Esa es la promesa, y después de millones de usuarios y años de desarrollo activo, sigue cumpliéndose.

## Qué hace Excalidraw exactamente

Excalidraw es una herramienta de dibujo en el navegador que renderiza todo con un estilo de trazo a mano alzada. Los rectángulos tienen los bordes ligeramente temblorosos. Las líneas tienen esa imprecisión natural que hace que los diagramas parezcan sacados de una servilleta más que de una presentación corporativa.

Esta estética es una elección deliberada, no una limitación técnica. Cuando estás esbozando un diagrama de arquitectura o explicando un concepto al equipo, el aspecto descuidado transmite «esto es un borrador, comenta sin miedo» mucho mejor que una diapositiva perfectamente pulida. Los equipos de ingeniería lo usan en entrevistas de diseño de sistemas. Los diseñadores lo usan para wireframes antes de abrir Figma. Los profesores lo usan para explicar conceptos sin que el formato de presentación se interponga.

La herramienta incluye las figuras de siempre —rectángulos, círculos, flechas, líneas, texto, dibujo libre— además de imágenes que puedes incrustar directamente en el lienzo. Puedes agrupar objetos, organizarlos en capas, bloquearlos y alinearlos con una cuadrícula. Hay selector de color, grosor de trazo y opciones de relleno. Nada está oculto tras un nivel premium.

La exportación funciona sin cuenta. Puedes guardar en PNG (fondo transparente opcional), SVG, o copiar al portapapeles. El formato de archivo `.excalidraw` es JSON plano, lo que significa que tus dibujos son legibles y recuperables incluso sin la aplicación, algo muy útil si el proyecto algún día cierra.

## La arquitectura de privacidad

Aquí está lo que hace que merezca la pena hablar de Excalidraw específicamente como herramienta respetuosa con la privacidad: el modelo de colaboración está cifrado de extremo a extremo por defecto.

Cuando compartes un dibujo con alguien mediante el enlace de «colaboración en vivo», tanto el ID de la sala como la clave de cifrado se incrustan en el fragmento de la URL (la parte del `#`). El fragmento nunca se envía al servidor: se queda en el navegador. Los servidores de Excalidraw retransmiten los datos del dibujo entre participantes, pero solo reciben bytes cifrados. No pueden leer lo que has dibujado.

Esta es una garantía de privacidad con contenido real. Con herramientas como Miro o Notion, la plataforma tiene acceso completo al contenido de tu pizarra. En el modo de colaboración de Excalidraw, eso no ocurre. El [código fuente está en GitHub](https://github.com/excalidraw/excalidraw) bajo licencia MIT, así que cualquiera puede verificar esta afirmación leyéndolo directamente, sin necesidad de confiar en nadie.

Para uso individual, nada sale de tu navegador. Los dibujos se guardan en `localStorage` y permanecen en tu dispositivo a menos que los exportes explícitamente.

> "Your data is end-to-end encrypted, meaning the Excalidraw server cannot read what you've drawn." — Excalidraw documentation

Es el mismo principio de diseño que se ve en otras herramientas que respetan la privacidad: el servidor gestiona el transporte, no el contenido. El usuario mantiene el control de las claves.

## Excalidraw vs. tldraw vs. Diagrams.net

En la categoría de pizarras gratuitas sin registro hay varios contendientes sólidos. Así se comparan:

| | Excalidraw | tldraw | Diagrams.net |
|---|---|---|---|
| Requiere inicio de sesión | No | No | No |
| Colaboración | Cifrado E2E | Sí | No (solo exportar) |
| Estilo | Dibujo a mano | Limpio/vectorial | Técnico/UML |
| Autoalojable | Sí | Sí | Sí |
| Formatos de exportación | PNG, SVG, JSON | PNG, SVG, JSON | PNG, SVG, PDF, XML |
| Código abierto | MIT | MIT | Apache 2.0 |

[tldraw](/tool/tldraw-com) es el competidor más cercano. También es gratuito, sin registro y de código abierto. La diferencia principal es estética: tldraw usa formas vectoriales limpias mientras que Excalidraw se compromete de lleno con el estilo de boceto. Si necesitas precisión —por ejemplo, un diagrama para un documento técnico formal— el renderizado más limpio de tldraw es más manejable.

[Diagrams.net](/tool/app-diagrams-net) apunta a un caso de uso completamente distinto. Tiene formas UML reales, plantillas de diagramas de flujo, iconos de topología de red y un formato XML que se integra con Confluence y otras herramientas empresariales. Es más potente para diagramas estructurados, pero menos adecuado para bocetos libres.

Miro es la opción empresarial: pulida, realmente completa, y a partir de 16 dólares al mes por usuario tras agotar el nivel gratuito. Requiere cuenta, rastrea el uso y tiene acceso total a todo lo que dibujas. Para un equipo pequeño que hace diagramas de vez en cuando, es mucho dinero por lo que Excalidraw te da gratis.

## Colaboración sin entregar los datos

El producto típico de colaboración en tiempo real funciona así: creas una cuenta, tu contenido vive en sus servidores y ellos pueden leerlo. Es un compromiso conocido y, en muchos productos, es perfectamente aceptable.

El modelo de Excalidraw es diferente. Dos personas pueden editar el mismo lienzo en tiempo real —los cursores aparecen con nombres, los cambios se propagan al instante— y el servidor intermediario es funcionalmente ciego al contenido. La clave de cifrado nunca toca el servidor, así que ni siquiera con una orden judicial se podrían obtener datos de dibujos legibles.

Para iniciar una sesión colaborativa, haz clic en el icono de persona de la barra de herramientas y comparte el enlace. Cualquiera con el enlace puede unirse sin crear cuenta. Las sesiones persisten solo mientras alguien esté conectado. En el nivel gratuito no hay sala en la nube persistente.

Esto implica que no hay historial de versiones, ni sincronización en la nube entre dispositivos, ni forma de volver a una sesión días después sin haber exportado el archivo. Para sesiones de boceto puntuales, es un compromiso aceptable. Para pizarras de equipo continuas, tendrías que exportar los archivos `.excalidraw` a una carpeta compartida con regularidad, o mirar [Excalidraw+](https://plus.excalidraw.com), la versión de pago que añade almacenamiento en la nube persistente, salas protegidas con contraseña y copias de seguridad de escenas.

La versión gratuita cubre lo que la mayoría de la gente necesita realmente: pizarrea un concepto con un compañero, expórtalo y sigue adelante.

## Atajos de teclado y la experiencia de usuario avanzado

Excalidraw premia aprender los atajos de teclado. Una vez que los tienes en los dedos, dibujar se vuelve muy rápido.

Los atajos de formas son de una sola tecla: `R` para rectángulo, `E` para elipse, `A` para flecha, `L` para línea, `X` para dibujo libre, `T` para texto. `V` vuelve a la herramienta de selección. `H` y `V` voltean horizontal y verticalmente. `Ctrl+A` selecciona todo, `Ctrl+G` agrupa los objetos seleccionados.

Para compartir: `Ctrl+Shift+E` abre el diálogo de exportación, desde donde puedes copiar al portapapeles o descargar. `Ctrl+L` copia directamente un enlace para compartir en el portapapeles.

Zoom: `Ctrl+scroll` acerca y aleja, `Ctrl+Shift+H` ajusta todo el dibujo a la pantalla. La herramienta de mano (`Space+arrastrar`) desplaza el lienzo sin cambiar la herramienta seleccionada.

Estos atajos reducen al mínimo la distancia entre pensar y dibujar. Esa inmediatez es la principal razón por la que Excalidraw es tan bueno para diagramas rápidos: no estás buscando en menús mientras la idea todavía está fresca.

## El ecosistema de código abierto

Una de las verdaderas fortalezas de Excalidraw es lo que otros han construido sobre él. Al tener licencia MIT y estar disponible como paquete npm, se ha integrado en un número sorprendente de herramientas.

[Excalideck](/tool/excalideck-com) convierte dibujos de Excalidraw en diapositivas de presentación, con la estética de boceto aplicada al formato de presentación y sin software adicional. Para charlas técnicas donde quieres mostrar diagramas de arquitectura sin cambiar de herramienta, resulta genuinamente útil.

Hay plugins de Obsidian que te permiten dibujar diagramas de Excalidraw dentro de tu bóveda de notas. Extensiones de VS Code incrustan un lienzo junto a tu código. Varias herramientas de documentación y wikis han añadido integración con Excalidraw, permitiendo a los equipos mantener los diagramas en el mismo lugar que el texto que ilustran.

El sistema de bibliotecas merece una mención. La comunidad ha contribuido cientos de colecciones de formas predefinidas: iconos de arquitectura AWS, diagramas de infraestructura de Google Cloud, componentes de UI móvil, plantillas de diagramas de flujo, diagramas de bases de datos. Se instalan desde el explorador de bibliotecas dentro de la app, sin necesidad de registro.

El proyecto ha acumulado más de 80.000 estrellas en GitHub, lo que lo coloca entre las herramientas de dibujo de código abierto más adoptadas. El mantenimiento activo, un rastreador de incidencias con respuestas ágiles y un ecosistema saludable de integraciones son el resultado de años de desarrollo constante.

## Quién debería usar Excalidraw

Si dibujas diagramas de arquitectura, Excalidraw es difícil de superar. El estilo de boceto elimina la presión de que las cosas queden bien antes de que la idea esté clara, y los atajos de teclado te permiten pensar y dibujar a la misma velocidad.

Para wireframes de UX en fase lo-fi —antes de abrir Figma o Sketch— Excalidraw funciona muy bien. La estética rugosa comunica claramente «esto es exploración», lo que tiende a generar feedback más honesto que un mockup perfecto en píxeles.

En contextos educativos, los profesores lo usan para dibujar diagramas durante videollamadas mientras los estudiantes se unen al lienzo compartido. El modelo sin cuenta es especialmente importante aquí: no puedes asumir que todos los alumnos tienen o quieren crear cuentas en otra plataforma más.

Para cualquier cosa que requiera alineación precisa, formato condicional o un diagrama que vaya a una especificación técnica formal, usa [Diagrams.net](/tool/app-diagrams-net) o una herramienta vectorial especializada. El estilo de boceto de Excalidraw es también su techo.

## Empieza sin ninguna configuración

Ve a [excalidraw.com](https://excalidraw.com). Empieza a dibujar. Ese es todo el proceso de incorporación.

El dibujo se guarda automáticamente en `localStorage` mientras trabajas, así que cerrar la pestaña y volver a abrirla recupera tu último lienzo. Para lo que quieras conservar a largo plazo, usa `Ctrl+Shift+E` para exportar: como archivo `.excalidraw` (para reabrir y editar más tarde) o como PNG/SVG (para compartir o incrustar).

Para colaborar, haz clic en el icono de persona y comparte el enlace de la sala. Tus colaboradores no necesitan instalar nada, ni crear cuenta, ni descargar nada. El enlace lo es todo.

Si quieres autoalojarlo —para la intranet de una empresa, una red escolar, o simplemente porque quieres control total sobre dónde se almacenan tus dibujos— la imagen Docker está disponible y la documentación de autoalojamiento es completa. La licencia MIT significa que puedes modificarlo y ejecutarlo como quieras.

Hay más herramientas privadas que no requieren registro en [nologin.tools](/tool/nologin-tools) si estás construyendo un kit de herramientas que evite la creación de cuentas de forma sistemática.

La categoría de pizarras en línea es una donde la opción gratuita, de código abierto y con privacidad como prioridad es genuinamente la mejor para la mayoría de los usuarios. Eso no pasa con frecuencia. Excalidraw se lo ha ganado tratando la privacidad del usuario y la propiedad local de los datos como características reales, no como algo pensado a posteriori.
