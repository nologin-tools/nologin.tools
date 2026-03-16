---
title: "El coste oculto de las cuentas gratuitas: qué estás cediendo realmente"
description: "Las cuentas gratuitas no son gratis: Meta gana 233 dólares por cada usuario estadounidense al año. Esto es lo que recopilan, cómo lo usan y qué puedes hacer al respecto."
publishedAt: 2026-03-14
author: "nologin.tools"
tags: ["privacy", "analysis", "tools"]
featured: false
heroImageQuery: "digital privacy data collection surveillance"
locale: es
originalSlug: hidden-cost-free-accounts
sourceHash: 6cafff4f6ab83823
---

![Hero image](/blog/images/hidden-cost-free-accounts/hero.jpg)

En 2024, Meta ingresó aproximadamente 233 dólares por cada usuario de Estados Unidos y Canadá. No a través de suscripciones. Vendiendo acceso a perfiles de comportamiento construidos a partir de todo lo que escribiste, hiciste clic, pasaste por encima con el ratón o ignoraste mientras usabas sus productos "gratuitos".

Ese dato viene directamente de sus informes trimestrales de resultados. No es la estimación de un activista de la privacidad. Es lo que el mercado publicitario cree que valen tu atención y tus datos de comportamiento, y la cifra sube cada año.

Así que cuando un servicio es gratuito, no estás consiguiendo una ganga. Tú eres la ganga.

## Qué recopilan exactamente cuando te registras

La dirección de correo electrónico es lo de menos. En el momento en que creas una cuenta —y a menudo antes, mediante píxeles de seguimiento y scripts de terceros— la empresa empieza a construir un perfil sobre ti.

Lo explícito es obvio: nombre, email, fecha de nacimiento, ubicación. Pero los datos de comportamiento son donde está el verdadero valor. Cada scroll, cada pausa, cada búsqueda y cada contenido en el que te detienes queda registrado y alimenta modelos que infieren cosas que nunca le has contado a nadie. Si tienes ansiedad. Si estás embarazada. Si estás a punto de comprar un coche.

Por debajo de todo esto funciona la identificación técnica del dispositivo. Tipo de navegador, resolución de pantalla, fuentes instaladas, comportamiento de la tarjeta gráfica... combinados, crean un identificador casi único que te sigue por todos los sitios aunque no hayas iniciado sesión y aunque hayas borrado las cookies. La herramienta [Cover Your Tracks](https://coveryourtracks.eff.org) de la EFF ([disponible también sin registro](/tool/coveryourtracks-eff-org)) puede mostrarte exactamente cómo de único parece tu navegador para los sitios que visitas. La mayoría de la gente se lleva una sorpresa.

La dimensión entre sitios es lo que hace que sea especialmente difícil escapar. Los botones "Iniciar sesión con Google" y "Iniciar sesión con Facebook" que aparecen en webs de terceros informan a Google y Meta incluso cuando no los pulsas. El widget de login se carga, y el seguimiento ocurre de todas formas. No te has registrado en nada en esa web, pero tu visita queda registrada igualmente.

## La subasta en tiempo real detrás de cada página que cargas

Cuando abres una página web con publicidad programática, se produce una subasta en aproximadamente 100 milisegundos. Tu perfil —demografía inferida, señales de intención de compra, historial de navegación— se envía a cientos de anunciantes potenciales. Pujan. El ganador muestra el anuncio. Tú no ves nada de esto, pero tus datos han sido compartidos con todos los pujadores en esa subasta, no solo con el ganador.

Esto se llama puja en tiempo real (*real-time bidding*), y es la base de la economía publicitaria. Las implicaciones para la privacidad no son un efecto secundario: son estructurales. Compartir tus datos con cientos de actores simultáneamente es exactamente cómo funciona el sistema.

La división publicitaria de Google generó aproximadamente 237.000 millones de dólares en 2024. Alphabet no vende anuncios solo por reconocimiento de marca; vende una segmentación que solo es posible porque rastrea el comportamiento simultáneamente en Search, Gmail, YouTube, Maps, Android y el navegador Chrome. Un estudio de la Universidad de Vanderbilt de 2022 estimó que los teléfonos Android en reposo envían datos a los servidores de Google aproximadamente 14 veces por hora.

## El problema de las filtraciones es mayor de lo que crees

Las cuentas gratuitas se acumulan. Con el tiempo, la mayoría de las personas tienen decenas: registros en foros, pruebas gratuitas de apps, herramientas descargadas y olvidadas. Cada una es un objetivo potencial de filtración.

La base de datos [Have I Been Pwned](https://haveibeenpwned.com) de Troy Hunt ([accesible sin registro](/tool/haveibeenpwned-com)) tenía registradas más de 14.000 millones de cuentas comprometidas a principios de 2025. Esa cifra representa miles de brechas individuales, desde pequeños foros hasta grandes plataformas. Hay muchas posibilidades de que tu dirección de correo aparezca ahí varias veces.

La catástrofe real no son las brechas individuales, sino lo que ocurre después. Los intermediarios de datos agregan registros de distintas fuentes, los fusionan y venden perfiles completos. La brecha de National Public Data de 2024 expuso aproximadamente 2.900 millones de registros, incluidos números de la Seguridad Social y domicilios. Esa empresa era un intermediario de datos. Había recopilado toda esa información precisamente porque los datos de la gente se filtran constantemente de los servicios gratuitos, y existe un mercado para comprarlos, limpiarlos y revenderlos.

El informe de IBM sobre el coste de las brechas de datos de 2024 cifró el coste medio global en 4,88 millones de dólares por incidente. Pero ese es el coste para la empresa. Para las personas cuyos datos quedan expuestos, el coste se asume de otra manera: en intentos de phishing, en ataques de relleno de credenciales contra otras cuentas, en fraudes de identidad años después.

> "Los datos no desaparecen tras una brecha: circulan. Un conjunto de credenciales expuestas en 2016 puede seguir siendo utilizado en campañas activas de relleno de credenciales en 2026."

## Qué hacen con los datos que creías que no importaban

Los casos de uso indebido documentados más alarmantes no son hipotéticos. Han sido investigados, sancionados y en algunos casos reconocidos.

El píxel publicitario de Meta fue encontrado integrado en al menos 33 de las 100 principales webs de hospitales de Estados Unidos, enviando datos de consultas de salud de los pacientes —búsquedas sobre enfermedades concretas, interacciones al reservar citas— a los sistemas de segmentación publicitaria de Facebook. Lo publicó The Markup en 2022. Esos datos nunca deberían haber salido del sistema del hospital.

BetterHelp, una plataforma de terapia psicológica online, pagó una sanción de 7,8 millones de dólares a la FTC en 2023 por compartir información sensible de salud mental de sus usuarios con Facebook y Snapchat para segmentación publicitaria, a pesar de haber prometido explícitamente no compartir datos de salud.

Twitter (antes de la adquisición) llegó a un acuerdo de 150 millones de dólares en 2023 por un patrón muy concreto: había recopilado números de teléfono para la autenticación de dos factores y luego utilizó esos mismos números para segmentación publicitaria. Los números entregados por seguridad acabaron siendo usados para generar ingresos.

Google pagó un acuerdo multiestatal de 391 millones de dólares en 2022 tras una investigación de Associated Press que reveló que rastreaba la ubicación precisa de los usuarios incluso cuando habían desactivado expresamente el "Historial de ubicaciones". El ajuste decía una cosa. El comportamiento hacía otra.

Ninguno de estos son casos aislados. Son acciones sancionadoras documentadas por reguladores federales contra algunas de las mayores empresas tecnológicas del mundo.

## Por qué el RGPD ayuda (y dónde no llega)

El Reglamento General de Protección de Datos de la UE otorga a los usuarios europeos derechos significativos: acceso a sus datos, eliminación, portabilidad y la obligación de que las empresas demuestren una base legal para tratar datos personales. Las multas del RGPD pueden alcanzar el 4% de los ingresos anuales globales, razón por la que Meta ha pagado más de 1.200 millones de euros en sanciones desde 2018.

La ley CCPA de California otorga derechos similares a sus residentes. Técnicamente, un residente de California puede pedirles a los intermediarios de datos que eliminen sus registros. El problema: un estudio de Consumer Reports reveló que esos intermediarios a menudo volvían a adquirir los datos eliminados en cuestión de meses a través de otras fuentes. Las solicitudes de eliminación funcionan una vez. La economía del dato rellena los huecos automáticamente.

A fecha de 2026, Estados Unidos sigue sin una ley federal integral de privacidad. Las protecciones varían según el estado, el sector y la buena voluntad de cada empresa. Para la mayoría de los usuarios fuera de California y la UE, las protecciones legales son escasas.

## La comparación que deberías hacer de verdad

| Herramienta | ¿Requiere cuenta? | Datos recopilados | Modelo de ingresos |
|---|---|---|---|
| Google Docs | Sí | Contenido de documentos, comportamiento, metadatos | Segmentación publicitaria |
| Microsoft 365 Free | Sí | Telemetría de uso, análisis de contenido | Upsell + datos |
| Photopea (sin login) | No | Datos mínimos de sesión | Anuncios (no segmentados) |
| Excalidraw (sin login) | No | Nada almacenado en el servidor | Código abierto / donaciones |
| PDF24 Tools (sin login) | No | Contenido de archivos (procesado, no retenido) | Anuncios |

[Photopea](/tool/photopea-com) maneja archivos PSD al nivel de una aplicación de escritorio. [Excalidraw](/tool/excalidraw-com) es una pizarra colaborativa completa. Ninguna requiere cuenta. Ninguna construye un perfil de comportamiento sobre ti. La brecha de funcionalidades entre estas herramientas y sus equivalentes con cuenta se ha reducido drásticamente.

La comparación no siempre favorece a las herramientas sin login —Google Docs tiene funciones que Photopea no tiene—. Pero para una gran parte de las tareas cotidianas, la diferencia es mínima o inexistente, y la balanza se inclina claramente.

## Qué puedes hacer de verdad

Usar herramientas sin login para tareas que no necesitan persistencia es el enfoque más directo. Para edición rápida de imágenes, conversión de formatos, herramientas PDF, bocetos en pizarra, corrección gramatical y decenas de otros casos de uso, existen herramientas que funcionan sin registro y funcionan bien. [nologin.tools](/tool/nologin-tools) mantiene un directorio curado de opciones verificadas.

Para los casos en que necesitas una cuenta de verdad, los [servicios de correo temporal](/tool/temp-mail-org) te permiten crear una dirección desechable para el registro, evitando que tu bandeja de entrada real se convierta en un punto de datos vinculado a docenas de servicios. Esto no ayuda con el seguimiento de comportamiento tras el login, pero limita la agregación de tu identidad real entre servicios.

La higiene del navegador también importa. Usar navegadores separados para contextos distintos, un bloqueo de contenido agresivo y entender qué expone tu navegador son medidas con efecto real. [BrowserLeaks](/tool/browserleaks-com) puede mostrarte qué datos de identificación son visibles desde tu configuración actual.

La herramienta que se lanzó recientemente en Hacker News —Ichinichi, una app de nota-al-día cifrada de extremo a extremo y con prioridad local— representa una dirección arquitectónica más amplia que merece atención. Las aplicaciones *local-first* que procesan los datos en tu dispositivo en lugar de en la nube evitan por completo el problema de la acumulación de datos en el servidor. La tendencia hacia herramientas locales, de conocimiento cero y con privacidad por diseño se está acelerando. No por victoria moral, sino porque suficientes usuarios han empezado a pedirlo como para que haya un mercado para ello.

## El cambio que ya está ocurriendo

La presión regulatoria está aumentando. Las sanciones son cada vez más grandes. Las multas del RGPD han superado los mil millones de euros. La FTC en los últimos años ha sido más activa en materia de prácticas de datos que en la década anterior. La legislación estatal se multiplica. El coste legal del uso indebido de datos está subiendo, lo que cambia el cálculo para las empresas que han tratado los datos de usuarios como beneficio puro.

Las alternativas técnicas son mejores que nunca. Existen herramientas que preservan la privacidad para casi cualquier flujo de trabajo común, a menudo basadas en código abierto, lo que las hace fiables de una manera que los servicios propietarios no pueden igualar.

Aun así, el comportamiento por defecto sigue siendo la vigilancia. La mayoría de las personas seguirán creando cuentas, aceptando términos que no leen y financiando sin saberlo ecosistemas de publicidad conductual con el registro de su vida digital cotidiana. Cambiar ese comportamiento por defecto —una herramienta cada vez— no es una solución perfecta, pero sí una real.

La pregunta no es si puedes vivir completamente sin cuentas. Probablemente no puedas. La pregunta es cuáles son realmente necesarias y cuáles creaste porque era más rápido que buscar una alternativa.
