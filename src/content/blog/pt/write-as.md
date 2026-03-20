---
title: "Write.as: publique na web sem dar seu e-mail a ninguém"
description: "O Write.as permite publicar qualquer coisa na web na hora — sem conta, sem rastreamento, sem complicação. Abra o editor e comece a escrever."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["tools", "review", "writing", "privacy"]
featured: false
locale: pt
originalSlug: write-as
sourceHash: e85653ed2eabdd37
heroImageQuery: "minimal writing desk notebook pen"
---

![Hero image](/blog/images/write-as/hero.jpg)

A maioria das plataformas de publicação começa do mesmo jeito: um campo de e-mail, um campo de senha e uma caixa de termos de uso que você nunca vai ler. Você ainda não escreveu uma palavra, e alguém já está construindo um perfil sobre você.

O Write.as pula tudo isso. Abre o site, começa a digitar, clica em publicar. Você recebe uma URL permanente. Só isso.

## O que o Write.as realmente faz

Write.as é uma plataforma minimalista de escrita e publicação construída em torno de uma premissa simples: o que você escreve importa mais do que quem você é. Quando você entra no site, cai direto no editor — uma área de texto limpa em tela cheia, sem barras laterais, sem pop-ups pedindo para você se inscrever em uma newsletter.

Escreva o que quiser. Clique em «Publicar». A plataforma gera uma URL única no formato `write.as/abc123xyz` e o post fica online na hora, acessível para qualquer pessoa com o link. Você não cria uma conta. Não precisa verificar e-mail. Só escreve.

Nos bastidores, o Write.as salva um «token de proprietário» localmente no seu navegador para que você possa editar ou excluir o post depois. Se quiser ter propriedade permanente em vários dispositivos, pode criar uma conta opcionalmente — mas nunca é obrigatório para o uso básico.

A interface em si é quase agressivamente simples. Markdown é suportado. O editor mostra texto limpo e legível. Sem barra de ferramentas de processador de texto, sem faixa de formatação, sem fileira de reações com emoji. Para quem acha a maioria dos editores web visualmente cansativa, essa contenção é o produto em si.

## A arquitetura que prioriza a privacidade

A maioria das plataformas de conteúdo é construída para saber o máximo possível sobre você — quais posts você lê, quanto tempo passa em cada um, no que clica em seguida. Esses dados são o modelo de negócio.

O Write.as foi desenhado com a premissa oposta. A plataforma coleta dados mínimos, não usa rastreamento publicitário e não exige nenhuma informação de identificação pessoal para publicar. Isso não é um argumento de marketing colado em cima de uma plataforma de anúncios comum — está inserido na arquitetura técnica desde o início.

O motor open source por trás do Write.as se chama **WriteFreely** e está disponível no GitHub em [github.com/writefreely/writefreely](https://github.com/writefreely/writefreely). Isso significa:

- Qualquer pessoa pode inspecionar exatamente como o software funciona
- Organizações e indivíduos podem hospedar sua própria instância
- As promessas de privacidade da plataforma não são só políticas — são código verificável

O auto-hospedagem do WriteFreely é cada vez mais popular entre coletivos jornalísticos, grupos acadêmicos e comunidades preocupadas com privacidade que querem publicação federada e descentralizada sem depender dos servidores de nenhuma empresa específica.

> «Eu quero uma ferramenta de escrita que não me peça nada.» — Um sentimento recorrente nas comunidades que gravitam em torno do Write.as

Essa frase explica por que essa ferramenta encontrou um público que plataformas de blogging genéricas nunca conseguiram atender bem.

## Como se compara a outras ferramentas de escrita sem login

Alguns editores no nosso diretório funcionam sem cadastro, mas atendem a propósitos diferentes. Veja como o Write.as se posiciona entre eles:

| Ferramenta | Uso principal | Precisa de login? | Publica na web? |
|------------|--------------|-------------------|--------------------|
| [ZenPen](/tool/zenpen-io) | Rascunho sem distrações | Não | Não — apenas local |
| [Dillinger](/tool/dillinger-io) | Edição Markdown | Não | Só exportação |
| [StackEdit](/tool/stackedit-io) | Markdown com sincronização | Opcional | Sem URL direta |
| [Hemingway Editor](/tool/hemingwayapp-com) | Checagem de estilo e legibilidade | Não | Não |
| Write.as | Publicação anônima | Não | Sim — URL imediata |

A distinção principal: todas as outras ferramentas sem login listadas acima são essencialmente ambientes locais de rascunho. O Write.as é o único onde o destino natural do seu trabalho é uma URL pública na web aberta, acessível a qualquer pessoa, criada sem nenhuma conta.

Isso o torna útil para um conjunto específico de tarefas que as outras ferramentas simplesmente não atendem:

- Compartilhar um rascunho com um colaborador sem usar o Google Docs (que exige login para editar)
- Publicar uma declaração pública ou carta aberta sem associar seu nome a uma conta de plataforma
- Criar rapidamente um documento de referência com link para uma reunião ou conversa
- Escrever algo que você quer compartilhar exatamente uma vez e depois esquecer

## Freemium sem padrões obscuros

O Write.as tem um plano pago. Ele adiciona funcionalidades como domínios personalizados, múltiplos blogs nomeados, contas de equipe e analytics. Coisas genuinamente úteis para quem quer construir uma presença online de longo prazo.

Mas o plano pago é claramente um upsell para pessoas que já extraíram valor do plano gratuito — não uma restrição projetada para fazer o gratuito parecer quebrado. O fluxo central (abrir o editor → escrever → publicar → obter uma URL) é completamente gratuito e funcional sem nenhuma conta.

Essa é uma distinção importante. Muitas ferramentas freemium projetam seu plano gratuito para ser frustrante por design, usando limitações para te empurrar para uma assinatura. O plano gratuito do Write.as faz exatamente o que promete. Se você nunca criar uma conta, ainda assim tem uma ferramenta de publicação completamente funcional.

Compare isso com a experiência de usar a maioria dos assistentes de escrita com IA: ferramentas como [QuillBot](/tool/quillbot-com) oferecem um plano gratuito funcional, mas ficam te pedindo para fazer upgrade. O Write.as não interrompe a experiência de escrita com lembretes de assinatura.

## Quem realmente usa

O Write.as encontrou seu público em várias comunidades que raramente se cruzam em outros espaços:

**Defensores da privacidade** o usam para publicar sem construir uma identidade digital. A combinação de não exigir conta e coletar dados mínimos faz dele uma das poucas plataformas que realmente corresponde aos valores declarados da comunidade de privacidade.

**Jornalistas e denunciantes** usaram instâncias baseadas no WriteFreely para publicar documentos e declarações quando o anonimato importa. A opção de auto-hospedagem significa que a publicação não depende da empresa Write.as.

**Desenvolvedores** o usam para artigos técnicos rápidos, documentos no estilo RFC ou anúncios internos que precisam de um link compartilhável sem montar um CMS completo.

**Escritores explorando ideias** o usam como um espaço sem pressão. Quando não há conta, seguidores, analytics ou comentários — o ciclo de validação social desaparece completamente. Isso é libertador ou aterrorizante, dependendo da sua relação com um público.

**Comunidades open source** rodam instâncias próprias do WriteFreely para blogs comunitários e jornais coletivos, com seguimento federado habilitado pelo suporte ao ActivityPub integrado na plataforma.

## ActivityPub e a web federada

Uma funcionalidade que vale destacar: o Write.as suporta [ActivityPub](https://www.w3.org/TR/activitypub/), o padrão aberto que alimenta o Mastodon, o Pixelfed e outras plataformas sociais descentralizadas. Isso significa que, se você criar uma conta no Write.as (ou em qualquer instância WriteFreely auto-hospedada), seu blog pode ser seguido a partir do Mastodon e de outras plataformas federadas.

Seus leitores podem seguir seu blog Write.as a partir da conta deles no Mastodon. Novos posts aparecem no feed federado deles em ordem cronológica. Sem algoritmo de recomendação. Sem otimização de engajamento. Só posts chegando em ordem cronológica para as pessoas que escolheram te seguir.

Esse design federado reflete uma filosofia mais ampla: seu conteúdo deve existir na web aberta, não preso dentro dos jardins murados de nenhuma plataforma.

## Como começar

Não tem guia de configuração necessário. Vai em [write.as](https://write.as) e o editor já está lá. Começa a escrever. Quando estiver pronto, clica em Publicar. Salva a URL do post e o token de proprietário em algum lugar seguro se quiser poder editá-lo depois.

Se você se pegar usando regularmente, criar uma conta gratuita vale a pena — ela deixa você gerenciar todos os seus posts de um lugar só e te dá uma URL de blog permanente. Mas você pode publicar dezenas de posts antes de precisar tomar essa decisão.

Para quem está construindo sua própria infraestrutura de publicação, o repositório do WriteFreely inclui suporte ao Docker e documentação completa para auto-hospedagem. O software é mantido ativamente e usado por comunidades ao redor do mundo.

A web acumulou muito peso. Fluxos de cadastro, pixels de rastreamento, banners de consentimento de cookies, feeds algorítmicos. O Write.as é um lembrete de que publicar na web sempre foi mais simples do que o ecossistema ao redor sugere — e que ainda pode ser assim, sem abrir mão de nada que realmente importa.
