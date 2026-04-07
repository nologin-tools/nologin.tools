---
title: "Excalidraw: quadro branco online gratuito, sem precisar de cadastro"
description: "Excalidraw é uma ferramenta de quadro branco livre e open source que funciona no navegador sem precisar de conta. Desenhe diagramas com visual de esboço e colabore com criptografia de ponta a ponta."
publishedAt: 2026-04-07
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source", "browser"]
featured: false
heroImageQuery: "whiteboard sketching digital drawing hand-drawn"
locale: "pt"
originalSlug: "excalidraw-free-whiteboard-no-login"
sourceHash: "ba7bcfac58d58f30"
---

![Hero image](/blog/images/excalidraw-free-whiteboard-no-login/hero.jpg)

A maioria das ferramentas de quadro branco pede que você crie uma conta antes de traçar a primeira linha. O Miro quer seu e-mail. O FigJam exige sua conta no Figma. O Lucidchart levanta uma barreira de pagamento depois de cinco formas. E se você pagar, eles podem ver tudo que você desenha.

O [Excalidraw](https://excalidraw.com) abre diretamente com uma tela em branco, pronta para usar. Sem cadastro. Sem login. Sem pop-up pedindo seu e-mail. Só um quadro branco.

Essa é a proposta, e depois de milhões de usuários e anos de desenvolvimento ativo, ela ainda se sustenta.

## O que o Excalidraw realmente faz

O Excalidraw é uma ferramenta de desenho baseada em navegador que renderiza tudo em estilo de traço à mão. Os retângulos têm bordas levemente tortas. As linhas têm aquela imprecisão natural que faz os diagramas parecerem feitos num guardanapo, não num deck de slides corporativo.

Essa estética é uma escolha deliberada, não uma limitação técnica. Quando você está esboçando um diagrama de arquitetura ou explicando um conceito para a equipe, o visual descuidado sinaliza "isso é rascunho, pode comentar à vontade" muito melhor do que um slide Keynote impecável. Equipes de engenharia usam para entrevistas de design de sistemas. Designers usam para wireframes antes de abrir o Figma. Professores usam para explicar conceitos sem a formalidade de uma apresentação atrapalhar.

A ferramenta tem os elementos de sempre — retângulos, círculos, setas, linhas, texto, desenho livre — mais imagens que você pode incorporar diretamente na tela. Você pode agrupar objetos, caminhá-los, bloqueá-los e alinhá-los com uma grade. Tem seletor de cor, ajuste de espessura de traço e opções de preenchimento. Nada está escondido atrás de um plano premium.

A exportação funciona sem conta. Você pode salvar como PNG (fundo transparente opcional), SVG ou copiar para a área de transferência. O formato de arquivo `.excalidraw` é JSON simples, o que significa que seus desenhos são legíveis e recuperáveis mesmo sem o app — útil caso o projeto algum dia saia do ar.

## A arquitetura de privacidade

É aqui que o Excalidraw merece atenção especial como ferramenta respeitosa com a privacidade: o modelo de colaboração usa criptografia de ponta a ponta por padrão.

Quando você compartilha um desenho via link de "colaboração ao vivo", tanto o ID da sala quanto a chave de criptografia ficam embutidos no fragmento da URL (a parte do `#`). O fragmento nunca é enviado ao servidor — ele fica no navegador. Os servidores do Excalidraw retransmitem os dados do desenho entre os participantes, mas recebem apenas bytes criptografados. Eles não conseguem ler o que você desenhou.

Essa é uma garantia de privacidade com conteúdo real. Com ferramentas como Miro ou Notion, a plataforma tem acesso completo ao conteúdo do seu quadro branco. No modo de colaboração do Excalidraw, isso não acontece. O [código-fonte está no GitHub](https://github.com/excalidraw/excalidraw) sob licença MIT, então qualquer um pode verificar essa afirmação lendo o código — sem precisar confiar.

Para uso individual, nada sai do seu navegador. Os desenhos são salvos no `localStorage` e ficam no seu dispositivo a menos que você os exporte explicitamente.

> "Your data is end-to-end encrypted, meaning the Excalidraw server cannot read what you've drawn." — Excalidraw documentation

É o mesmo princípio de design visto em outras ferramentas que respeitam a privacidade: o servidor cuida do transporte, não do conteúdo. O usuário fica com as chaves.

## Excalidraw vs. tldraw vs. Diagrams.net

Na categoria de quadros brancos gratuitos sem login, há alguns concorrentes sólidos. Veja como eles se comparam:

| | Excalidraw | tldraw | Diagrams.net |
|---|---|---|---|
| Login necessário | Não | Não | Não |
| Colaboração | Criptografia E2E | Sim | Não (só exportação) |
| Estilo | Feito à mão | Limpo/vetorial | Técnico/UML |
| Auto-hospedável | Sim | Sim | Sim |
| Formatos de exportação | PNG, SVG, JSON | PNG, SVG, JSON | PNG, SVG, PDF, XML |
| Open source | MIT | MIT | Apache 2.0 |

O [tldraw](/tool/tldraw-com) é o concorrente mais próximo. Também gratuito, sem login e open source. A principal diferença é estética — o tldraw usa formas vetoriais limpas enquanto o Excalidraw se compromete de verdade com o visual de esboço. Se a precisão importa — como num diagrama que vai para um documento técnico formal — o visual mais limpo do tldraw é mais fácil de trabalhar.

O [Diagrams.net](/tool/app-diagrams-net) tem como alvo um caso de uso completamente diferente. Tem formas UML de verdade, templates de fluxograma, ícones de topologia de rede e um formato XML que se integra com Confluence e outras ferramentas empresariais. É mais poderoso para diagramas estruturados, mas menos adequado para esboços livres.

O Miro é a opção enterprise — polido, realmente cheio de recursos, e a partir de $16 por usuário por mês depois do plano gratuito. Exige conta, rastreia o uso e tem acesso total a tudo que você desenha. Para uma equipe pequena que faz diagramas de vez em quando, é caro demais para o que o Excalidraw oferece de graça.

## Colaboração sem entregar os dados

O produto típico de colaboração em tempo real funciona assim: você cria uma conta, o conteúdo fica nos servidores deles e eles podem lê-lo. Esse é um trade-off conhecido, e para muitos produtos está tudo bem.

O modelo do Excalidraw é diferente. Duas pessoas podem editar a mesma tela em tempo real — os cursores aparecem com nomes, as mudanças se propagam na hora — e o servidor intermediário é funcionalmente cego ao conteúdo. A chave de criptografia nunca toca o servidor, então nem uma ordem judicial produziria dados de desenho legíveis.

Para iniciar uma sessão de colaboração, clique no ícone de pessoa na barra de ferramentas e compartilhe o link. Qualquer pessoa com o link pode entrar sem criar conta. As sessões existem apenas enquanto alguém está conectado. No plano gratuito não há sala na nuvem persistente.

Isso significa que não há histórico de versões, nem sincronização na nuvem entre dispositivos, nem como voltar a uma sessão dias depois sem ter exportado o arquivo. Para sessões de esboço pontuais, é um trade-off aceitável. Para quadros brancos de equipe contínuos, você vai querer exportar os arquivos `.excalidraw` para uma pasta compartilhada regularmente, ou dar uma olhada no [Excalidraw+](https://plus.excalidraw.com) — a versão paga hospedada que adiciona armazenamento na nuvem persistente, salas com senha e backups de cenas.

A versão gratuita resolve o que a maioria das pessoas realmente precisa: trabalhar um conceito com um colega no quadro, exportar e seguir em frente.

## Atalhos de teclado e a experiência do usuário avançado

O Excalidraw recompensa quem aprende os atalhos de teclado. Com eles na ponta dos dedos, desenhar fica muito rápido.

Os atalhos de formas são de tecla única: `R` para retângulo, `E` para elipse, `A` para seta, `L` para linha, `X` para desenho livre, `T` para texto. `V` volta para a ferramenta de seleção. `H` e `V` espelham horizontalmente e verticalmente. `Ctrl+A` seleciona tudo, `Ctrl+G` agrupa os objetos selecionados.

Para compartilhar: `Ctrl+Shift+E` abre o diálogo de exportação, de onde você pode copiar para a área de transferência ou baixar. `Ctrl+L` copia um link compartilhável direto para a área de transferência.

Zoom: `Ctrl+scroll` aumenta e diminui o zoom, `Ctrl+Shift+H` ajusta o desenho inteiro na tela. A ferramenta de mão (`Espaço+arrastar`) move a tela sem trocar a ferramenta selecionada.

Esses atalhos diminuem o intervalo entre pensar e desenhar. Essa imediatez é o principal motivo pelo qual o Excalidraw é tão bom para diagramas rápidos — você não fica procurando em menus enquanto a ideia ainda está fresca.

## O ecossistema open source

Um dos pontos fortes reais do Excalidraw é o que outras pessoas construíram sobre ele. Por ter licença MIT e ser distribuído como pacote npm, ele foi incorporado num número surpreendente de ferramentas.

O [Excalideck](/tool/excalideck-com) transforma desenhos do Excalidraw em slides de apresentação — a estética de esboço em formato de slide, sem software adicional. Para palestras técnicas onde você quer mostrar diagramas de arquitetura sem trocar de ferramenta, isso é genuinamente útil.

Há plugins para o Obsidian que permitem desenhar diagramas do Excalidraw dentro do seu cofre de notas. Extensões do VS Code incorporam uma tela ao lado do seu código. Várias ferramentas de documentação e wikis adicionaram integração com o Excalidraw, permitindo que equipes mantenham diagramas no mesmo lugar que o texto que eles ilustram.

O sistema de bibliotecas merece menção. A comunidade contribuiu com centenas de coleções de formas prontas — ícones de arquitetura AWS, diagramas de infraestrutura do Google Cloud, componentes de UI mobile, templates de fluxograma, diagramas de banco de dados. Eles se instalam pelo navegador de bibliotecas dentro do app, sem precisar de cadastro.

O projeto acumulou mais de 80.000 estrelas no GitHub, colocando-o entre as ferramentas de desenho open source mais adotadas. Manutenção ativa, rastreador de issues responsivo e um ecossistema saudável de integrações são o resultado de anos de desenvolvimento consistente.

## Quem deveria usar o Excalidraw

Se você esboça diagramas de arquitetura, o Excalidraw é difícil de superar. O estilo de esboço remove a pressão de deixar as coisas com boa aparência antes que a ideia esteja sólida, e os atalhos de teclado permitem que você pense e desenhe na mesma velocidade.

Para wireframes de UX na fase lo-fi — antes de abrir o Figma ou o Sketch — o Excalidraw funciona bem. A estética bruta comunica claramente "isso é exploração", o que tende a gerar feedback mais honesto do que um mockup perfeito em pixels.

Em contextos educacionais, professores usam para desenhar diagramas durante videochamadas, com alunos entrando na tela compartilhada. O modelo sem conta é especialmente importante aqui: você não pode presumir que todos os alunos têm ou querem criar contas em mais uma plataforma.

Para qualquer coisa que exija alinhamento preciso, formatação condicional ou um diagrama que vai para um documento de especificação formal, use o [Diagrams.net](/tool/app-diagrams-net) ou uma ferramenta vetorial dedicada. O estilo de esboço do Excalidraw é também o seu teto.

## Começar sem nenhuma configuração

Acesse [excalidraw.com](https://excalidraw.com). Comece a desenhar. Esse é o processo de onboarding inteiro.

Seu desenho é salvo automaticamente no `localStorage` enquanto você trabalha, então fechar a aba e reabrir traz de volta sua última tela. Para qualquer coisa que você queira guardar a longo prazo, use `Ctrl+Shift+E` para exportar — seja como arquivo `.excalidraw` (para reabrir e editar depois) ou como PNG/SVG (para compartilhar ou incorporar).

Para colaborar, clique no ícone de pessoa e compartilhe o link da sala. Seus colaboradores não precisam instalar nada, nem ter conta, nem fazer download. O link é tudo.

Se você quiser hospedar por conta própria — para uma intranet corporativa, uma rede escolar, ou simplesmente porque quer controle total sobre onde seus desenhos são armazenados — a imagem Docker está disponível e a documentação de auto-hospedagem é completa. A licença MIT significa que você pode modificar e executar como quiser.

Mais ferramentas que respeitam a privacidade e não exigem login estão listadas em [nologin.tools](/tool/nologin-tools) se você está montando um conjunto de ferramentas que evita criação de contas no geral.

A categoria de ferramentas de quadro branco é uma em que a opção gratuita, open source e com foco em privacidade é genuinamente a melhor para a maioria dos usuários. Isso não acontece com frequência. O Excalidraw conquistou esse posto tratando a privacidade do usuário e a propriedade local dos dados como funcionalidades de verdade — não como algo pensado depois.
