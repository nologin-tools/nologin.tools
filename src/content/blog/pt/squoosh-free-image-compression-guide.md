---
title: "Comprimir imagens de graça com Squoosh — Sem conta, sem upload"
description: "Guia passo a passo para comprimir imagens com Squoosh no navegador. Sem login, sem upload para servidor — cobre configurações AVIF, WebP, JPEG, PNG e uso do CLI em lote."
publishedAt: 2026-04-16
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "open-source"]
featured: false
locale: pt
originalSlug: squoosh-free-image-compression-guide
sourceHash: f54e1dbf39ce8747
heroImageQuery: "image compression browser WebAssembly optimize"
---

![Hero image](/blog/images/squoosh-free-image-compression-guide/hero.jpg)

Você precisa comprimir uma imagem. De preferência agora, sem criar uma conta, sem subir seus arquivos para um servidor que você não controla e sem jogar na roleta da qualidade com uma ferramenta que só diz "comprimido!" e não te conta mais nada. As opções mais conhecidas ou limitam você a 5 MB no plano grátis, adicionam marca d'água no resultado ou não mostram absolutamente nada do que fizeram com o seu arquivo.

O [Squoosh](https://squoosh.app) resolve tudo isso. Abra em uma aba do navegador, arraste sua imagem, ajuste as configurações, baixe o resultado. Sem login. Sem upload para servidor remoto. A compressão acontece dentro do próprio navegador, usando módulos WebAssembly compilados a partir dos mesmos codecs que sistemas em produção utilizam — MozJPEG, libavif, OxiPNG, libwebp.

Este guia mostra como usar o Squoosh de forma eficiente: qual formato escolher para cada situação, quais configurações realmente fazem diferença e como processar vários arquivos de uma vez sem precisar instalar nada.

## O que o Squoosh Faz (e Por que Isso é Incomum)

A maioria dos compressores online faz upload do seu arquivo para um servidor backend, executa a compressão lá e devolve um arquivo menor. Isso significa que suas imagens — fotos de clientes, mockups confidenciais, fotos de produto antes do lançamento — ficam em algum servidor de terceiros por um tempo. Você está confiando na política de retenção deles. Na segurança deles.

O Squoosh compila os codecs de compressão para WebAssembly e os executa localmente na sua aba. Nada sai da sua máquina. Isso não é um argumento de marketing — é uma consequência da arquitetura. Não existe servidor para onde fazer upload.

A ferramenta é desenvolvida e mantida pelo [Google Chrome Labs](https://github.com/GoogleChromeLabs/squoosh), open source com licença Apache 2.0. Se você quiser uma análise completa de como ela se compara a alternativas como TinyPNG e Convertio, a [review do Squoosh neste site](/blog/squoosh-beats-online-image-compressors) cobre essa comparação. Este guia é prático: configurações, fluxos de trabalho, decisões.

## Qual Formato Usar?

A primeira decisão é o formato de saída. Isso importa mais do que qualquer controle de qualidade, porque formatos diferentes têm pontos fortes fundamentalmente diferentes.

| Formato | Melhor Para | Suporte nos Navegadores | Tamanho vs. JPEG |
|---------|-------------|-------------------------|------------------|
| MozJPEG | Fotos, alta complexidade de cor | Universal | Base |
| OxiPNG | Gráficos com transparência, screenshots | Universal | Maior |
| WebP | Imagens gerais para web | Todos os modernos | ~25% menor |
| AVIF | Imagens web, melhor compressão | Chrome, Firefox, Safari, Edge | ~50% menor |
| JPEG XL | Preparação para o futuro | Limitado (experimental) | ~60% menor |

Para a maioria das imagens web em 2026, o **AVIF é o padrão certo**. Ele gera arquivos 30-50% menores que o WebP com qualidade visual equivalente, e o suporte nos navegadores já cobre todos os principais. Se você precisa suportar navegadores muito antigos ou gerar imagens para uma ferramenta que não lida com formatos modernos, o WebP é a opção segura. O JPEG continua relevante quando a compatibilidade universal é exigida — qualquer plataforma, qualquer visualizador.

PNG é sem perdas. Você vai querer o OxiPNG quando transparência é necessária: ícones, logos com fundo transparente, screenshots de interface onde a renderização perfeita do texto importa. Nunca use PNG para fotos. Os arquivos ficam enormes.

JPEG XL é tecnicamente impressionante, mas o suporte nos navegadores ainda é inconsistente o suficiente para pular na maioria dos projetos em produção.

## Configurações que Realmente Fazem Diferença

Depois de escolher o formato, o controle de qualidade é o principal parâmetro. Mas "qualidade" significa coisas diferentes em cada codec, e os números não são diretamente comparáveis.

**Fotografias para web e imagens de destaque**: comece com AVIF na qualidade 60-70. Pode parecer agressivo, mas o AVIF lida com configurações de qualidade baixa muito melhor do que o JPEG. Na qualidade 60, um JPEG normalmente já mostra artefatos de blocagem visíveis; o AVIF na mesma configuração nominal parece significativamente mais limpo. Use o controle deslizante de comparação (mais sobre isso adiante) para confirmar.

**Fotografia de produtos para e-commerce**: WebP na qualidade 75-80, ou MozJPEG em 75 se precisar de compatibilidade máxima de formato. Fotos de produto precisam de detalhes finos nas bordas e texturas — abaixo da qualidade 70, você vai notar amolecimento em tecidos, textos em relevo e formas intricadas.

**Screenshots e capturas de interface**: OxiPNG com nível de compressão em 3. Níveis maiores reduzem o tamanho do arquivo, mas demoram significativamente mais. O nível 3 é o ponto ideal para a maioria dos screenshots. Se a imagem tem grandes áreas de cor sólida (comum em capturas de interface), o OxiPNG frequentemente bate o AVIF porque a compressão sem perdas lida bem com regiões uniformes.

**Miniaturas e avatares**: WebP na qualidade 80, redimensionado para a dimensão de exibição real. O Squoosh tem um painel de redimensionamento — use-o. Servir um original de 3.024 pixels em uma exibição de 120px é um dos erros de performance de imagem mais comuns, e nenhuma quantidade de compressão resolve o problema na raiz.

**Imagens de fundo e texturas**: toleram compressão agressiva porque são vistas com baixo foco visual. AVIF na qualidade 50-60 geralmente está ótimo; é improvável que você note diferença de qualidade quando uma imagem está atrás de um texto.

Regra geral: comece na qualidade 75 para AVIF/WebP, ou 80 para JPEG. Depois use o controle deslizante de comparação para ver até onde você pode ir.

## Usando o Controle Deslizante de Comparação

O controle deslizante de comparação é o que separa o Squoosh das ferramentas que entregam um resultado sem explicação nenhuma. Você tem o original à esquerda, a saída comprimida à direita, com os números de tamanho de arquivo em tempo real na parte inferior. Arraste o divisor para revelar cada lado.

A técnica: centralize o controle e foque nas partes da imagem que comprimem pior — bordas nítidas, texto fino, gradientes suaves de cor e rostos humanos. Esses são os primeiros lugares onde os artefatos aparecem. Se você não consegue ver diferença significativa nessas áreas, a configuração de qualidade atual está adequada. Se você notar amolecimento, blocagem ou faixas de cor, aumente a qualidade.

Com o AVIF especificamente, observe as transições de cor, não apenas as bordas. O AVIF pode introduzir faixas de cor sutis em gradientes suaves em configurações de qualidade baixa — é mais visível em fotos de céu ou fundos com mudanças suaves de cor, menos em fotos detalhadas de produtos.

Para o OxiPNG, o controle deslizante confirma principalmente que a compressão sem perdas funcionou corretamente. A saída deve ser idêntica ao original — se não for, algo inesperado aconteceu (raro, mas vale uma verificação rápida).

Quando a qualidade estiver boa, confira a redução do tamanho do arquivo na interface do Squoosh. Um resultado razoável para imagens web é 60-80% menor que o original. Se você está conseguindo menos de 40% de redução em uma foto JPEG convertida para AVIF, tente diminuir mais a qualidade — com certeza você está deixando economia na mesa.

## Redimensionamento: A Etapa que as Pessoas Pulam

As configurações de qualidade não são o único recurso. Redimensionar para as dimensões reais de exibição frequentemente entrega uma economia de tamanho de arquivo maior do que qualquer ajuste de qualidade.

O painel de redimensionamento do Squoosh permite definir uma largura ou altura alvo. Algumas observações sobre as opções de algoritmo: o **Lanczos3** produz o resultado mais nítido com mínimo de aliasing, e é a escolha certa para a maioria das fotos. O **Triangle** é mais rápido, mas mais suave. O **Mitchell** fica entre os dois.

Antes de mexer no controle de qualidade, pergunte se você precisa da resolução original. Se seu site exibe imagens de posts de blog com 800px de largura, servir um original de 3.024 pixels é dado desperdiçado mesmo na compressão máxima. Redimensione primeiro, depois comprima. A economia combinada é quase sempre maior do que qualquer abordagem isolada.

O Squoosh aplica o redimensionamento antes da compressão, que é a ordem correta. Você define as dimensões finais no painel de redimensionamento, ajusta a qualidade no painel de compressão, e o arquivo baixado reflete as duas alterações.

## Indo Além de Um Arquivo por Vez

A interface web do Squoosh processa uma imagem de cada vez. Para comprimir uma pasta de arquivos em uma única passada, o Squoosh CLI é a resposta — e não requer instalação permanente.

Com o Node.js instalado, execute:

```bash
npx @squoosh/cli --avif '{"quality":65}' *.jpg
```

Esse comando comprime todos os JPEGs no diretório atual para AVIF na qualidade 65, gravando os arquivos de saída junto com os originais com a extensão `.avif`. Para WebP: `--webp '{"quality":80}'`. Para MozJPEG: `--mozjpeg '{"quality":75}'`. Para redimensionar enquanto comprime: `--resize '{"width":1200}'`.

O CLI usa os mesmos módulos WebAssembly da interface web, então a saída é idêntica. Isso é especialmente útil para fluxos de trabalho onde você tem uma pasta de fotos brutas que precisam estar prontas para web antes de subir para um CMS ou pipeline de publicação. Sem instalação permanente, sem assinatura, sem servidor.

## Quando o Squoosh Não é a Ferramenta Certa

O Squoosh processa imagens raster. Para arquivos SVG, o [SVGOMG](/tool/jakearchibald-github-io-svgomg) é o equivalente — executado localmente no seu navegador, sem limites de tamanho de arquivo, sem conta necessária. Não passe SVGs pelo Squoosh.

Para arquivos muito grandes — panoramas de 100+ megapixels, arquivos TIFF de câmeras de médio formato — o Squoosh pode esgotar a memória do navegador. Ferramentas desktop lidam melhor com esses casos.

Se você precisa de compressão rápida de JPEG ou PNG sem controle de qualidade e não está preocupado com a privacidade dos arquivos, o [TinyPNG](/tool/tinypng-com) é mais rápido para essa tarefa específica. Ele automatiza a decisão e pula o controle deslizante. Útil quando você não se importa com a troca e só quer algo menor.

Para conversão de formatos além de imagens (documentos, vídeo, áudio), o Squoosh não vai ajudar — ele é feito especificamente para compressão de imagens.

## Algumas Práticas que Vale Adotar

Renomeie os arquivos antes de baixar. O Squoosh gera nomes como `image-compressed.avif`. Se você processar vários arquivos em uma sessão sem renomear, vai acabar com uma pasta cheia de `image-compressed (1).avif`, `image-compressed (2).avif` e assim por diante.

Guarde o original. A compressão AVIF e WebP é com perda. Se você precisar de um nível de qualidade diferente ou de outro formato de saída mais adiante, vai querer partir do original — comprimir um arquivo já comprimido acumula degradação de qualidade.

Não aplique o mesmo número de qualidade para toda imagem. Uma foto aproximada e detalhada comprime de forma diferente de uma paisagem ampla com a mesma configuração nominal. Um valor de qualidade que é degradação invisível em uma imagem pode ser claramente visível em outra. O controle deslizante te dá a resposta; confie nele mais do que em números fixos.

---

A otimização de imagens é uma daquelas tarefas que vale a pena fazer direito, e a ferramenta certa é gratuita, funciona sem conta e roda inteiramente no seu navegador. Para mais ferramentas nessa categoria — sem login, sem upload, sem rastreamento — o [nologin.tools](/tool/nologin-tools) tem centenas organizadas por caso de uso.
