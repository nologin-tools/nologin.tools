---
title: "¿PNG, JPEG o WebP? Una guía práctica de optimización de imágenes"
description: "Una guía centrada en el formato para comprimir, convertir y redimensionar imágenes con herramientas de navegador sin registro — con configuraciones de calidad específicas y dimensiones por plataforma."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tutorial", "tools", "browser", "guide"]
featured: false
locale: es
originalSlug: png-jpeg-webp-image-optimization-tutorial
sourceHash: 4deafb9217a610ad
heroImageQuery: "image format comparison compression web optimization"
---

![Hero image](/blog/images/png-jpeg-webp-image-optimization-tutorial/hero.jpg)

La mayoría de la gente elige el formato de imagen por casualidad. Lo exportan desde Figma, lo guardan desde Photoshop o hacen una captura de pantalla, y usan el formato que salga. Después lo pasan por un compresor esperando que el archivo se haga más pequeño, sin entender por qué a veces no se reduce tanto como esperaban.

La elección del formato importa más que cualquier ajuste de compresión. Un JPEG comprimido a calidad 85 será más pequeño que un PNG comprimido a calidad 85, y no porque el compresor haya trabajado más duro, sino porque JPEG y PNG codifican los datos de imagen de manera fundamentalmente diferente. Tomar la decisión correcta sobre el formato antes de abrir una herramienta de compresión te ahorrará más bytes que cualquier slider.

Este tutorial cubre primero la decisión del formato y luego herramientas y configuraciones específicas para comprimir, convertir y redimensionar. Todo funciona sin crear una cuenta.

## La decisión de formato que debes tomar antes que nada

Tres formatos cubren casi todos los casos de uso web y cotidianos: JPEG, PNG y WebP. Te lo cuento sin rodeos:

**JPEG** es para fotografías e imágenes con gradientes de tonos continuos: retratos, paisajes, fotos de comida. Usa compresión con pérdida que aprovecha cómo la visión humana percibe el color frente al brillo. Por eso, una foto JPEG a calidad 80 se ve prácticamente igual que el original a aproximadamente la mitad del tamaño. JPEG maneja bien las transiciones de color suaves, pero falla en los bordes duros (texto, logos, iconos), donde aparecen los típicos artefactos de bloques.

**PNG** es para capturas de pantalla, ilustraciones, logos, iconos y cualquier cosa que necesite valores exactos de píxeles o transparencia. PNG es sin pérdida: comprime sin descartar ningún dato. Por eso un PNG de una foto siempre es más grande que un JPEG de la misma foto. Nunca uses PNG para fotografías. Usa siempre PNG para cosas con bordes nítidos, transparencia o texto.

**WebP** es para todo, en tamaños más pequeños. [WebP](https://developers.google.com/speed/webp) produce archivos aproximadamente un 25-35% más pequeños que JPEG para fotos y cerca de un 26% más pequeños que PNG para gráficos, con calidad visual equivalente. El soporte de navegadores es ahora del [97% globalmente](https://caniuse.com/webp): Safari añadió soporte en 2020, que era el último en hacerlo. Para uso web, rara vez hay razón para entregar JPEG o PNG cuando puedes servir WebP.

El árbol de decisión práctico: si vas a publicar en la web, usa WebP. Si algo requiere específicamente PNG (fondo transparente, precisión de color exacta para impresión), usa PNG. Si vas a enviarlo a alguien que necesita editarlo después, usa JPEG para fotos o PNG para gráficos. Si lo adjuntas a un email o lo subes a una plataforma que no admite WebP, usa JPEG para fotos y PNG para todo lo demás.

## Comprimir con Squoosh: los ajustes que realmente importan

Cuando tienes una sola imagen que necesita compresión cuidadosa — una imagen principal, una foto de producto, una pieza de portfolio — [Squoosh](https://squoosh.app) es la herramienta adecuada. La creó el equipo de Google Chrome, funciona completamente en WebAssembly y tus archivos nunca salen del navegador.

Abre Squoosh y arrastra tu imagen. La interfaz se divide en una vista antes (izquierda) y después (derecha) con un divisor arrastrable. En el panel derecho, elige el formato de salida y ajusta la configuración.

Para imágenes web, empieza con **WebP a calidad 80**. Esa configuración cubre la mayoría de los casos: produce una salida visualmente casi idéntica con tamaños de archivo dramáticamente más pequeños comparado con JPEG a la misma calidad. La estimación de tamaño en la esquina inferior derecha se actualiza mientras mueves el slider. Observa qué pasa entre calidad 75 y 85: normalmente verás un ahorro significativo de bytes bajando a 75 con cambios apenas visibles, y luego una degradación más notoria por debajo de 70. La calidad 80 es el punto óptimo para la mayoría del contenido fotográfico.

Para imágenes con texto, líneas nítidas o transparencia, cambia el formato de salida a **WebP (sin pérdida)**. Squoosh te avisará de que esto es más grande que la compresión con pérdida, pero preserva los valores exactos de píxeles. Compara el resultado con una compresión con pérdida y comprueba si la diferencia es visible a tu tamaño de visualización.

Squoosh también gestiona el redimensionado en el panel "Editar". Introduce un ancho objetivo en píxeles — o haz clic en el toggle de porcentaje e introduce 50% para reducir las dimensiones a la mitad — y activa el bloqueo de relación de aspecto. El algoritmo de redimensionado **Lanczos3** es la elección correcta para fotografías; preserva la nitidez mejor que el bilineal o el de caja. Para iconos o píxel art que se amplían, usa "Vecino más cercano" para preservar los bordes duros en lugar de difuminarlos.

Una cosa que Squoosh no hace: procesamiento por lotes. Es un archivo a la vez, lo cual está bien para una imagen específica en la que estás trabajando, pero es poco práctico para 40 fotos de producto.

## Compresión por lotes sin registrarte

Cuando la cantidad importa más que el control por imagen, [TinyPNG](https://tinypng.com) gestiona hasta 20 imágenes a la vez sin necesidad de cuenta. Arrastra una carpeta de imágenes al cuadro de subida y las procesa todas en paralelo.

El algoritmo de TinyPNG para archivos PNG usa cuantización selectiva de colores: reduce el número de colores distintos de hasta 16 millones a una paleta más pequeña, y luego aplica compresión estándar al resultado. La diferencia visual es normalmente imperceptible. Los archivos PNG habitualmente se reducen un 60-80%, a veces más para gráficos simples con grandes áreas de color sólido.

Para archivos JPEG, TinyPNG recodifica con cuantización más agresiva y elimina metadatos (datos EXIF, perfiles de color, comentarios incrustados). Una foto de 3 MB tomada con el móvil a menudo sale por debajo de 500 KB. El algoritmo toma la decisión de calidad por ti, y está bien calibrado.

No hay límite diario en el nivel gratuito de 20 archivos: cada lote de 20 es independiente. Termina un lote, suelta otros 20. Para un lote de 200 fotos, son 10 arrastres. Tedioso, pero funciona sin crear una cuenta ni pagar por acceso a la API.

Una limitación honesta: TinyPNG sube los archivos a sus servidores. Las imágenes se eliminan después de un tiempo, pero si estás comprimiendo imágenes sensibles (documentos legales, fotos médicas, material privado), quédate con el procesamiento local de Squoosh. Para fotos de producto o imágenes de blog, el procesamiento en servidor es un intercambio perfectamente razonable.

## Redimensionar para plataformas específicas

"Redimensionar a las dimensiones correctas" suena sencillo hasta que estás mirando ocho tamaños recomendados para ocho plataformas diferentes. Aquí están las dimensiones estándar actuales para los casos más comunes:

| Plataforma / Caso de uso | Dimensiones recomendadas | Formato |
|--------------------------|--------------------------|---------|
| Imagen hero web | 1920×1080 o 1440×900 | WebP |
| Imagen de entrada de blog | 1200×675 (16:9) | WebP o JPEG |
| Open Graph / previsualización de enlace | 1200×630 | JPEG (amplia compatibilidad) |
| Imagen de post Twitter/X | 1600×900 | JPEG o WebP |
| Instagram cuadrado | 1080×1080 | JPEG |
| Instagram Story / Reel | 1080×1920 | JPEG |
| Banner de LinkedIn | 1584×396 | JPEG |
| Imagen para newsletter | máx. 600px de ancho | JPEG |
| Favicon | 32×32, 180×180 (Apple) | PNG |

Para redimensionar, las mismas herramientas que comprimen también redimensionan. Squoosh (con el panel Editar abierto) y [ezGIF](https://ezgif.com) permiten especificar dimensiones exactas en píxeles. Para más control — recortar a una relación de aspecto exacta, reposicionar el contenido dentro de un marco — [Photopea](https://www.photopea.com) es la opción más capaz sin necesidad de login. Carga un editor completo similar a Photoshop en el navegador y te permite usar los controles de tamaño de lienzo, recorte y tamaño de imagen exactamente como en Photoshop, sin ninguna cuenta.

## Convertir HEIC y otros formatos complicados

Los iPhones graban en HEIC por defecto (a veces escrito como HEIF). Es un formato excelente — más pequeño que JPEG con mejor calidad — pero todavía no está ampliamente aceptado. WordPress lo rechaza. La mayoría de los navegadores web no lo muestran. Los clientes de correo lo renderizan de manera inconsistente.

Para convertir HEIC a JPEG, [ezGIF](https://ezgif.com) lo gestiona sin registro. Ve a la pestaña "Image Converter", sube un archivo HEIC, elige JPEG como salida y descarga el resultado. La conversión funciona, aunque ezGIF no es el más rápido para lotes grandes.

[Convertio](https://convertio.co) gestiona formatos RAW de cámara (CR2, NEF, ARW), texturas de juegos (DDS) y formatos HDR como EXR, cosas que la mayoría de las herramientas de imagen ignoran silenciosamente. Las conversiones gratuitas sin cuenta están limitadas a unas 10 por día y 100 MB por archivo, lo que cubre el uso ocasional. Los archivos se suben a los servidores de Convertio, así que revisa su [política de privacidad](https://convertio.co/privacy) para material sensible.

Para archivos SVG específicamente: las herramientas de diseño como Figma exportan SVGs cargados de metadatos del editor, estilos en línea y precisión numérica de hasta 8 decimales. Los archivos son técnicamente válidos pero innecesariamente grandes. Pásalos por [SVGOMG](/tool/jakearchibald-github-io-svgomg) — un optimizador de SVG basado en navegador — antes de publicarlos. Los ahorros típicos en una exportación de Figma rondan el 40-70%, procesado completamente en el lado del cliente.

## Un flujo de trabajo realista para los casos más comunes

Para la mayoría de la gente la mayor parte del tiempo, el flujo de trabajo correcto es:

**Foto del móvil → sitio web**: Abre en Squoosh, pon la salida en WebP, calidad 80, redimensiona a 1200px de ancho. Listo. El archivo será menor de 200 KB para casi cualquier foto.

**Fotos de producto (por lotes)**: Arrastra hasta 20 a la vez a TinyPNG. Descarga, repite. Sin conversión de formato, solo reducción de tamaño.

**Captura de pantalla → entrada de blog**: Squoosh o TinyPNG. Las capturas de UI oscuras se comprimen especialmente bien con WebP sin pérdida.

**HEIC del iPhone → JPEG compartible**: Conversor de imágenes de ezGIF, entrada HEIC, salida JPEG.

**Logo o icono para sitio web**: Si tienes el SVG, optimiza con SVGOMG. Si necesitas un PNG, exporta desde tu herramienta de diseño y pásalo por TinyPNG.

**Convertir cualquier cosa inusual**: Convertio para formatos que las otras herramientas no manejan.

> La mejor cosa única que la mayoría de la gente puede hacer con sus archivos de imagen es cambiar de JPEG a WebP para la salida web. La segunda mejor es redimensionar a las dimensiones de visualización reales antes de comprimir: no tiene sentido entregar una imagen de 3000px de ancho que se va a mostrar a 800px. Ambos pasos son gratuitos, instantáneos y no requieren cuenta.

Las herramientas descritas aquí están verificadas en el [directorio de nologin.tools](/tool/squoosh-app). El [HTTP Archive Web Almanac](https://almanac.httparchive.org/en/2024/media) muestra consistentemente que las imágenes son la categoría de activos más pesada en la web y que la adopción de WebP/AVIF sigue bien por debajo de lo que los navegadores podrían gestionar. La brecha entre lo que es técnicamente posible y lo que la mayoría de los sitios entregan sigue siendo grande, y se cierra un archivo a la vez.

Si quieres un vistazo más amplio sobre lo que estas herramientas cubren más allá de lo básico descrito aquí, el artículo anterior sobre [herramientas de compresión y conversión de imágenes](/blog/compress-convert-resize-images-no-login) cubre las opciones de formato y los pros y contras de las herramientas con mayor profundidad.
