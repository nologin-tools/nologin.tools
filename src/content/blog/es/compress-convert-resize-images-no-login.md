---
title: "Comprime, convierte y redimensiona imágenes sin registrarte"
description: "Las mejores herramientas de imágenes basadas en el navegador para compresión, conversión de formato y redimensionado — sin cuenta, sin software, sin límites de subida que requieran registro."
publishedAt: 2026-03-12
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "guide"]
featured: false
locale: es
originalSlug: compress-convert-resize-images-no-login
sourceHash: 18af3124efd343de
---

![Hero image](/blog/images/compress-convert-resize-images-no-login/hero.jpg)

Las imágenes son responsables de aproximadamente la mitad del peso de una página web media. No el JavaScript, no el CSS — las imágenes. Y sin embargo, las herramientas a las que la mayoría de la gente recurre cuando necesita comprimir una foto, convertir un PNG a WebP o redimensionar algo para una plataforma específica exigen una cuenta antes de dejar que toques un deslizador.

Es demasiado precio para una tarea de cinco segundos.

Existe toda una categoría de herramientas de imagen que funcionan completamente en el navegador, procesan archivos en el cliente sin subirlos a un servidor y no requieren nada más que abrir una pestaña. Algunas son de Google. Otras son proyectos de un solo desarrollador con millones de usuarios mensuales. Todas son gratuitas y funcionan sin registro.

## Por qué la elección del formato importa más de lo que crees

La mayoría de la gente comprime imágenes sin pensar en el formato. Tienen un JPEG, lo hacen más pequeño, listo. Pero la selección del formato a menudo importa más que la propia configuración de compresión.

[WebP](https://developers.google.com/speed/webp) — un formato desarrollado por Google — produce archivos aproximadamente un 25-34% más pequeños que JPEG con calidad visual equivalente. AVIF, el formato más reciente respaldado por Netflix y la Alliance for Open Media, puede reducir el tamaño del archivo hasta un 50% en comparación con JPEG. Ambos formatos ahora están soportados por todos los navegadores principales. Si estás optimizando imágenes para un sitio web, simplemente cambiar de JPEG a WebP puede reducir tu carga útil en un tercio antes incluso de ajustar el deslizador de calidad.

Por eso una herramienta que maneja la conversión de formato junto con la compresión es más útil que una que solo aplasta tu JPEG existente. Para la mayoría del trabajo web, la respuesta es: convertir a WebP, comprimir a alrededor del 80% de calidad, y listo. Dos herramientas sin login lo hacen trivialmente fácil.

## Squoosh: la primera que deberías usar

Cuando necesitas comprimir una imagen con control real sobre el resultado, [Squoosh](https://squoosh.app) es la opción más potente en este espacio. Es una herramienta de código abierto creada por Google que funciona completamente en WebAssembly — tu archivo nunca sale del navegador.

El flujo de trabajo es una vista de comparación lado a lado: original a la izquierda, vista previa comprimida a la derecha. Elige un formato de salida (MozJPEG, WebP, AVIF, JPEG XL, PNG, OxiPNG y más), arrastra un deslizador de calidad y observa cómo se actualiza la estimación del tamaño en tiempo real. La visualización de diferencia muestra exactamente cuántos kilobytes estás ahorrando como porcentaje del original.

Lo que hace a Squoosh mejor que la mayoría de las alternativas es que no simplifica en exceso. Puedes ajustar el submuestreo de croma, elegir la velocidad de codificación y ajustar configuraciones avanzadas del códec si sabes lo que son. O ignorar todo eso y simplemente mover el deslizador de calidad. De cualquier manera, obtienes una vista previa en vivo antes de confirmar — lo cual es poco habitual en las herramientas sin login.

También maneja redimensionado: ancho y alto con bloqueo opcional de relación de aspecto, y múltiples algoritmos de escalado (Lanczos para nitidez, Mitchell para fotos que tienen cierto ringing en los bordes). Ve el [listado de Squoosh en nologin.tools](/tool/squoosh-app) para la lista completa de capacidades. La única limitación: procesa una imagen a la vez, lo que es una fricción si tienes una carpeta de 50 fotos.

## TinyPNG: rápido y completamente automático

[TinyPNG](https://tinypng.com) resuelve el problema del lote. Arrastra hasta 20 imágenes a la vez (hasta 5 MB cada una, sin cuenta) y las comprime usando optimización con pérdida que reduce selectivamente la paleta de colores de formas que la mayoría de la gente no puede ver. Los archivos PNG típicamente se reducen un 60-80%. JPEG y WebP también son compatibles.

La experiencia es un cuadro de arrastrar y soltar, una barra de progreso y un enlace de descarga. Sin nada que configurar. Es una decisión de diseño — el algoritmo toma las decisiones por ti, y es suficientemente bueno como para que probablemente no lo cuestiones.

A diferencia de las herramientas que requieren registro para el procesamiento por lotes, el límite de 20 archivos de TinyPNG se aplica por lote, no por día. Arrastra otras 20 imágenes cuando termine el primer lote. Para fotógrafos preparando una galería antes de subir, o desarrolladores limpiando recursos de imágenes antes de un despliegue, ese flujo de trabajo se mantiene sin necesidad de ninguna cuenta.

La misma calidad de compresión que usa la versión del navegador está disponible como API para desarrolladores y plugin de WordPress — pero la versión web es la opción gratuita sin login. El [perfil de TinyPNG en nologin.tools](/tool/tinypng-com) cubre qué incluye el nivel gratuito frente al plan de pago.

## ezGIF: mucho más de lo que su nombre sugiere

El nombre no le hace justicia. [ezGIF](https://ezgif.com) es una de las herramientas de imagen más completas disponibles sin cuenta, y maneja mucho más que GIFs animados.

Para trabajo con GIFs: crear a partir de un archivo de vídeo o secuencia de imágenes, optimizar el tiempo de fotograma, reducir colores, recortar, redimensionar, invertir, añadir texto. El optimizador de GIFs es especialmente útil — los GIFs animados son tristemente famosos por su gran tamaño, y la optimización de ezGIF típicamente los reduce un 30-40% sin pérdida de calidad visible.

Pero la lista de herramientas va más allá de los GIFs. Hay un optimizador JPG/PNG/WebP, un redimensionador que maneja dimensiones basadas en porcentaje o específicas en píxeles, un convertidor de formato (soporta AVIF, HEIC, BMP, TIFF y otros que muchas «modernas» alternativas discretamente se saltan), un convertidor de imagen a PDF y un cortador de hojas de sprites para trabajo con sprites CSS.

La interfaz es utilitaria — pestañas en la parte superior, un cuadro de subida, resultados abajo. No ha sido rediseñada desde alrededor de 2014 y se nota. Pero todas las funciones trabajan, y el soporte de tipos de archivo es inusualmente amplio: HEIC de iPhones, TIFF de escáneres, AVIF de cámaras más recientes. Si existe un formato, ezGIF probablemente lo maneja. Perfil completo en [ezGIF en nologin.tools](/tool/ezgif-com).

## Convertio y SVGOMG: para los casos particulares

Algunas conversiones de formato son lo suficientemente oscuras como para que la mayoría de las herramientas no las soporten. [Convertio](https://convertio.co) cubre más de 300 formatos de archivo entre imágenes, documentos, audio y vídeo. Para trabajo de imagen específicamente: maneja formatos RAW de cámara (CR2, NEF, ARW), DDS (texturas de juegos), TGA, EXR (formato HDR de pipelines VFX) y otros que las herramientas especializadas omiten.

Las conversiones gratuitas sin registro están limitadas a un límite diario razonable y 100 MB por archivo. Los archivos se suben a los servidores de Convertio (a diferencia del procesamiento en el lado del cliente de Squoosh), así que para imágenes sensibles, consulta su [política de privacidad](https://convertio.co/privacy) antes de proceder. Para convertir una maqueta de producto de RAW a JPG o un icono de SVG a ICO, está bien. Para cualquier cosa confidencial, el procesamiento local de Squoosh es la opción más segura. Ve [Convertio en nologin.tools](/tool/convertio-co).

Los archivos SVG son un problema completamente diferente. Las herramientas de diseño como Figma y Adobe Illustrator exportan SVGs cargados con metadatos del editor, elementos de grupo redundantes, números de precisión hasta 8 decimales y estilos en línea que podrían ser atributos. [SVGOMG](https://jakearchibald.github.io/svgomg/) es el frontend basado en navegador para SVGO — arrastra un SVG y elimina el ruido mientras muestra una vista previa en vivo. Los ahorros típicos en exportaciones de Figma son del 40-70%. El panel de interruptores te permite desactivar optimizaciones individuales si alguna rompe un truco SVG específico. Sin subida, sin cuenta, todo local. Perfil en [SVGOMG en nologin.tools](/tool/jakearchibald-github-io-svgomg).

## Qué herramienta usar para cada tarea

Este es el mapa honesto, porque estas herramientas no compiten entre sí — cubren diferentes necesidades:

| Tarea | Mejor herramienta | ¿Los archivos salen del navegador? |
|-------|-----------------|----------------------------------|
| Comprimir una imagen con control de formato | Squoosh | No |
| Comprimir en lote PNG/JPEG/WebP | TinyPNG | Sí (lado del servidor) |
| Crear u optimizar GIFs | ezGIF | Sí (lado del servidor) |
| Redimensionar con opciones de algoritmo | Squoosh o ezGIF | No / Sí |
| Conversión de formato inusual (RAW, DDS, EXR) | Convertio | Sí (lado del servidor) |
| Optimizar SVG de una herramienta de diseño | SVGOMG | No |

La columna de «¿los archivos salen del navegador?» importa para la privacidad. Squoosh y SVGOMG nunca envían tu archivo a ninguna parte — todo ocurre en WebAssembly o JavaScript en tu pestaña. TinyPNG, ezGIF y Convertio suben a sus servidores, procesan y devuelven resultados. Los tres tienen períodos de retención cortos declarados (típicamente 24 horas o menos), pero estás confiando en su política.

Para la mayoría de las tareas cotidianas — comprimir una foto de producto, redimensionar una imagen de cabecera, convertir un JPEG a WebP — el procesamiento en el servidor es un intercambio razonable por la comodidad y el soporte de formatos que esas herramientas proporcionan. Para imágenes médicas, documentos legales o cualquier cosa personal que preferirías no tener en el servidor de alguien: Squoosh.

> Las herramientas que sobreviven sin encerrarte tienden a ser las que realmente son buenas. Squoosh está construido y mantenido por el equipo de Google Chrome no como un producto con un plan de monetización, sino como una implementación de referencia para los códecs de imagen modernos. Esa alineación de incentivos — «hacer que la compresión de imágenes sea buena para la web» — produce una herramienta mejor que «hacer que los usuarios creen cuentas».

Según el [Web Almanac de HTTP Archive](https://almanac.httparchive.org), la adopción de WebP en la web ha crecido significativamente, pero JPEG y PNG siguen dominando. La brecha entre lo que soportan los navegadores modernos y lo que realmente sirven la mayoría de los sitios representa rendimiento real que se está dejando sobre la mesa. Ninguna de las herramientas para cerrar esa brecha te pide que entregues tu correo electrónico primero.

El directorio más amplio de [nologin.tools](/tool/nologin-tools) cataloga herramientas de privacidad amigable verificadas en docenas de categorías. La sección de herramientas de imagen es uno de los rincones más completos — no faltan servicios que han descubierto que «sin registro» es una característica, no un compromiso, y la colección sigue creciendo.
