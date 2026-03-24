---
title: "hat.sh: cifra tus archivos en el navegador sin confiar en nadie"
description: "hat.sh cifra y descifra archivos usando AES-256-GCM directamente en tu navegador. Sin subidas, sin servidores, sin cuentas: tus datos nunca salen de tu dispositivo."
publishedAt: 2026-03-24
author: "nologin.tools"
tags: ["tools", "review", "privacy", "encryption"]
featured: false
locale: es
originalSlug: hat-sh
sourceHash: 49157d5e315dbffb
heroImageQuery: "file encryption security lock browser"
---

![Hero image](/blog/images/hat-sh/hero.jpg)

Todos los servicios de almacenamiento en la nube, todas las plataformas de intercambio de archivos, todas las herramientas de subida que se anuncian como "seguras" tienen algo en común: tus archivos pasan por el ordenador de otra persona. Estás confiando en el cifrado del proveedor, su gestión de claves, sus empleados y sus obligaciones legales ante cualquier solicitud de datos. Es mucha confianza para depositar en una empresa que no conoces de nada.

¿Y si el cifrado ocurriera antes de que el archivo abandonara tu máquina? ¿En tu navegador, sin que ningún servidor vea jamás el texto en claro?

Eso es exactamente lo que hace [hat.sh](https://hat.sh).

## Qué hace hat.sh en realidad

hat.sh es una herramienta de cifrado de archivos que funciona en el navegador. Arrastras un archivo a la página, introduces una contraseña (o proporcionas una clave pública), y el sistema genera un archivo `.enc` cifrado. Para descifrar, arrastras el `.enc` a la misma página, introduces la contraseña y recuperas el archivo original. Todo ocurre localmente en JavaScript: sin peticiones de red con el contenido del archivo, sin backend, sin base de datos.

El esquema de cifrado es AES-256-GCM, el mismo algoritmo que utilizan Signal, WhatsApp y la mayoría de las conexiones TLS modernas. Es cifrado autenticado, lo que significa que la descifración falla de forma explícita si el archivo fue manipulado en algún punto. No puedes corromper silenciosamente un archivo cifrado y hacer que hat.sh lo acepte.

hat.sh tiene dos modos:

- **Cifrado basado en contraseña**: Estableces una contraseña y la herramienta deriva una clave de cifrado usando PBKDF2. Cualquiera que tenga la contraseña puede descifrar.
- **Cifrado de clave pública**: Generas un par de claves, compartes tu clave pública, y cualquiera puede cifrar archivos que solo tú puedes abrir con tu clave privada. Usa el intercambio de claves X25519 combinado con AES-256-GCM.

El modo de clave pública es especialmente útil para equipos. Un periodista puede publicar su clave pública; las fuentes pueden usar hat.sh para cifrar documentos antes de enviarlos, sin necesidad de configuración alguna en el lado del emisor.

## Sin login, sin subida, sin cuenta

La historia de privacidad aquí es inusualmente limpia. El [código fuente está en GitHub](https://github.com/sh-dv/hat.sh) bajo licencia MIT: puedes leer exactamente qué JavaScript se ejecuta en tu navegador. No hay telemetría, no hay llamadas de analítica con los metadatos de tus archivos, y no hay componente en el servidor que pueda verse comprometido.

Comparado con los servicios típicos de intercambio "seguro" de archivos:

| Característica | Servicio típico de subida cifrada | hat.sh |
|----------------|-----------------------------------|--------|
| Archivos enviados al servidor | Sí | No |
| Cuenta requerida | A menudo | Nunca |
| El servidor ve el texto en claro | Depende de la implementación | No |
| Código fuente auditable | Raramente | Sí (MIT) |
| Funciona sin conexión | No | Sí (tras la primera carga) |

Herramientas como [VirusTotal](/tool/virustotal-com) envían tus archivos a servidores externos por diseño: ese es su propósito. hat.sh es lo contrario: el objetivo es que el contenido de tus archivos no vaya a ninguna parte.

## Cuándo usarías hat.sh

Imagina a una contable autónoma que necesita enviar documentos fiscales a un cliente. El correo electrónico es texto en claro. La mayoría de los enlaces de intercambio de archivos caducan o quedan indexados. Quiere algo sencillo: abrir una página web, cifrar el archivo con una contraseña compartida, enviar el resultado.

O piensa en un desarrollador que está rotando credenciales en un repositorio. Necesita compartir un archivo `.env` con un compañero de equipo, una sola vez, de forma segura. No quiere montar toda la infraestructura de claves GPG para una única transferencia. hat.sh le permite cifrar con una contraseña de un solo uso y enviar el `.enc` por Slack, Discord o correo. El blob cifrado no tiene ningún valor sin la contraseña.

Para los investigadores de seguridad, el modo de clave pública tiene utilidad real. Puedes distribuir tu clave pública en tu web y dejar que cualquiera te envíe archivos cifrados sin que tengan que instalar nada. Sin servidor de claves PGP, sin cliente GPG, sin la complejidad de la [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust).

## La honestidad técnica del cifrado en el cliente

El cifrado en el lado del cliente tiene una limitación importante que merece reconocerse: si el propio sitio web se ve comprometido, un JavaScript malicioso podría exfiltrar tu contraseña o archivo antes de cifrarlo. Esta es la tensión fundamental de cualquier herramienta de criptografía basada en el navegador.

hat.sh lo aborda de varias formas. Primero, el código abierto permite que cualquiera audite el JavaScript. Segundo, puedes descargar el repositorio y ejecutar hat.sh localmente, en un entorno completamente aislado de la red. Tercero, para usuarios con requisitos de seguridad muy elevados, el proyecto incluye un Docker preparado para el autoalojamiento.

Para la mayoría de los casos de uso —enviar documentos sensibles a un colega, cifrar una copia de seguridad antes de subirla a la nube, proteger un archivo de configuración— el modelo de amenaza no incluye una CDN comprometida. El cifrado en el navegador es una mejora de seguridad sustancial frente a enviar archivos en claro.

Si te interesa entender cómo gestiona tu navegador la criptografía, la [especificación de la Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/) documenta los primitivos que hat.sh usa por debajo. Es una función nativa del navegador, no una implementación personalizada, lo que significa que las operaciones criptográficas ocurren en código C++ optimizado, no en JavaScript interpretado.

## hat.sh comparado con herramientas similares sin login

Quizás ya conozcas [CyberChef](/tool/gchq-github-io-cyberchef), que también se ejecuta completamente en el navegador y puede manejar cifrado AES. CyberChef es una herramienta de transformación de datos de propósito general: maneja codificación, compresión, hashing y cientos de operaciones más además del cifrado. Esa amplitud la hace potente, pero también compleja para usuarios no técnicos.

hat.sh está diseñada para una sola cosa: cifrar archivos para su transporte o almacenamiento seguro. La interfaz es tan sencilla que puedes pasarle la URL a alguien que no sabe qué es AES y lo entenderá en menos de un minuto. La simplicidad es una característica, no una limitación.

[Wormhole](/tool/wormhole-app) resuelve un problema relacionado pero distinto: transferencia de archivos P2P con cifrado de extremo a extremo. Pero requiere que ambas partes estén conectadas simultáneamente y los archivos pasan por servidores de retransmisión. hat.sh genera un archivo cifrado estático que puedes enviar por cualquier canal de forma asíncrona.

## Cómo empezar

Usar hat.sh por primera vez lleva unos 30 segundos:

1. Ve a [hat.sh](https://hat.sh)
2. Arrastra y suelta cualquier archivo en la página (o haz clic para explorar)
3. Elige el modo "Password" e introduce una frase de contraseña robusta
4. Haz clic en **Encrypt**: descargarás un archivo `.enc`
5. Comparte el `.enc` por el canal que prefieras; envía la contraseña por separado

Para descifrar:

1. Ve a [hat.sh](https://hat.sh)
2. Arrastra el archivo `.enc`
3. Introduce la contraseña
4. Tu archivo original se descarga automáticamente

Todo el proceso no requiere cuenta, instalación ni confiar en ningún tercero. El archivo cifrado son solo bytes: puedes guardarlo en Dropbox, enviarlo por correo o publicarlo. Sin la contraseña, es opaco.

---

Las herramientas de privacidad suelen implicar un compromiso: o consigues seguridad robusta con complejidad dolorosa (GPG), o consigues facilidad de uso con los datos yendo a los servidores de otra persona. hat.sh apuesta por algo diferente: que una aplicación web bien diseñada, transparente y de código abierto puede darte las dos cosas. A medida que los navegadores se vuelven más capaces y la Web Crypto API madura, espera que más herramientas sigan este patrón: el servidor solo entrega el código, y todo lo sensible ocurre en tu máquina.
