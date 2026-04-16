---
title: "Compresión de imágenes gratis con Squoosh — Sin cuenta, sin subida de archivos"
description: "Guía paso a paso para comprimir imágenes con Squoosh en tu navegador. Sin login, sin subida a servidores — cubre ajustes AVIF, WebP, JPEG, PNG y uso de CLI en lote."
publishedAt: 2026-04-16
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "open-source"]
featured: false
locale: es
originalSlug: squoosh-free-image-compression-guide
sourceHash: f54e1dbf39ce8747
heroImageQuery: "image compression browser WebAssembly optimize"
---

![Hero image](/blog/images/squoosh-free-image-compression-guide/hero.jpg)

Necesitas comprimir una imagen. A ser posible ahora mismo, sin crear ninguna cuenta, sin subir tus archivos a un servidor que no controlas, y sin jugar a la ruleta rusa con alguna herramienta que simplemente escupe "¡comprimido!" y no te dice absolutamente nada. Las opciones habituales te cortan a 5 MB en el plan gratuito, te meten una marca de agua en el resultado, o te ofrecen cero visibilidad sobre lo que realmente han hecho con tu archivo.

[Squoosh](https://squoosh.app) resuelve todo esto de golpe. Ábrelo en una pestaña del navegador, arrastra tu imagen, ajusta los parámetros, descarga el resultado. Sin login. Sin subida a ningún servidor remoto. La compresión ocurre dentro de tu navegador usando módulos WebAssembly compilados a partir de los mismos codecs que emplean los sistemas en producción: MozJPEG, libavif, OxiPNG, libwebp.

Esta guía cubre cómo usarlo de forma eficaz: qué formato elegir en cada situación, qué ajustes marcan realmente la diferencia, y cómo gestionar trabajos en lote sin instalar nada permanentemente.

## Qué hace Squoosh (y por qué eso es poco habitual)

La mayoría de los compresores online suben tu archivo a un servidor back-end, ejecutan la compresión allí y te devuelven un archivo más pequeño. Eso significa que tus imágenes —fotos de clientes, mockups confidenciales, fotos de producto antes de que sean públicas— se quedan en el servidor de alguien durante un tiempo indeterminado. Estás confiando en su política de retención. En su seguridad.

Squoosh compila los codecs de compresión a WebAssembly y los ejecuta localmente en tu pestaña. Nada sale de tu máquina. No es una afirmación de marketing: es una consecuencia de la arquitectura. No hay servidor al que subir nada.

Está desarrollado y mantenido por [Google Chrome Labs](https://github.com/GoogleChromeLabs/squoosh), con código abierto bajo Apache 2.0. Si quieres una comparativa en detalle con alternativas como TinyPNG y Convertio, la [reseña de Squoosh en este sitio](/blog/squoosh-beats-online-image-compressors) lo analiza mano a mano. Esta guía es práctica: ajustes, flujos de trabajo, decisiones.

## ¿Qué formato deberías usar?

La primera decisión que tomarás es el formato de salida. Esto importa más que cualquier deslizador de calidad, porque los distintos formatos tienen fortalezas fundamentalmente diferentes.

| Formato | Ideal para | Soporte en navegadores | Tamaño vs. JPEG |
|---------|-----------|------------------------|-----------------|
| MozJPEG | Fotos, alta complejidad de color | Universal | Referencia |
| OxiPNG | Gráficos con transparencia, capturas | Universal | Mayor |
| WebP | Imágenes web en general | Todos los navegadores modernos | ~25% menor |
| AVIF | Imágenes web, mejor compresión | Chrome, Firefox, Safari, Edge | ~50% menor |
| JPEG XL | Preparado para el futuro | Limitado (experimental) | ~60% menor |

Para la mayoría de imágenes web en 2026, **AVIF es la opción por defecto correcta**. Produce archivos entre un 30 y un 50% más pequeños que WebP con calidad visual equivalente, y el soporte en navegadores ya cubre todos los grandes. Si necesitas compatibilidad con navegadores muy antiguos o el destino es una herramienta que no maneja formatos modernos, WebP es la alternativa segura. JPEG sigue siendo relevante para compatibilidad universal: cualquier plataforma, cualquier visor.

PNG es sin pérdidas. Recurrirás a OxiPNG cuando se requiera transparencia: iconos, logos con fondo transparente, capturas de pantalla de UI donde el renderizado pixel-perfect del texto importa. Nunca PNG para fotos. Los archivos serán enormes.

JPEG XL es técnicamente impresionante, pero el soporte en navegadores sigue siendo lo bastante inconsistente como para omitirlo en la mayoría de usos en producción.

## Los ajustes que realmente marcan la diferencia

Una vez que has elegido el formato, el deslizador de calidad es el control principal. Pero "calidad" significa cosas distintas en cada codec, y los números no son directamente comparables.

**Fotografías web e imágenes hero**: Empieza en AVIF calidad 60-70. Puede sonar agresivo, pero AVIF gestiona los ajustes de baja calidad con mucha más elegancia que JPEG. A calidad 60, un JPEG suele mostrar artefactos de bloque visibles; AVIF con ese mismo valor nominal se ve considerablemente más limpio. Usa el deslizador de comparación (más adelante sobre esto) para confirmarlo.

**Fotografía de producto para e-commerce**: WebP a calidad 75-80, o MozJPEG a 75 si necesitas la máxima compatibilidad de formato. Las imágenes de producto requieren detalle fino en bordes y texturas. Baja de calidad 70 y normalmente verás suavizado en tejidos, texto en relieve y formas intrincadas.

**Capturas de pantalla e imágenes de UI**: OxiPNG con nivel de compresión 3. Niveles más altos reducen más el tamaño de archivo pero tardan significativamente más. El nivel 3 es el punto óptimo práctico para la mayoría de capturas. Si la imagen tiene grandes áreas de color sólido (habitual en capturas de UI), OxiPNG frecuentemente supera a AVIF porque la compresión sin pérdidas gestiona las regiones uniformes de forma muy eficiente.

**Miniaturas y avatares**: WebP a calidad 80, redimensionado a las dimensiones de visualización reales. Squoosh tiene un panel de redimensionado: úsalo. Servir un original de 3024 píxeles a un tamaño de visualización de 120 px es uno de los errores de rendimiento de imagen más comunes, y ninguna cantidad de compresión soluciona el problema de fondo.

**Imágenes de fondo y texturas**: Toleran una compresión más agresiva porque se perciben con baja atención visual. AVIF a calidad 50-60 suele funcionar perfectamente; es poco probable que notes ninguna diferencia de calidad cuando una imagen se muestra detrás del texto.

Regla general: empieza en calidad 75 para AVIF/WebP, o 80 para JPEG. Después usa el deslizador de comparación para ver hasta dónde puedes apretar.

## Cómo usar el deslizador de comparación de forma efectiva

El deslizador de comparación es lo que separa a Squoosh de las herramientas que te entregan un resultado sin más explicación. Tienes el original a la izquierda, la salida comprimida a la derecha, con los números reales del tamaño de archivo en la parte inferior. Arrastra el divisor para revelar uno u otro lado.

La técnica: centra el deslizador y luego céntrate en las partes de la imagen que peor comprimen: bordes nítidos, texto fino, degradados de color suaves y caras humanas. Son donde los artefactos aparecen primero. Si no ves ninguna diferencia significativa en esas zonas, el ajuste de calidad actual es adecuado. Si ves suavizado, bloques o bandas de color, sube la calidad.

Con AVIF en particular, presta atención a las transiciones de color más que solo a los bordes. AVIF puede introducir bandas de color sutiles en degradados suaves a ajustes de baja calidad —se aprecia más en fotos de cielo o fondos con cambios de color suaves, menos en fotos de producto con detalle abundante.

Con OxiPNG, el deslizador de comparación principalmente confirma que la compresión sin pérdidas funcionó correctamente. La salida debería verse idéntica al original; si no es así, algo inesperado ocurrió (poco habitual, pero vale la pena comprobarlo).

Una vez que la calidad es la correcta, revisa la reducción de tamaño de archivo en la interfaz de Squoosh. Un resultado razonable para imágenes web es un 60-80% más pequeño que el original. Si obtienes menos de un 40% de reducción en una foto JPEG convertida a AVIF, prueba a bajar más la calidad: casi con toda seguridad estás dejando ahorro potencial encima de la mesa.

## Redimensionar: el paso que la gente omite

Los ajustes de calidad no son el único factor. Redimensionar a las dimensiones de visualización reales a menudo consigue mayor reducción de tamaño de archivo que cualquier ajuste de calidad.

El panel de redimensionado de Squoosh te permite establecer un ancho o alto objetivo. Algunas notas sobre los algoritmos disponibles: **Lanczos3** produce el resultado más nítido con mínimo aliasing y es la opción correcta para la mayoría de fotos. **Triangle** es más rápido pero más suave. **Mitchell** cae entre ambos.

Antes de tocar el deslizador de calidad, pregúntate si necesitas la resolución original. Si tu sitio muestra imágenes de posts del blog a 800 px de ancho, servir un original de 3024 píxeles es ancho de banda desperdiciado incluso con la máxima compresión. Redimensiona primero, luego comprime. El ahorro combinado es casi siempre mayor que cualquiera de los dos enfoques por separado.

Squoosh aplica el redimensionado antes de la compresión, que es el orden correcto. Estableces las dimensiones finales en el panel de redimensionado, ajustas la calidad en el panel de compresión, y el archivo descargado refleja ambos cambios.

## Más allá de un archivo a la vez

La interfaz web de Squoosh gestiona una imagen a la vez. Para comprimir una carpeta de archivos en un solo pase, la CLI de Squoosh es la respuesta —y no requiere instalación permanente.

Con Node.js instalado, ejecuta:

```bash
npx @squoosh/cli --avif '{"quality":65}' *.jpg
```

Esto comprime todos los JPEG del directorio actual a AVIF con calidad 65, escribiendo los archivos de salida junto a los originales con extensión `.avif`. Para WebP: `--webp '{"quality":80}'`. Para MozJPEG: `--mozjpeg '{"quality":75}'`. Para redimensionar mientras comprimes: `--resize '{"width":1200}'`.

La CLI usa los mismos módulos WebAssembly que la interfaz web, así que la salida es idéntica. Esto es especialmente útil en flujos de trabajo donde tienes una carpeta de fotografías en bruto que necesitan estar listas para la web antes de subirlas a un CMS o pipeline de publicación. Sin instalación permanente, sin suscripción, sin servidor.

## Cuándo Squoosh no es la herramienta adecuada

Squoosh gestiona imágenes rasterizadas. Para archivos SVG, [SVGOMG](/tool/jakearchibald-github-io-svgomg) es el equivalente: se ejecuta localmente en tu navegador, sin límites de tamaño de archivo, sin cuenta. No proceses SVGs con Squoosh.

Para archivos muy grandes —panorámicas de 100+ megapíxeles, archivos TIFF de cámaras de formato medio— Squoosh puede agotar la memoria del navegador. Las herramientas de escritorio lo manejan mejor.

Si necesitas comprimir JPEG o PNG rápidamente sin control de calidad y no te preocupa la privacidad del archivo, [TinyPNG](/tool/tinypng-com) es más rápido para esa tarea concreta. Automatiza la decisión y elimina el deslizador. Útil si no te importa el compromiso y solo quieres algo más pequeño.

Para conversión de formatos más allá de las imágenes (documentos, vídeo, audio), Squoosh no te ayudará: está diseñado específicamente para la compresión de imágenes.

## Algunas prácticas que vale la pena adoptar

Renombra los archivos antes de descargarlos. Squoosh genera nombres como `image-compressed.avif`. Si procesas varios archivos en una sesión sin renombrar, acabarás con una carpeta de `image-compressed (1).avif`, `image-compressed (2).avif`, y así sucesivamente.

Conserva el original. La compresión AVIF y WebP es con pérdidas. Si más adelante necesitas un nivel de calidad diferente o un formato de salida distinto, querrás partir del original: comprimir un archivo ya comprimido acumula degradación de calidad.

No apliques el mismo valor de calidad a todas las imágenes. Una fotografía de primer plano con mucho detalle se comprime de forma diferente a un paisaje amplio con el mismo valor nominal. Un nivel de calidad que supone una degradación invisible en una imagen puede ser claramente visible en otra. El deslizador te da la respuesta; confía en él antes que en los números fijos.

---

La optimización de imágenes es una de esas tareas que vale la pena hacer bien, y la herramienta correcta es gratuita, funciona sin cuenta y se ejecuta completamente en tu navegador. Para más herramientas en esa categoría —sin login, sin subidas, sin rastreo— [nologin.tools](/tool/nologin-tools) tiene cientos organizadas por caso de uso.
