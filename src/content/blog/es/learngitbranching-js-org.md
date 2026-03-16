---
title: "Deja de memorizar comandos de Git: aprende las ramas de Git de forma visual"
description: "Learn Git Branching convierte una de las herramientas más confusas de la programación en un juego de puzzles visuales e interactivos que puedes jugar directamente en el navegador."
publishedAt: 2026-03-16
author: "nologin.tools"
tags: ["tools", "review", "education", "development"]
featured: false
heroImageQuery: "git branching visualization colorful diagram"
locale: es
originalSlug: learngitbranching-js-org
sourceHash: 6064e4a6ec2e2740
---

![Hero image](/blog/images/learngitbranching-js-org/hero.jpg)

La mayoría de los desarrolladores tienen una confesión que hacer: llevan años usando Git, pero las ramas siguen haciéndoles la cabeza. Escribes `git rebase`, algo se rompe, haces `git reset --hard` y juras que nunca volverás a tocar rebase. ¿Te suena familiar?

El caso es que el modelo subyacente de Git es en realidad elegante. La confusión viene de aprenderlo al revés: memorizas la sintaxis de los comandos antes de entender qué hacen realmente esos comandos en tu repositorio. **Learn Git Branching** (https://learngitbranching.js.org) da la vuelta a este enfoque por completo, y puedes empezar a usarlo en menos de treinta segundos sin necesidad de crear una cuenta.

## Qué es exactamente Learn Git Branching

Abres el sitio y te meten directamente en un sandbox interactivo. A la izquierda, una terminal donde escribes comandos Git reales. A la derecha, un grafo animado de tu repositorio: nodos para los commits, líneas para las ramas, flechas que muestran dónde apunta HEAD. Escribe `git commit` y observa cómo aparece un nuevo nodo. Escribe `git branch feature` y verás cómo se bifurca una nueva etiqueta. Escribe `git checkout feature && git commit` dos veces y mira cómo se forma la divergencia en tiempo real.

Esta es la clave: el modelo mental de Git es un grafo acíclico dirigido (DAG), y ver ese grafo actualizarse al instante mientras escribes comandos hace que las abstracciones se vuelvan concretas de una manera que ninguna cantidad de lectura puede igualar.

La herramienta organiza el contenido en dos secuencias principales: **Main** (que cubre commits, ramificación, merge, rebase, cómo moverse con HEAD, refs relativas y reversión de cambios) y **Remote** (que cubre el flujo completo de push/pull/fetch con repositorios remotos). Cada secuencia contiene varios niveles, y cada nivel presenta un reto concreto: "haz que el repositorio tenga este aspecto".

Sin registro. Sin sincronización de progreso a un servidor. Tus avances se guardan en localStorage, así que persisten entre sesiones del navegador en la misma máquina. Si quieres probar algo arriesgado, hay un comando `reset` para limpiar el sandbox y empezar el nivel actual desde cero.

## Por qué importa la visualización de Git

Compara estas dos explicaciones de `git rebase main`:

**Explicación textual**: Rebase reproduce los commits de la rama actual sobre la punta de la rama de destino, resultando en un historial lineal.

**Explicación visual**: Observa cómo los commits de tu rama feature se desprenden, se reescriben con nuevos hashes SHA y se reenganchan como una línea limpia encima de main, todo animado en aproximadamente medio segundo.

Las dos dicen lo mismo. Solo una realmente cala.

Este es el mismo principio que hay detrás de herramientas como [VisuAlgo](/tool/visualgo-net), que visualiza algoritmos de ordenación y grafos mediante animaciones, o [Python Tutor](/tool/pythontutor-com), que recorre la ejecución de código Python línea a línea mostrando el estado de las variables. El patrón se repite: para procesos computacionales abstractos, la visualización no es una ayuda didáctica, es la explicación en sí.

Git es especialmente adecuado para este tratamiento porque su modelo de datos es genuinamente visual. Cada repositorio es literalmente un grafo. Los comandos de texto son simplemente una interfaz textual sobre ese grafo. Cuando lo ves representado, los comandos dejan de ser conjuros y pasan a ser manipulaciones del grafo.

## Los niveles: un recorrido

La secuencia introductoria empieza con suavidad. El nivel 1 te pide simplemente que escribas `git commit` dos veces. Las instrucciones explican qué es un commit. El grafo te muestra una cadena lineal de tres nodos. Eso es todo.

En el nivel 5 ya estás haciendo cherry-pick de commits y moviendo ramas con `git branch -f`. Cuando llegas a la sección de remoto, estás gestionando historiales divergentes entre local y origin, y resolviendo las situaciones que realmente rompen a los desarrolladores en producción.

Algunos ejercicios destacados:

- **"Detach yo' HEAD"**: enseña refs relativas como `HEAD~3` obligándote a hacer checkout de commits por posición en lugar de por nombre de rama. Solo esto explica docenas de misteriosas advertencias de `detached HEAD state`.
- **"Locally stacked commits"**: presenta un escenario realista donde has mezclado commits de depuración con una funcionalidad real, y necesitas publicar la funcionalidad sin el ruido de depuración. La solución implica `git rebase -i` o `git cherry-pick`, y el nivel acepta ambas opciones.
- **"Push Main!"**: el nivel final de la sección remota, que simula la situación en la que tu push es rechazado porque origin ha avanzado. Necesitas integrar los cambios remotos antes de poder hacer push, eligiendo entre las estrategias de merge y rebase.

> "The git parable [at learngitbranching.js.org] is one of the most useful things I've ever read for actually understanding git rather than just using it." — sentimiento recurrente en las discusiones de Hacker News sobre recursos para aprender Git

## Cómo se compara con otros enfoques para aprender Git

| Enfoque | Tiempo para empezar | Interactividad | Cubre remotos |
|---------|---------------------|----------------|---------------|
| `man git-rebase` | Inmediato | Ninguna | Sí |
| Libro de Git (git-scm.com) | Minutos | Ninguna | Sí |
| Tutorial interactivo de GitHub | Minutos | Parcial | Parcial |
| Learn Git Branching | Inmediato | Total | Sí |
| Cursos en vídeo | Minutos | Ninguna | Sí |

Las páginas de manual y la documentación oficial son autoritativas, pero asumen que ya entiendes el modelo mental. Los tutoriales en vídeo requieren una escucha pasiva. El [Try Git](https://try.github.io) de GitHub ha sido deprecado varias veces y redirigido a otros sitios. Learn Git Branching se mantiene de forma continua desde 2013 y sigue siendo la recomendación predeterminada cuando los desarrolladores preguntan "¿cómo aprendo de verdad las ramas de Git?".

Una limitación honesta: Learn Git Branching simula un repositorio, no trabaja con archivos reales. No practicarás resolver conflictos de merge reales en código. Para eso necesitas un repositorio real y algo como [Compiler Explorer](/tool/godbolt-org) o un entorno de desarrollo local. Learn Git Branching responde a la pregunta de "¿qué está pasando con la estructura de mi repositorio?"; trabajar a través de la resolución real de conflictos es una habilidad aparte.

## Código abierto y mantenimiento activo

El proyecto vive en [github.com/pcottle/learnGitBranching](https://github.com/pcottle/learnGitBranching) con más de 29.000 estrellas en GitHub y contribuciones que abarcan más de una década. El código base está en JavaScript, y la visualización se ejecuta completamente en el lado del cliente: sin servidor implicado, sin telemetría que recopile tus comandos.

Esto importa para quienes se preocupan por la privacidad: puedes abrir la pestaña de red del navegador y ver cómo no se dispara ninguna petición mientras escribes comandos y avanzas por los niveles. Todo se ejecuta en el motor JavaScript de tu navegador. El sitio carga y luego solo trabajas con estado local.

Las traducciones son contribuciones de la comunidad; el sitio admite más de una docena de idiomas mediante parámetros de URL (por ejemplo, `?locale=zh_CN`). Esto lo hace accesible a estudiantes de todo el mundo sin fragmentación: el mismo código sirve a todos, y el sandbox funciona de forma idéntica independientemente del idioma configurado.

## Quién se beneficia más

**Los desarrolladores junior** se encuentran con Git pronto y a menudo se apañan con un pequeño conjunto de comandos: add, commit, push, pull. Esto funciona hasta que deja de funcionar: hasta que un rebase sale mal, o hasta que necesitan hacer cherry-pick de un fix desde una rama de release, o hasta que les piden limpiar un historial de commits desordenado antes de la revisión de un PR. Learn Git Branching es el camino más rápido de "uso Git" a "entiendo Git".

**Los desarrolladores que cambian de equipo** y de repente necesitan lidiar con una estrategia de ramificación diferente (Gitflow vs. trunk-based vs. GitHub flow) pueden usar las secciones de rebase y merge para interiorizar rápidamente qué hace realmente el flujo de trabajo de su nuevo equipo con el historial de commits.

**Los desarrolladores con experiencia** que han evitado `git rebase -i` por superstición encontrarán que el nivel de rebase interactivo resulta genuinamente esclarecedor. El bucle de retroalimentación visual elimina la ansiedad de "no sé qué va a pasar".

**Los educadores** que enseñan control de versiones en bootcamps o cursos llevan años usando Learn Git Branching como ejercicio en clase. El feedback visual facilita la discusión, y el requisito de no registrarse significa que no se pierde tiempo en la creación de cuentas durante un taller.

## Cómo empezar ahora mismo

Ve a [learngitbranching.js.org](https://learngitbranching.js.org). Haz clic en "Start". Escribe `git commit`. Ese es todo el proceso de incorporación.

Si quieres saltarte a un concepto específico, usa el diálogo de selección de niveles (haz clic en el nombre del nivel en la parte superior de la página). Si ya te manejas con las ramas locales y quieres centrarte en el flujo de trabajo remoto, la parte que tropieza a la mayoría de los equipos, salta directamente a la sección Remote.

Para los equipos que quieran estandarizar el conocimiento de Git sin imponer cursos específicos ni herramientas de pago, Learn Git Branching es una referencia natural: es gratuita, basada en navegador, no requiere cuenta y cubre exactamente los conceptos que causan más confusión en el día a día. Comparte un enlace a un nivel específico para hacer un punto concreto en una discusión de revisión de código.

La herramienta lleva enseñando a los desarrolladores cómo funciona Git desde 2013. En un campo donde la mayoría de las herramientas de aprendizaje van y vienen, ese tipo de longevidad es una señal que merece atención.
