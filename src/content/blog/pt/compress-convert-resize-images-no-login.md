---
title: "Comprima, converta e redimensione imagens sem se cadastrar"
description: "As melhores ferramentas de imagens baseadas no navegador para compressão, conversão de formato e redimensionamento — sem conta, sem software, sem limites de upload que exijam cadastro."
publishedAt: 2026-03-12
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "guide"]
featured: false
locale: pt
originalSlug: compress-convert-resize-images-no-login
sourceHash: 9b4e1d2a7f8c3e6b
---

![Hero image](/blog/images/compress-convert-resize-images-no-login/hero.jpg)

As imagens são responsáveis por cerca de metade do peso de uma página web comum. Não o JavaScript, não o CSS — as imagens. E ainda assim, as ferramentas para as quais a maioria das pessoas recorre quando precisa comprimir uma foto, converter um PNG para WebP ou redimensionar algo para uma plataforma específica exigem uma conta antes de deixar você tocar em um controle deslizante.

É um custo alto demais para uma tarefa de cinco segundos.

Existe toda uma categoria de ferramentas de imagens que funcionam completamente no navegador, processam arquivos no lado do cliente sem enviá-los para um servidor e não exigem nada além de abrir uma aba. Algumas são do Google. Outras são projetos de um único desenvolvedor com milhões de usuários mensais. Todas são gratuitas e funcionam sem cadastro.

## Por que a escolha do formato importa mais do que você pensa

A maioria das pessoas comprime imagens sem pensar no formato. Elas têm um JPEG, o deixam menor, pronto. Mas a seleção do formato frequentemente importa mais do que a própria configuração de compressão.

[WebP](https://developers.google.com/speed/webp) — um formato desenvolvido pelo Google — produz arquivos aproximadamente 25-34% menores que JPEG com qualidade visual equivalente. AVIF, o formato mais recente apoiado pela Netflix e pela Alliance for Open Media, pode reduzir o tamanho do arquivo em até 50% em comparação com JPEG. Ambos os formatos agora têm suporte em todos os principais navegadores. Se você está otimizando imagens para um site, simplesmente mudar de JPEG para WebP pode reduzir seu payload em um terço antes mesmo de ajustar um controle de qualidade.

É por isso que uma ferramenta que lida com conversão de formato além da compressão é mais útil do que uma que apenas comprime seu JPEG existente. Para a maioria do trabalho web, a resposta é: converter para WebP, comprimir para cerca de 80% de qualidade, e pronto. Duas ferramentas sem login tornam isso trivialmente fácil.

## Squoosh: a primeira que você deve experimentar

Quando você precisa comprimir uma imagem com controle real sobre o resultado, o [Squoosh](https://squoosh.app) é a opção mais poderosa neste espaço. É uma ferramenta de código aberto criada pelo Google que funciona completamente em WebAssembly — seu arquivo nunca sai do navegador.

O fluxo de trabalho é uma visualização comparativa lado a lado: original à esquerda, prévia comprimida à direita. Escolha um formato de saída (MozJPEG, WebP, AVIF, JPEG XL, PNG, OxiPNG e mais), arraste um controle de qualidade e veja a estimativa de tamanho ser atualizada em tempo real. A exibição de diferença mostra exatamente quantos kilobytes você está economizando como porcentagem do original.

O que torna o Squoosh melhor que a maioria das alternativas é que ele não simplifica demais. Você pode ajustar a subamostragem de croma, escolher a velocidade de codificação e refinar as configurações avançadas do codec se souber o que isso significa. Ou ignorar tudo isso e simplesmente mover o controle de qualidade. De qualquer forma, você obtém uma prévia ao vivo antes de confirmar — o que é incomum em ferramentas sem login.

Ele também gerencia o redimensionamento: largura e altura com bloqueio opcional de proporção, e múltiplos algoritmos de escalonamento (Lanczos para nitidez, Mitchell para fotos que têm um leve ringing nas bordas). Veja o [perfil do Squoosh no nologin.tools](/tool/squoosh-app) para a lista completa de recursos. A única limitação: ele processa uma imagem por vez, o que é incômodo se você tem uma pasta com 50 fotos.

## TinyPNG: rápido e completamente automático

O [TinyPNG](https://tinypng.com) resolve o problema do lote. Arraste até 20 imagens de uma vez (até 5 MB cada, sem conta) e ele as comprime usando otimização com perda que reduz seletivamente a paleta de cores de formas que a maioria das pessoas não consegue ver. Arquivos PNG tipicamente encolhem 60-80%. JPEG e WebP também são suportados.

A experiência é uma zona de arrastar e soltar, uma barra de progresso e um link de download. Nada para configurar. É uma decisão de design — o algoritmo toma as decisões por você, e é bom o suficiente para que você provavelmente não questione.

Ao contrário de ferramentas que exigem cadastro para processamento em lote, o limite de 20 arquivos do TinyPNG se aplica por lote, não por dia. Arraste outras 20 imagens quando o primeiro lote terminar. Para fotógrafos preparando uma galeria antes do upload, ou desenvolvedores limpando assets de imagens antes de um deploy, esse fluxo de trabalho funciona sem precisar de nenhuma conta.

A mesma qualidade de compressão que a versão do navegador usa está disponível como API para desenvolvedores e plugin do WordPress — mas a versão web é a opção gratuita sem login. O [perfil do TinyPNG no nologin.tools](/tool/tinypng-com) cobre o que está incluído no nível gratuito versus o plano pago.

## ezGIF: muito mais do que o nome sugere

O nome subestima muito. O [ezGIF](https://ezgif.com) é uma das ferramentas de imagem mais completas disponíveis sem conta, e lida com muito mais do que GIFs animados.

Para trabalho com GIFs: criar a partir de um arquivo de vídeo ou sequência de imagens, otimizar o timing de quadros, reduzir cores, recortar, redimensionar, inverter, adicionar texto. O otimizador de GIFs é especialmente útil — GIFs animados são notoriamente grandes, e a otimização do ezGIF tipicamente os reduz em 30-40% sem perda de qualidade visível.

Mas a lista de ferramentas vai bem além dos GIFs. Há um otimizador JPG/PNG/WebP, um redimensionador que lida com dimensões baseadas em porcentagem ou específicas em pixels, um conversor de formato (suporta AVIF, HEIC, BMP, TIFF e outros que muitas alternativas "modernas" discretamente ignoram), um conversor de imagem para PDF e um cortador de sprite sheet para trabalho com CSS sprites.

A interface é funcional — abas no topo, uma área de upload, resultados abaixo. Não foi redesenhada desde por volta de 2014 e isso aparece. Mas cada recurso funciona, e o suporte a tipos de arquivo é excepcionalmente amplo: HEIC de iPhones, TIFF de scanners, AVIF de câmeras mais recentes. Se um formato existe, o ezGIF provavelmente o suporta. Perfil completo em [ezGIF no nologin.tools](/tool/ezgif-com).

## Convertio e SVGOMG: para casos especiais

Algumas conversões de formato são obscuras o suficiente para que a maioria das ferramentas não as suporte. O [Convertio](https://convertio.co) cobre mais de 300 formatos de arquivo entre imagens, documentos, áudio e vídeo. Para trabalho de imagem especificamente: ele lida com formatos RAW de câmera (CR2, NEF, ARW), DDS (texturas de jogos), TGA, EXR (formato HDR de pipelines de VFX) e outros que ferramentas especializadas omitem.

Conversões gratuitas sem cadastro são limitadas a um limite diário razoável e 100 MB por arquivo. Os arquivos são enviados para os servidores do Convertio (ao contrário do processamento do lado do cliente do Squoosh), portanto, para imagens sensíveis, consulte a [política de privacidade](https://convertio.co/privacy) deles antes de prosseguir. Para converter um mockup de produto de RAW para JPG ou um ícone de SVG para ICO, está ótimo. Para qualquer coisa confidencial, o processamento local do Squoosh é a escolha mais segura. Veja o [Convertio no nologin.tools](/tool/convertio-co).

Arquivos SVG são um problema completamente diferente. Ferramentas de design como Figma e Adobe Illustrator exportam SVGs carregados com metadados do editor, elementos de grupo redundantes, números com 8 casas decimais de precisão e estilos inline que poderiam ser atributos. O [SVGOMG](https://jakearchibald.github.io/svgomg/) é o frontend baseado em navegador para o SVGO — arraste um SVG e ele remove o ruído enquanto exibe uma prévia ao vivo. As economias típicas em exportações do Figma são de 40-70%. O painel de alternância permite desativar otimizações individuais se alguma quebrar um truque SVG específico. Sem upload, sem conta, tudo local. Perfil em [SVGOMG no nologin.tools](/tool/jakearchibald-github-io-svgomg).

## Qual ferramenta para qual tarefa?

Aqui está o mapa honesto, porque essas ferramentas não competem entre si — elas cobrem necessidades diferentes:

| Tarefa | Melhor ferramenta | Arquivos saem do navegador? |
|--------|------------------|----------------------------|
| Comprimir uma imagem com controle de formato | Squoosh | Não |
| Comprimir em lote PNG/JPEG/WebP | TinyPNG | Sim (lado do servidor) |
| Criar ou otimizar GIFs | ezGIF | Sim (lado do servidor) |
| Redimensionar com opções de algoritmo | Squoosh ou ezGIF | Não / Sim |
| Conversão de formato incomum (RAW, DDS, EXR) | Convertio | Sim (lado do servidor) |
| Otimizar SVG de uma ferramenta de design | SVGOMG | Não |

A coluna "Arquivos saem do navegador?" importa para a privacidade. Squoosh e SVGOMG nunca enviam seu arquivo para lugar nenhum — tudo acontece em WebAssembly ou JavaScript na sua aba. TinyPNG, ezGIF e Convertio fazem upload para seus servidores, processam e retornam resultados. Os três têm períodos de retenção curtos declarados (tipicamente 24 horas ou menos), mas você está confiando na política deles.

Para a maioria das tarefas do dia a dia — comprimir uma foto de produto, redimensionar uma imagem de cabeçalho, converter um JPEG para WebP — o processamento no servidor é uma troca razoável pela conveniência e suporte de formatos que essas ferramentas fornecem. Para imagens médicas, documentos legais ou qualquer coisa pessoal que você preferiria não ter no servidor de alguém: Squoosh.

> As ferramentas que sobrevivem sem te prender tendem a ser as que são genuinamente boas. O Squoosh é construído e mantido pela equipe do Google Chrome não como um produto com um plano de monetização, mas como uma implementação de referência para codecs de imagem modernos. Esse alinhamento de incentivos — "tornar a compressão de imagens boa para a web" — produz uma ferramenta melhor do que "fazer os usuários criarem contas".

De acordo com o [Web Almanac do HTTP Archive](https://almanac.httparchive.org), a adoção do WebP na web cresceu significativamente, mas JPEG e PNG ainda dominam. A lacuna entre o que os navegadores modernos suportam e o que a maioria dos sites realmente serve representa desempenho real sendo deixado na mesa. Nenhuma das ferramentas para fechar essa lacuna exige que você forneça seu e-mail primeiro.

O diretório mais amplo do [nologin.tools](/tool/nologin-tools) cataloga ferramentas verificadas e amigáveis à privacidade em dezenas de categorias. A seção de ferramentas de imagens é um dos cantos mais completos — não faltam serviços que descobriram que "sem cadastro" é um recurso, não um compromisso, e a coleção continua crescendo.
