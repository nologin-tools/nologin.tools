---
title: "PNG, JPEG ou WebP? Um tutorial prático de otimização de imagens"
description: "Um guia centrado em formatos para comprimir, converter e redimensionar imagens com ferramentas de navegador sem cadastro — com configurações de qualidade específicas e dimensões por plataforma."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tutorial", "tools", "browser", "guide"]
featured: false
locale: pt
originalSlug: png-jpeg-webp-image-optimization-tutorial
sourceHash: 4deafb9217a610ad
heroImageQuery: "image format comparison compression web optimization"
---

![Hero image](/blog/images/png-jpeg-webp-image-optimization-tutorial/hero.jpg)

A maioria das pessoas escolhe um formato de arquivo por acidente. Exportam do Figma, salvam do Photoshop, ou tiram um screenshot — e qualquer formato que aparecer é o que elas usam. Depois passam pelo compressor esperando que o arquivo fique menor, sem entender por que às vezes não reduz tanto quanto o esperado.

A escolha do formato importa mais do que as configurações de compressão. Um JPEG comprimido com qualidade 85 será menor do que um PNG comprimido com qualidade 85 — não porque o compressor trabalhou mais, mas porque JPEG e PNG codificam dados de imagem de formas fundamentalmente diferentes. Tomar a decisão certa sobre o formato antes de abrir qualquer ferramenta de compressão vai economizar mais bytes do que qualquer slider.

Este tutorial cobre primeiro a decisão do formato, depois ferramentas e configurações específicas para compressão, conversão e redimensionamento. Tudo aqui funciona sem criar uma conta.

## A decisão de formato que você deve tomar antes de qualquer coisa

Três formatos cobrem quase todos os casos de uso web e cotidianos: JPEG, PNG e WebP. Veja o resumo honesto:

**JPEG** é para fotografias e imagens com gradientes de tom contínuos — retratos, paisagens, fotos de comida. Usa compressão com perda que explora especificamente como a visão humana percebe cor versus brilho, o que faz com que uma foto JPEG na qualidade 80 pareça quase idêntica ao original com aproximadamente metade do tamanho do arquivo. JPEG lida bem com transições de cor suaves, mas falha em bordas duras (texto, logos, ícones), onde aparecem os característicos artefatos de bloco.

**PNG** é para screenshots, ilustrações, logos, ícones e qualquer coisa que precise de valores exatos de pixel ou transparência. PNG é sem perda — ele comprime sem descartar nenhum dado. É por isso que um PNG de uma foto é sempre maior do que um JPEG da mesma foto. Nunca use PNG para fotografias. Sempre use PNG para coisas com bordas nítidas, transparência ou texto.

**WebP** é para tudo, em tamanhos menores. [WebP](https://developers.google.com/speed/webp) produz arquivos aproximadamente 25–35% menores do que JPEG para fotos e cerca de 26% menores do que PNG para gráficos, com qualidade visual equivalente. O suporte de navegadores é agora de [97% globalmente](https://caniuse.com/webp) — o Safari adicionou suporte em 2020, o último a fazer isso. Para uso web, raramente há razão para entregar JPEG ou PNG quando você pode servir WebP.

A árvore de decisão prática: se você está salvando para a web, use WebP. Se algo requer especificamente PNG (fundo transparente, precisão de cor exata para impressão), use PNG. Se está enviando para alguém que precisa editar a imagem depois, use JPEG para fotos ou PNG para gráficos. Se vai anexar a um email ou fazer upload para uma plataforma que não suporta WebP, recorra ao JPEG para fotos e PNG para todo o resto.

## Comprimindo com Squoosh: as configurações que realmente importam

Quando você tem uma única imagem que precisa de compressão cuidadosa — uma imagem hero, uma foto de produto, uma peça de portfólio — o [Squoosh](https://squoosh.app) é a ferramenta certa. Ele foi criado pela equipe do Google Chrome, roda inteiramente em WebAssembly, e seus arquivos nunca saem do navegador.

Abra o Squoosh e arraste sua imagem. A interface se divide em uma visualização antes (esquerda) e depois (direita) com um divisor arrastável. No painel direito, escolha o formato de saída e ajuste as configurações.

Para imagens web, comece com **WebP na qualidade 80**. Essa configuração cobre a maioria dos casos de uso — produz saída visualmente quase idêntica com tamanhos de arquivo dramaticamente menores comparado ao JPEG na mesma qualidade. A estimativa de tamanho no canto inferior direito se atualiza conforme você arrasta o slider. Observe o que acontece entre qualidade 75 e 85: você tipicamente verá economia significativa de bytes indo para 75 com mudança visual mínima, e depois degradação mais nítida abaixo de 70. Qualidade 80 é o ponto ideal para a maioria dos conteúdos fotográficos.

Para imagens com texto, linhas nítidas ou transparência, mude o formato de saída para **WebP (sem perda)**. O Squoosh vai avisar que isso é maior do que a compressão com perda, mas preserva os valores exatos de pixels. Compare o resultado com uma compressão com perda e verifique se a diferença é visível no seu tamanho de exibição.

O Squoosh também cuida do redimensionamento no painel "Editar". Insira uma largura alvo em pixels — ou clique no toggle de porcentagem e insira 50% para reduzir as dimensões pela metade — e ative o bloqueio de proporção. O algoritmo de redimensionamento **Lanczos3** é a escolha certa para fotografias; ele preserva a nitidez melhor do que bilinear ou box. Para ícones ou pixel art sendo ampliados, use "Vizinho Mais Próximo" para preservar bordas duras em vez de desfocá-las.

Uma coisa que o Squoosh não faz: processamento em lote. É um arquivo por vez, o que é ótimo para uma imagem específica com que você está trabalhando, mas impraticável para 40 fotos de produto.

## Compressão em lote sem criar conta

Quando a quantidade importa mais do que o controle por imagem, o [TinyPNG](https://tinypng.com) processa até 20 imagens de uma vez sem necessidade de conta. Arraste uma pasta de imagens para a caixa de upload e ele processa tudo em paralelo.

O algoritmo do TinyPNG para arquivos PNG usa quantização seletiva de cores: reduz o número de cores distintas de até 16 milhões para uma paleta menor, depois aplica compressão padrão no resultado. A diferença visual é tipicamente imperceptível. Arquivos PNG geralmente reduzem de 60–80% — às vezes mais para gráficos simples com grandes áreas de cor sólida.

Para arquivos JPEG, o TinyPNG recodifica com quantização mais agressiva e remove metadados (dados EXIF, perfis de cor, comentários incorporados). Uma foto de smartphone de 3 MB frequentemente sai abaixo de 500 KB. O algoritmo toma a decisão de qualidade por você, e é bem calibrado.

Não há limite diário no nível gratuito de 20 arquivos — cada lote de 20 é independente. Termine um lote, arraste outro. Para um lote de 200 fotos, são 10 arrasta-e-solta. Tedioso, mas funciona sem criar conta ou pagar por acesso à API.

Uma limitação honesta: o TinyPNG faz upload dos arquivos para seus servidores. As imagens são deletadas após um curto período, mas se você estiver comprimindo imagens sensíveis (documentos legais, fotos médicas, material privado), fique com o processamento local do Squoosh. Para fotos de produto ou imagens de blog, o processamento no servidor é uma troca razoável.

## Redimensionando para plataformas específicas

"Redimensionar para as dimensões certas" parece simples até você estar olhando para oito tamanhos recomendados para oito plataformas diferentes. Aqui estão as dimensões padrão atuais para casos comuns:

| Plataforma / Caso de uso | Dimensões recomendadas | Formato |
|--------------------------|------------------------|---------|
| Imagem hero web | 1920×1080 ou 1440×900 | WebP |
| Imagem de post de blog | 1200×675 (16:9) | WebP ou JPEG |
| Open Graph / pré-visualização de link | 1200×630 | JPEG (ampla compatibilidade) |
| Imagem de post Twitter/X | 1600×900 | JPEG ou WebP |
| Instagram quadrado | 1080×1080 | JPEG |
| Instagram Story / Reels | 1080×1920 | JPEG |
| Banner do LinkedIn | 1584×396 | JPEG |
| Imagem de newsletter | máx. 600px de largura | JPEG |
| Favicon | 32×32, 180×180 (Apple) | PNG |

Para redimensionamento, as mesmas ferramentas que comprimem também redimensionam. O Squoosh (com o painel Editar aberto) e o [ezGIF](https://ezgif.com) permitem especificar dimensões exatas em pixels. Para mais controle — recortar em uma proporção exata, reposicionar conteúdo dentro de um quadro — o [Photopea](https://www.photopea.com) é a opção mais capaz sem login. Ele carrega um editor completo parecido com o Photoshop no navegador, permitindo que você use os controles de tamanho de tela, recorte e tamanho de imagem exatamente como faria no Photoshop, sem nenhuma conta.

## Convertendo HEIC e outros formatos problemáticos

iPhones fotografam em HEIC por padrão (às vezes escrito como HEIF). É um excelente formato — menor do que JPEG com melhor qualidade — mas ainda não é amplamente aceito. O WordPress rejeita. A maioria dos navegadores não exibe. Clientes de email renderizam de forma inconsistente.

Para conversão de HEIC para JPEG, o [ezGIF](https://ezgif.com) lida com isso sem cadastro. Vá para a aba "Image Converter", faça upload de um arquivo HEIC, escolha JPEG como saída e baixe o resultado. A conversão funciona, embora o ezGIF não seja o mais rápido para grandes lotes.

O [Convertio](https://convertio.co) lida com formatos RAW de câmera (CR2, NEF, ARW), texturas de jogos (DDS) e formatos HDR como EXR — coisas que a maioria das ferramentas de imagem pula silenciosamente. Conversões gratuitas sem conta são limitadas a cerca de 10 por dia e 100 MB por arquivo, o que cobre uso ocasional. Os arquivos são enviados para os servidores do Convertio, então verifique a [política de privacidade](https://convertio.co/privacy) para material sensível.

Para arquivos SVG especificamente: ferramentas de design como o Figma exportam SVGs cheios de metadados do editor, estilos inline e precisão numérica de até 8 casas decimais. Os arquivos são tecnicamente válidos, mas desnecessariamente grandes. Passe-os pelo [SVGOMG](/tool/jakearchibald-github-io-svgomg) — um otimizador de SVG baseado em navegador — antes de publicar. A economia típica em uma exportação do Figma fica entre 40–70%, processado inteiramente no lado do cliente.

## Um fluxo de trabalho realista para os casos mais comuns

Para a maioria das pessoas na maioria das situações, o fluxo de trabalho certo é:

**Foto do celular → site**: Abra no Squoosh, defina a saída para WebP, qualidade 80, redimensione para 1200px de largura. Pronto. O arquivo ficará abaixo de 200 KB para quase qualquer foto.

**Fotos de produto (em lote)**: Arraste até 20 de uma vez para o TinyPNG. Baixe, repita. Sem conversão de formato, só redução de tamanho.

**Screenshot → post de blog**: Squoosh ou TinyPNG. Screenshots de UIs escuras comprimem especialmente bem com WebP sem perda.

**HEIC do iPhone → JPEG compartilhável**: Conversor de imagens do ezGIF, entrada HEIC, saída JPEG.

**Logo ou ícone para site**: Se você tem o SVG, otimize com o SVGOMG. Se precisar de PNG, exporte da sua ferramenta de design e passe pelo TinyPNG.

**Convertendo qualquer coisa incomum**: Convertio para formatos que as outras ferramentas não conseguem lidar.

> A única melhor coisa que a maioria das pessoas pode fazer com seus arquivos de imagem é mudar de JPEG para WebP na saída web. A segunda melhor coisa é redimensionar para as dimensões reais de exibição antes de comprimir — não faz sentido entregar uma imagem de 3000px de largura que será exibida em 800px. Ambos os passos são gratuitos, imediatos e não requerem conta.

As ferramentas descritas aqui estão verificadas no [diretório nologin.tools](/tool/squoosh-app). O [HTTP Archive Web Almanac](https://almanac.httparchive.org/en/2024/media) mostra consistentemente que imagens são a maior categoria de ativos na web e que a adoção de WebP/AVIF permanece bem abaixo do que os navegadores poderiam suportar. A lacuna entre o que é tecnicamente possível e o que a maioria dos sites entrega ainda é grande — e ela se fecha um arquivo por vez.

Se você quiser uma visão mais ampla do que essas ferramentas cobrem além do básico descrito aqui, o post anterior sobre [ferramentas de compressão e conversão de imagens](/blog/compress-convert-resize-images-no-login) cobre as escolhas de formato e os trade-offs das ferramentas com mais profundidade.
