---
title: "Excalidraw é privado? Quadro branco online gratuito, sem login"
description: "O Excalidraw criptografa a colaboração com chaves que nunca saem do seu navegador. Saiba como esse quadro branco gratuito mantém seus diagramas privados por design."
publishedAt: 2026-04-08
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source"]
featured: false
heroImageQuery: "privacy encryption whiteboard digital security"
locale: "pt"
originalSlug: "excalidraw-privacy-review"
sourceHash: "9dbf0a033cb42d45"
---

![Hero image](/blog/images/excalidraw-privacy-review/hero.jpg)

Pense no último diagrama que você desenhou em um quadro branco colaborativo online. Talvez fosse um esboço de arquitetura para um produto que você ainda não anunciou. Um mapa de processos mostrando como sua equipe realmente opera. Uma análise da concorrência. Um cronograma de captação de recursos.

Esse conteúdo vive em algum lugar. Na maioria das plataformas de quadro branco, ele vive nos servidores delas — legível pelos funcionários, acessível a solicitações legais, sujeito ao que a política de privacidade diz. A maioria das pessoas não pensa nisso até que seja tarde demais.

O Excalidraw lida com isso de forma diferente. Quando você compartilha um desenho via link de colaboração, seu conteúdo é criptografado antes de sair do seu navegador. Os servidores do Excalidraw transmitem dados entre os participantes, mas não conseguem ler o que esses bytes contêm. A chave de criptografia nunca toca a infraestrutura deles.

Essa é uma escolha de design significativa para uma ferramenta web gratuita. Veja o que isso realmente significa e quando isso importa.

## O que a maioria das ferramentas de quadro branco faz com seus dados

Ferramentas populares de quadro branco funcionam como serviços em nuvem. Seu conteúdo fica nos servidores deles, e a plataforma tem acesso de leitura a ele. Isso não é necessariamente malicioso — é apenas como o software em nuvem funciona. Mas tem consequências práticas.

O Miro armazena seus quadros na infraestrutura deles, e os termos de serviço concedem direitos de usar conteúdo para melhorar o produto. O FigJam é parte da suite empresarial da Figma. O Lucidchart armazena seus diagramas na nuvem; opções de residência de dados são um recurso de nível enterprise.

As políticas de privacidade não estão escondidas. Ninguém as lê, mas a situação que elas descrevem é: tudo que você desenha é armazenado por uma empresa que pode vê-lo. Para um esboço rápido, isso é provavelmente aceitável. Para um roadmap de produto pré-lançamento ou um diagrama de fluxo de trabalho de saúde, o cálculo muda.

A alternativa tradicional aos quadros brancos em nuvem era "ferramentas que armazenam localmente, mas não podem colaborar." O Excalidraw quebrou esse trade-off.

## Como a arquitetura de privacidade do Excalidraw realmente funciona

Quando você inicia uma sessão de colaboração no [Excalidraw](https://excalidraw.com), o app gera duas coisas: um ID de sala aleatório e uma chave de criptografia aleatória. Ambos são incorporados na URL após o símbolo `#`.

Esse posicionamento é significativo. Navegadores nunca enviam o fragmento da URL para servidores. Quando seu navegador carrega `https://excalidraw.com/#room=abc123,encryptionKey456`, ele envia uma solicitação GET para `excalidraw.com/` sem nenhuma informação de sala ou chave incluída. O servidor recebe apenas a solicitação base — nunca vê o fragmento.

Os dados do desenho são criptografados no navegador usando a [API Web Cryptography](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) antes da transmissão. O servidor armazena e encaminha apenas texto cifrado. Sem a chave — que ele não tem e não pode obter — os dados são ilegíveis para a infraestrutura do Excalidraw.

Essa é a mesma arquitetura usada pelo [Yopass](/tool/yopass-se) para compartilhamento de segredos criptografados e pelo [hat.sh](/tool/hat-sh) para criptografia de arquivos no navegador: o servidor cuida do transporte, o usuário detém as chaves.

Para uso solo, a situação é ainda mais simples. O Excalidraw armazena seu desenho atual no `localStorage` do navegador. Nada é enviado a lugar nenhum, a menos que você inicie explicitamente uma sessão de colaboração ou exporte um arquivo.

## Verificando as alegações de privacidade

Uma alegação de privacidade de uma ferramenta de código fechado exige confiança. Qualquer um pode dizer "não lemos seus dados."

O Excalidraw é [licenciado MIT e disponível publicamente no GitHub](https://github.com/excalidraw/excalidraw). A implementação de criptografia está no código-fonte, legível por qualquer pessoa com um navegador e alguns minutos. O código de sessão de colaboração, a geração de chaves e a passagem de mensagens podem todos ser auditados. Sem necessidade de confiança — o código é a prova.

O projeto acumulou mais de 80.000 estrelas no GitHub. Isso significa que um grande número de desenvolvedores olhou para o código ao longo de vários anos de desenvolvimento ativo. Se houvesse um problema de privacidade na implementação, seria detectável.

Essa é a diferença significativa entre "valorizamos sua privacidade" (linguagem de marketing) e "aqui está o código que implementa a privacidade" (propriedade verificável).

## Colaboração sem contas — e sem compromissos

A suposição típica sobre software que respeita a privacidade é que ele troca recursos por proteção. A colaboração em tempo real normalmente requer contas, o que exige fornecer um endereço de e-mail, o que inicia um relacionamento com uma plataforma que tem acesso ao seu conteúdo.

O modelo de colaboração do Excalidraw quebra essa suposição. Duas pessoas podem editar o mesmo canvas em tempo real — cursores aparecem com nomes, mudanças se propagam imediatamente — sem que nenhuma das duas tenha uma conta. O link criptografado é o mecanismo de acesso. Compartilhe-o e seu colaborador entra. Não compartilhe e ele não pode.

Para casos de uso onde a criação de conta é uma barreira — obter feedback de um cliente que não quer mais um login de SaaS, ou conduzir uma entrevista técnica onde você quer que o candidato se concentre no problema, não em um fluxo de cadastro — isso importa na prática.

As sessões são efêmeras por padrão. Quando a última pessoa fecha a aba, a sessão termina. Não há sala em nuvem persistente para voltar, a menos que você exporte o arquivo `.excalidraw`. Para um brainstorming pontual ou uma única sessão de trabalho, tudo bem. Para trabalho contínuo de equipe, exportações regulares para uma pasta compartilhada é o fluxo de trabalho.

## Excalidraw vs. as alternativas: uma comparação focada em privacidade

Quando a questão é especificamente sobre privacidade de dados, a comparação não é recursos versus recursos — são modelos de dados.

| | Excalidraw | Miro | FigJam | tldraw |
|---|---|---|---|---|
| Servidor lê conteúdo | Não (E2E criptografado) | Sim | Sim | Não |
| Login necessário | Não | Sim | Sim | Não |
| Auto-hospedável | Sim (MIT) | Não | Não | Sim |
| Código-fonte visível | Sim | Não | Não | Sim |
| Colaboração E2E criptografada | Sim | Não | Não | Parcial |

[tldraw](/tool/tldraw-com) é o concorrente mais próximo em termos de privacidade. Também é open source, também não exige login, e tem uma experiência colaborativa fluida. A principal diferença é o modelo de criptografia — a arquitetura do tldraw não usa atualmente a mesma abordagem de fragmento de URL para criptografia de ponta a ponta durante a colaboração.

[Diagrams.net](/tool/app-diagrams-net) é outra opção sem login digna de nota por razões de privacidade. Salva localmente por padrão e não requer conta. Mas não oferece colaboração em tempo real da mesma forma.

O Miro é poderoso e refinado. Se sua equipe já paga por ele e a privacidade não é uma preocupação para seu caso de uso, não há razão convincente para trocar. Mas se você estiver desenhando algo que não deveria ser legível por terceiros, a diferença de arquitetura é real.

## A opção de auto-hospedagem

Se "o servidor de colaboração é E2E cego" ainda envolve muita confiança em um operador terceirizado — porque você está em um setor regulamentado, ou a política da sua organização exige que as ferramentas sejam executadas na infraestrutura da empresa — o Excalidraw pode ser auto-hospedado.

A [imagem Docker oficial](https://hub.docker.com/r/excalidraw/excalidraw) torna o deployment simples. Você executa o Excalidraw em seu próprio servidor, sem infraestrutura do Excalidraw envolvida. Todo o tráfego passa pelo seu servidor, na sua jurisdição, atrás do seu firewall.

Essa opção existe porque a licença MIT permite explicitamente isso. Organizações de saúde, finanças e governo implantaram o Excalidraw em redes internas precisamente porque a alternativa — um quadro branco SaaS que armazena diagramas em servidores externos — cria exposição de conformidade.

## Onde o modelo de privacidade tem limites

A precisão importa aqui. O modelo de privacidade do Excalidraw é forte em formas específicas e bem definidas. Ele tem limites que vale a pena conhecer.

Se você exportar um PNG e enviá-lo para o Slack, Google Drive ou por e-mail, as garantias do Excalidraw terminam na exportação. As plataformas pelas quais você compartilha têm acesso normal a esses arquivos.

Excalidraw+ — a versão hospedada paga que adiciona armazenamento em nuvem persistente e salas protegidas por senha — é um produto diferente com um modelo de armazenamento diferente.

O `localStorage` do navegador geralmente não é criptografado no nível do sistema operacional. Se alguém tiver acesso físico à sua máquina e souber onde procurar, poderá extrair um desenho do armazenamento do navegador.

Os metadados não são criptografados. O Excalidraw sabe quando você acessa o site, quanto tempo duram as sessões e quais endereços IP participaram. Isso é registro padrão de servidor web.

Nada disso é razão para evitar a ferramenta. São o quadro preciso do que "privado" significa nesse contexto.

## Começando

Acesse [excalidraw.com](https://excalidraw.com). Comece a desenhar. Sem cadastro. Sem instalação.

Seu desenho é salvo automaticamente no `localStorage` enquanto você trabalha. Fechar a aba e reabri-la recupera seu último canvas. Para armazenamento permanente, exporte como `.excalidraw` (um arquivo JSON que você pode reabrir e editar depois), PNG ou SVG.

Para colaboração, clique no ícone de pessoa na barra de ferramentas e compartilhe o link gerado. Seu colaborador não precisa de nada instalado, sem conta, sem download. O link é a sessão.

O que é interessante no Excalidraw não é que é gratuito. É que as pessoas que o construíram escolheram, por design, tornar o servidor cego ao conteúdo. A colaboração em tempo real onde o intermediário não consegue ler os dados foi considerada um problema de engenharia. Eles o resolveram e depois tornaram a solução open source.
