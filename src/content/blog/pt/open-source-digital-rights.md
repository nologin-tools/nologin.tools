---
title: "O direito digital a um software que não te vigia"
description: "As ferramentas de código aberto sem login não são apenas convenientes — elas colocam os direitos digitais em prática: comunique-se e colabore sem ser rastreado."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["open-source", "privacy", "analysis", "tools", "browser"]
featured: false
heroImageQuery: "digital rights open source privacy freedom"
locale: pt
originalSlug: "open-source-digital-rights"
sourceHash: "994e76dd1a720e0b"
---

![Hero image](/blog/images/open-source-digital-rights/hero.jpg)

Uma pergunta que vale a pena considerar: quando você entra em uma videochamada pelo Zoom, o que você concordou em compartilhar? Seu nome. Seu e-mail. Seu endereço IP. Os metadados do seu dispositivo. Seus padrões de uso. O conteúdo das suas chamadas, dependendo do plano que o anfitrião paga. Tudo isso antes mesmo de a chamada começar.

[Jitsi Meet](/tool/meet-jit-si) roda completamente no seu navegador. Sem conta. Sem download. Sem cadastro. A chamada começa no momento em que alguém compartilha um link. O Jitsi é open source (licença Apache 2.0), pode ser auto-hospedado e é usado por [milhões de pessoas no mundo todo](https://jitsi.org/) — incluindo organizações que lidam com comunicações genuinamente sensíveis. O código-fonte é público e foi auditado de forma independente. A arquitetura usa WebRTC, o que significa que a mídia viaja peer-to-peer quando possível, sem passar pelos servidores do Jitsi.

Esse contraste não é só uma comparação de produtos. É sobre que tipo de software você tem o direito de usar.

## Direitos digitais não são abstratos

"Direitos digitais" parece algo que só diz respeito a ativistas e advogados. Não é assim. A [Electronic Frontier Foundation](https://www.eff.org/issues/privacy) passa três décadas argumentando que o direito de se comunicar de forma privada, de usar software sem ser perfilado e de ser dono dos seus próprios dados é uma questão de liberdades civis — não uma mera preferência de consumidor. O GDPR codificou parte disso em lei: o Artigo 5 exige que dados pessoais sejam coletados para "finalidades determinadas, explícitas e legítimas" e não processados de formas incompatíveis com essas finalidades. O Artigo 25 exige "proteção de dados desde a concepção e por padrão".

As ferramentas open source sem login são o que esses princípios parecem na prática. Elas não pedem dados porque não precisam deles. Não precisam porque a arquitetura foi construída em torno do usuário, não de um modelo de negócio que monetiza dados de usuário.

As ferramentas sem cadastro que mais importam não são só as que pulam um campo de formulário. São aquelas em que não precisar de login é uma consequência natural de como o software funciona: processamento no lado do cliente, transferência peer-to-peer, estado zero no servidor. Abrir mão do cadastro não é uma funcionalidade que elas adicionaram. É uma funcionalidade que nunca precisaram.

## Quando você precisa compartilhar sem deixar rastro

Alguém te manda uma senha sensível, uma chave de API, um contrato. Você precisa repassar para um colega. E-mail é texto simples. O Slack guarda logs. Apps de mensagens frequentemente armazenam o histórico indefinidamente. O impulso de "só mandar uma mensagem" é compreensível — e muitas vezes exatamente errado.

[Yopass](/tool/yopass-se) resolve isso direito. Você cola um segredo, define uma expiração e recebe um link de uso único. O destinatário abre o link, lê o segredo, e ele é automaticamente deletado. O segredo é criptografado no lado do cliente antes de sair do seu navegador; os servidores do Yopass veem apenas texto cifrado que não conseguem ler. Quando o link é usado (ou expira), os dados criptografados somem. Sem logs, sem persistência, sem necessidade de conta em nenhum dos lados. O [código-fonte](https://github.com/jhaals/yopass) é público — você pode verificar essa afirmação em vez de aceitar por fé, e pode auto-hospedar o Yopass se preferir não confiar nem na infraestrutura deles.

O contraste com produtos como a função de "compartilhamento" do LastPass (exige contas nos dois lados) ou simplesmente mandar uma senha por e-mail é enorme. Essas ferramentas rastreiam quem mandou o quê para quem. O Yopass explicitamente não faz isso.

## Transferência de arquivos que bypassa o servidor por completo

A forma padrão de compartilhar um arquivo com alguém é fazer upload para um servidor — Google Drive, WeTransfer, Dropbox — e mandar um link. Esse servidor armazena seu arquivo. Ele pode ser requisitado judicialmente, sofrer um vazamento ou ser usado para analytics. O arquivo existe em algum lugar que você não controla, por mais tempo do que você imagina.

[PairDrop](/tool/pairdrop-net) faz algo estruturalmente diferente. Seu arquivo vai diretamente do seu dispositivo para o do destinatário, usando os canais de dados do WebRTC. O servidor do PairDrop só cuida da sinalização — o breve handshake que ajuda dois navegadores a se encontrarem. Uma vez conectados, o servidor sai de cena. O próprio arquivo nunca o toca.

Isso não é só uma melhoria de privacidade. É uma arquitetura diferente. O servidor não pode armazenar o que nunca recebe. Uma violação na infraestrutura do PairDrop não exporia seus arquivos transferidos porque eles nunca estiveram lá. [ShareDrop](/tool/sharedrop-io) funciona do mesmo jeito — vale salvar nos favoritos como alternativa que também não exige login e faz transferência P2P sem armazenamento intermediário.

Ambos são open source. Ambos funcionam em qualquer navegador moderno. Nenhum pede seu e-mail.

## Saber o que seu navegador revela

A distância entre "sem login" e "sem rastreamento" é maior do que a maioria das pessoas percebe. Uma ferramenta pode pular o formulário de cadastro e ainda assim fazer o fingerprint do seu navegador, logar seu IP e correlacionar suas visitas com pixels de rastreamento de terceiros. Algumas fazem isso. Você pode verificar se o seu navegador está vazando dados de formas que você não autorizou.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) — mantido pela EFF — testa se a impressão digital do seu navegador é única o suficiente para rastrear você entre sites diferentes. Ele verifica o bloqueio de rastreadores, a randomização de fingerprints e se scripts comuns de fingerprinting conseguem identificar sua configuração específica de navegador. Sem cadastro. Metodologia de teste open source. A EFF publica a metodologia publicamente para que você entenda exatamente o que está sendo medido.

[BrowserLeaks](/tool/browserleaks-com) vai mais fundo: endereço IP, fingerprint WebGL, fingerprint Canvas, contexto de áudio, enumeração de fontes, APIs de geolocalização. Cada teste mostra o que os sites conseguem descobrir sobre você sem perguntar. Os resultados costumam ser desconfortáveis. Saber o que seu navegador revela é uma condição prévia para tomar boas decisões sobre quais ferramentas sem login você pode realmente confiar.

| Ferramenta | Dados registrados | O servidor vê | Auto-hospedável |
|------|-------------|-------------|---------------|
| Zoom (gratuito) | Conta, IP, metadados, conteúdo das chamadas | Tudo | Não (proprietário) |
| Jitsi Meet | Opcional: nome de exibição | Apenas sinalização | Sim (Apache 2.0) |
| WeTransfer | IP, e-mail, conteúdo do arquivo | Arquivo + metadados | Não |
| PairDrop | Nada | Apenas sinalização | Sim (MIT) |
| LastPass Share | Dados da conta, logs de acesso | Arquivo criptografado | Não |
| Yopass | Nada | Segredo criptografado | Sim (MIT) |

## Por que o open source é a camada de confiança

A frase "respeitamos sua privacidade" não custa nada para publicar. Ela está em praticamente toda política de privacidade já escrita. A frase "aqui está o código que roda quando você usa nossa ferramenta" significa algo.

Código open source pode ser auditado. Pesquisadores de segurança examinam regularmente ferramentas open source e reportam publicamente o que encontram. Quando [o código do Jitsi](https://github.com/jitsi/jitsi-meet) lida com autenticação, a implementação está visível. Quando o Yopass realiza criptografia no lado do cliente, a [biblioteca cripto que ele usa](https://github.com/jhaals/yopass) é especificada e auditável. Quando o PairDrop estabelece uma conexão WebRTC, você pode ler exatamente quais dados passam pelo servidor de sinalização.

Ferramentas proprietárias podem fazer as mesmas afirmações e você não consegue verificá-las. Você pode checar as requisições de rede com as ferramentas de desenvolvedor do navegador (o que te diz alguma coisa), mas não consegue ver o código do lado do servidor que processa seus dados depois que foram transmitidos. Ferramentas open source com processamento no lado do cliente resolvem esse problema: não existe código do lado do servidor processando seus dados, e o código do lado do cliente é público.

É essa combinação que importa. Open source mas do lado do servidor é melhor que código fechado, mas ainda exige que você confie no servidor. No lado do cliente mas código fechado é melhor que no lado do servidor, mas ainda é opaco sobre o que o código faz localmente. Open source *e* no lado do cliente significa que nem o servidor nem o código exigem confiança além do que você pode verificar.

## A garantia do auto-hospedagem

Tem mais uma camada que vale entender: auto-hospedagem. Cada ferramenta mencionada aqui pode ser implantada em infraestrutura que você controla.

O Jitsi Meet tem documentação para auto-hospedagem no Ubuntu com um [guia passo a passo](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart). O Yopass tem suporte a Docker. A arquitetura do PairDrop é simples o suficiente para que um único servidor cuide da sinalização para milhares de usuários. Se você é uma organização com requisitos regulatórios específicos — saúde, jurídico, governo — isso importa. As obrigações do Artigo 28 do GDPR em torno de operadores de dados ficam sem efeito quando o operador é você mesmo.

Para a maioria dos indivíduos, a auto-hospedagem não vale o custo de manutenção. Mas a *possibilidade* de auto-hospedagem muda a relação de confiança com a versão hospedada. Uma ferramenta que você poderia rodar por conta própria, funcionando de forma idêntica seja usando a instância deles ou a sua própria, é fundamentalmente diferente de uma ferramenta em que a versão hospedada é a única opção. A arquitetura precisa ser limpa o suficiente para funcionar sem um back end proprietário, o que elimina muitas escolhas de design que habilitam vigilância.

## A trajetória aponta para menos confiança necessária

Software respeitoso com a privacidade costumava significar rodar algo na sua própria máquina, desconectada da rede. Essa não é mais a única opção. WebAssembly, WebRTC e criptografia no lado do cliente tornaram possível, coletivamente, construir ferramentas que rodam no navegador, se comunicam entre si e lidam com operações sensíveis — sem um servidor que acumula dados de usuário.

O projeto [PrivacyTests.org](/tool/privacytests-org) acompanha quais navegadores resistem a fingerprinting, rastreamento e vazamento de dados. A tendência é positiva: os navegadores estão ficando melhores em limitar o que terceiros podem coletar, e os usuários estão mais conscientes da distinção entre "gratuito" e "te custa seus dados".

As ferramentas sem login que valem a pena usar a longo prazo são aquelas em que a arquitetura torna a vigilância estruturalmente impossível, não apenas atualmente proibida por política. Políticas mudam. Modelos de negócio mudam. Arquitetura é mais difícil de mudar — especialmente quando o código é público e a comunidade perceberia.

Explore as ferramentas em [nologin.tools](/tool/nologin-tools) para encontrar opções open source e amigáveis à privacidade verificadas para processamento no lado do cliente. As marcadas como open source têm repositórios públicos que você pode inspecionar. Esse é o padrão que realmente significa algo.
