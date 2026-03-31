---
title: "Seu navegador está vazando dados — veja como impedir isso"
description: "Seu navegador expõe seu IP real, GPU, fontes e fuso horário para cada site que você visita. Aqui está o que está vazando e como parar."
publishedAt: 2026-03-31
updatedAt: 2026-03-31
author: nologin.tools
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak surveillance"
locale: pt
originalSlug: browser-leaking-data-how-to-stop-it
sourceHash: fd14e428ffc082f9
---

![Hero image](/blog/images/browser-leaking-data-how-to-stop-it/hero.jpg)

Abra uma aba anônima. Sem cookies, sem histórico, sem login. Você se sente anônimo.

Mas não é. Nem de perto.

A [pesquisa Panopticlick da EFF](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) descobriu que **83,6% dos navegadores têm uma impressão digital única** — o suficiente para identificar você em cada site que visita sem precisar armazenar um único cookie. Adicione extensões ao navegador e esse número sobe para 94,2%. O modo anônimo não faz nada em relação a isso. Limpar os cookies também não.

Aqui está o que realmente está vazando e o que você pode fazer para impedir.

## O que seu navegador realmente envia

Toda vez que você carrega uma página, seu navegador revela uma porção considerável de informações sobre si mesmo. Antes mesmo de o JavaScript rodar, os cabeçalhos HTTP já revelam o nome e a versão do seu navegador, o sistema operacional, os idiomas preferidos e o suporte a codificações. Tudo isso acontece automaticamente — sem avisos, sem consentimento.

O JavaScript piora muito mais a situação. Sites conseguem ler a resolução da sua tela (incluindo o espaço ocupado pela barra de tarefas), seu fuso horário exato, quantos núcleos de CPU você tem, quanta RAM seu dispositivo possui (arredondada para a potência de dois mais próxima, mas ainda assim útil) e qual esquema de cores você prefere. Nada disso requer qualquer diálogo de permissão.

O total é impressionante: bibliotecas modernas de fingerprinting como o FingerprintJS coletam **mais de 100 atributos individuais** por navegador. Combinados em um hash, eles produzem um identificador que persiste entre sessões, entre navegadores no mesmo computador e até no modo anônimo. O FingerprintJS afirma ter 99,5% de precisão ao reidentificar visitantes que retornam, mesmo depois que os cookies foram apagados.

A verdade incômoda é que a maioria das coisas que você acha que te tornam "privado" online — apagar cookies, usar VPN, abrir modo anônimo — não afeta o fingerprinting em nada. São soluções para um problema diferente.

## O problema do WebRTC (e por que sua VPN não ajuda)

WebRTC é a API do navegador que possibilita chamadas de vídeo direto no navegador — Google Meet, Discord, Zoom web. Ela funciona estabelecendo conexões peer-to-peer diretamente entre navegadores, o que significa que precisa conhecer seu endereço de rede real.

O problema é este: qualquer site pode acionar uma tentativa de conexão WebRTC com algumas linhas de JavaScript, sem interação do usuário ou permissão. Para encontrar o caminho mais rápido entre os pares, o WebRTC usa um protocolo chamado ICE (Interactive Connectivity Establishment), que contata um servidor STUN público. A resposta desse servidor STUN inclui seu **endereço IP público real**.

Sua VPN não intercepta isso. O tráfego WebRTC usa UDP e é tratado pelo sistema operacional de forma diferente do tráfego HTTP do navegador. A maioria das implementações de VPN simplesmente não o intercepta. Então, mesmo com uma VPN ativa, um site pode executar este código e descobrir seu IP real em menos de um segundo:

```js
const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
pc.createDataChannel("");
pc.createOffer().then(o => pc.setLocalDescription(o));
pc.onicecandidate = e => { /* seu IP real está em e.candidate.candidate */ };
```

Isso se chama vazamento de WebRTC, e está documentado em SDKs comerciais de fingerprinting, plataformas de ad tech e sistemas antifraude.

**Como bloquear:** O Firefox permite desativar o WebRTC completamente definindo `media.peerconnection.enabled` como `false` no `about:config`. Isso quebra as chamadas de vídeo no navegador, portanto é uma troca. As configurações avançadas do uBlock Origin incluem a opção "Impedir que o WebRTC vaze endereços IP locais", que é menos destrutiva — bloqueia a exposição do IP local enquanto permite que o WebRTC funcione. O Brave bloqueia o vazamento de IP local por padrão no painel Shields.

Você pode verificar se está vazando com o [IPLeak](/tool/ipleak-net), que mostra todos os candidatos ICE do WebRTC que seu navegador está expondo agora.

## Vazamentos de DNS: o outro buraco na sua VPN

Quando você digita um domínio no navegador, um resolvedor de DNS transforma isso em um endereço IP. Se você usa uma VPN, essa consulta deveria passar pelo túnel da VPN até o resolvedor do seu provedor — não até o da sua operadora.

Um vazamento de DNS acontece quando ela vai para a operadora de qualquer forma, revelando cada domínio que você visita independentemente da VPN. O conteúdo do seu tráfego permanece criptografado, mas sua operadora consegue ver que você visitou `exemplo.com` às 21h14 de terça-feira. Isso é suficiente para construir um perfil comportamental detalhado.

Vazamentos de DNS acontecem por várias razões de infraestrutura meio chatas. O Windows tem um recurso chamado Smart Multi-Homed Name Resolution que envia consultas DNS para **todos** os adaptadores de rede disponíveis simultaneamente e usa a resposta mais rápida. Isso significa que as consultas vão tanto para o resolvedor da VPN quanto para o da operadora ao mesmo tempo. Muitos clientes VPN não substituem esse comportamento corretamente.

IPv6 é outro culpado comum. Muitas VPNs só tunelam tráfego IPv4. Se o seu roteador e sistema operacional suportam IPv6, consultas de DNS por esse caminho contornam completamente o túnel da VPN.

Algumas operadoras pioram isso ainda mais executando proxies DNS transparentes — elas interceptam todo o tráfego UDP de saída na porta 53 e redirecionam para seus próprios resolvedores, mesmo que você tenha configurado um servidor DNS diferente como 1.1.1.1 ou 8.8.8.8.

**Para testar se você está vazando:** Execute um teste estendido no [DNS Leak Test](/tool/dnsleaktest-com). Ele envia consultas DNS para um conjunto de subdomínios únicos e observa quais resolvedores os captam. Se os resultados mostrarem os servidores da sua operadora em vez dos do seu provedor de VPN, você tem um vazamento confirmado.

A solução depende da sua configuração, mas ativar DNS-over-HTTPS (DoH) no navegador é um bom ponto de partida que contorna completamente o resolvedor do sistema. No Firefox, está em Configurações → Privacidade e Segurança → DNS sobre HTTPS. Coloque em "Proteção máxima" para evitar o fallback para o resolvedor do sistema.

## Canvas e audio fingerprinting (a parte mais assustadora)

Mesmo com o WebRTC bloqueado e o DNS seguro, existe uma categoria de fingerprinting que não depende da sua rede em absoluto. Ela explora pequenas diferenças na forma como seu hardware renderiza gráficos.

O canvas fingerprinting funciona assim: um script desenha texto e formas em um elemento `<canvas>` invisível e depois lê os dados de pixel. O resultado varia — sutilmente, mas de forma mensurável — com base no modelo da sua GPU, na versão do driver, no sistema operacional e no mecanismo de renderização de fontes. O macOS usa CoreText, o Windows usa DirectWrite, o Linux usa FreeType. Cada um produz um antialiasing sub-pixel levemente diferente. Cada driver de GPU tem seu próprio comportamento de arredondamento de ponto flutuante. O artigo acadêmico de 2014 ["The Web Never Forgets"](https://dl.acm.org/doi/10.1145/2660267.2660347) encontrou canvas fingerprinting implantado em 5% dos 100.000 principais sites à época — e isso foi há mais de uma década.

O audio fingerprinting é similar. Um script cria um `AudioContext`, passa um oscilador por um analisador e lê os valores de saída. As minúsculas diferenças de ponto flutuante na forma como seu hardware processa áudio são consistentes o suficiente para identificar você entre sessões. Nenhum acesso ao microfone é necessário.

Esses dois sinais combinados — canvas + impressão digital WebGL — carregam cerca de 15 ou mais bits de entropia cada. Isso significa que aproximadamente 1 em cada 32.768 navegadores compartilha a mesma impressão canvas de forma isolada. Combinada com a resolução da tela, fuso horário, número de núcleos de CPU e User-Agent, você chega a uma amostra de tamanho um.

> A ironia incômoda: ter extensões de privacidade pode tornar você *mais* identificável. Se você é uma das poucas pessoas que usa o uBlock Origin no "modo médio" com um conjunto específico de extensões, essa configuração em si se torna um sinal distintivo.

## Como se testar agora mesmo

Antes de mudar qualquer coisa, vale a pena ver o que você está realmente expondo.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) da EFF é o melhor ponto de partida. Ele testa seu navegador contra um banco de dados de milhões de impressões digitais reais e diz o quão única é a sua, com pontuações de entropia por atributo. "Seu navegador tem uma impressão digital única" significa que você pode ser identificado. "Proteção forte" significa que seu navegador se parece com muitos outros — que é o objetivo real.

[BrowserLeaks](/tool/browserleaks-com) vai mais fundo, com páginas separadas para vazamentos WebRTC, impressões canvas, detalhes WebGL, fontes instaladas, fingerprinting TLS e mais. Execute primeiro o teste de WebRTC — é onde a surpresa é mais provável.

[PrivacyTests](/tool/privacytests-org), mantido por um ex-engenheiro de privacidade do Firefox, compara navegadores entre si em mais de 20 testes de privacidade. É menos sobre testar seu navegador específico e mais sobre comparar Chrome, Firefox, Brave, Safari e Tor Browser em cenários padronizados. Vale ler antes de decidir se vai trocar de navegador.

## O que realmente ajuda

A resposta honesta é que nenhuma configuração isolada resolve tudo. Mas essas mudanças têm efeitos documentados e mensuráveis:

**Troque de navegador.** Esse é o movimento de maior impacto. O Brave bloqueia a exposição de IP local por WebRTC e o canvas fingerprinting por padrão — ele adiciona ruído aleatório à saída de canvas e áudio a cada sessão, tornando impossível a correlação entre sites sem precisar quebrar a web. O Firefox com `privacy.resistFingerprinting = true` adota uma abordagem diferente: normaliza tudo para parecer um navegador genérico (tamanho fixo de tela de 1000×900, fuso horário UTC, string UA genérica). Isso faz você parecer com qualquer outro usuário do Firefox com essa configuração ativada — que é o modelo correto.

| Navegador | Canvas FP | IP WebRTC | DNS-over-HTTPS | Cookies de terceiros |
|---|---|---|---|---|
| Chrome | Nenhuma | Vaza | Opcional | Bloqueios parciais |
| Firefox (padrão) | Nenhuma | Vaza | Opcional | Estrito (ETP) |
| Firefox (RFP) | Aleatório | Desativada | Opcional | Estrito |
| Brave | Aleatório | Bloqueada | Opcional | Bloqueados |
| Tor Browser | Uniforme | Desativada | N/A (usa Tor) | Bloqueados |

**Instale o uBlock Origin.** No Firefox, use o modo médio (bloqueia todos os scripts de terceiros por padrão, adiciona exceções conforme necessário). Ative "Impedir que o WebRTC vaze endereços IP locais" nas configurações avançadas. Isso bloqueia a maioria dos scripts de fingerprinting antes mesmo de serem executados. No Chrome, use-o antes que as mudanças do Manifest V3 do Google limitem ainda mais as capacidades das extensões.

**Ative o DNS-over-HTTPS.** Tanto o Firefox quanto o Chrome suportam isso nativamente agora. Use Cloudflare (1.1.1.1) ou NextDNS. O NextDNS em particular permite ver exatamente quais domínios seu navegador está resolvendo — útil para auditar o que está sendo executado em uma página.

**Congele seu User-Agent.** Sua string UA sozinha carrega cerca de 10,5 bits de entropia, de acordo com a pesquisa original do Panopticlick. O `privacy.resistFingerprinting` do Firefox resolve isso automaticamente. No Chrome, a API UA-CH (User-Agent Client Hints) foi gradualmente substituindo a string UA antiga — a intenção era reduzir a entropia, mas o lançamento foi inconsistente.

O Tor Browser continua sendo o padrão-ouro em resistência a fingerprinting. Ele normaliza todos os atributos rastreáveis para serem idênticos entre todos os usuários do Tor — mesmo UA, mesmo tamanho de tela, mesmas fontes, mesmo fuso horário. O objetivo é uniformidade, não bloqueio. Cada usuário do Tor Browser parece idêntico. Essa é a única abordagem que realmente derrota o fingerprinting em vez de apenas aumentar o custo.

Para a maioria das pessoas, Brave ou Firefox com uBlock Origin chega a 80% do caminho sem quebrar os sites que você realmente usa. Isso é uma troca razoável.

O que você não consegue resolver completamente sozinho é o TLS fingerprinting — a ordem dos cipher suites e os valores das extensões TLS que seu navegador envia durante o handshake HTTPS são característicos o suficiente para identificar seu navegador no nível de rede, antes de qualquer HTTP. Cloudflare e outras CDNs já usam hashes JA3 (uma impressão digital TLS padronizada) para detecção de bots. Nenhuma extensão de navegador toca nisso. É um problema solucionável, mas somente os próprios navegadores podem corrigi-lo.

A web tem mais infraestrutura de vigilância embutida do que a maioria dos usuários percebe. A boa notícia é que algumas mudanças concretas — um navegador melhor, uma extensão, DNS-over-HTTPS ativado — reduzem significativamente o que você está vazando. Comece com o Cover Your Tracks. Veja o que ele diz. Depois decida com o que você está confortável.

Vale mencionar mais uma coisa: as ferramentas que mais respeitam sua privacidade são aquelas que não exigem que você se identifique. Ferramentas que funcionam sem cadastro não conseguem correlacionar os dados da sua sessão com um perfil porque não há perfil para correlacionar. Se você quiser ter uma ideia de quantas ferramentas sem login existem, o [nologin.tools](/tool/nologin-tools) mantém uma lista curada — de editores de imagem ao compartilhamento de arquivos, passando por utilitários para desenvolvedores, tudo utilizável sem criar uma conta. É uma forma prática de reduzir sua presença online sem abrir mão de produtividade.
