---
title: "Como auditar a privacidade do seu navegador de graça — sem criar conta"
description: "Um guia passo a passo para testar o que seu navegador expõe usando ferramentas gratuitas sem necessidade de cadastro. Verifique vazamentos de IP, DNS e a unicidade da sua impressão digital."
publishedAt: 2026-04-15
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "tools"]
featured: false
heroImageQuery: "browser privacy security audit magnifying glass"
locale: pt
originalSlug: browser-privacy-audit-free-step-by-step
sourceHash: 9d9947ee9e2f5374
---

![Hero image](/blog/images/browser-privacy-audit-free-step-by-step/hero.jpg)

A maioria dos conselhos sobre privacidade pula a etapa mais importante: verificar o que está acontecendo de verdade. É fácil recomendar mudar configurações e instalar extensões. O que é mais difícil — e muito mais útil — é executar testes específicos para ver o que seu navegador está expondo agora, antes de mexer em qualquer coisa.

É exatamente isso que este guia propõe. Dez minutos, sem criar conta, sem instalar nada. Apenas um conjunto de ferramentas gratuitas que mostram exatamente o que está vazando, com números concretos para você agir.

## O que você está testando

Seu navegador expõe dados por quatro canais principais, e cada um exige um teste diferente.

**Endereço IP** — o mais óbvio. Cada conexão revela seu IP. Mas o WebRTC (a API do navegador que gerencia videochamadas) pode revelar seu IP real mesmo com VPN ativada, porque opera em uma camada que a VPN não intercepta.

**Consultas DNS** — cada domínio que você visita gera uma consulta DNS que vai para algum servidor. Por padrão, ela vai para o servidor do seu provedor de internet, sem criptografia. Seu provedor registra todos os domínios que você consulta. Uma VPN deveria rotear essas consultas pelo próprio servidor — mas frequentemente não faz isso, deixando um registro separado da sua navegação fora do túnel.

**Impressão digital do navegador** — sua combinação de GPU, fontes instaladas, fuso horário, resolução de tela, capacidade de processamento e dezenas de outros atributos forma um perfil único o suficiente para rastreá-lo entre sites sem usar cookies. A [pesquisa Panopticlick](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) da EFF descobriu que 83,6% dos navegadores têm uma impressão digital única, número que sobe para 94,2% quando plugins são incluídos. O modo anônimo não muda nada disso.

**Scripts de terceiros** — redes de publicidade e corretores de dados colocam scripts de rastreamento na maioria dos sites comerciais. Esses scripts rodam no seu navegador, leem sua impressão digital e reportam para seus servidores. Bloqueá-los é diferente de corrigir os vazamentos mencionados acima.

As quatro ferramentas gratuitas abaixo testam cada um desses aspectos. Execute-as antes de fazer qualquer mudança — você precisa de uma linha de base.

## Passo 1: Obtenha sua pontuação de impressão digital com o Cover Your Tracks

[Cover Your Tracks](/tool/coveryourtracks-eff-org) foi desenvolvido pela Electronic Frontier Foundation e é o melhor ponto de partida porque entrega um veredicto único e claro: seu navegador se mistura na multidão ou não.

Clique em "Test Your Browser" e aguarde uns dez segundos. O resultado se enquadra em uma de três categorias:

- **Proteção forte** — sua impressão digital é comum o suficiente para se misturar com muitos outros usuários
- **Proteção parcial** — parcialmente aleatorizada, mas ainda identificável em alguns aspectos
- **Impressão digital única** — seu navegador pode ser identificado e rastreado entre sites mesmo sem cookies

A maioria das pessoas recebe "impressão digital única" na primeira vez. Isso não é uma falha — é um ponto de partida que você pode melhorar. A ferramenta também mostra um detalhamento de entropia por atributo: quantos bits de informação identificável cada característica contribui. A resolução de tela normalmente adiciona 3 a 4 bits. A string User-Agent adiciona cerca de 10 bits. Juntos, uma impressão digital única carrega frequentemente entre 18 e 22 bits de entropia — o que significa que aproximadamente 1 em 250.000 navegadores compartilha a mesma combinação.

Anote seu resultado antes de fazer qualquer mudança. Você vai querer comparar depois.

## Passo 2: Verifique vazamentos de IP e WebRTC com o IPLeak

[IPLeak.net](/tool/ipleak-net) carrega rápido e verifica três coisas de uma vez: seu endereço IP visível, os IPs expostos via WebRTC e seus servidores DNS.

O que observar especificamente: a seção WebRTC está mostrando um IP diferente do seu IP principal? Se você estiver usando uma VPN e o WebRTC mostrar seu IP real do provedor em vez do IP da VPN — você tem um vazamento WebRTC confirmado. Sites podem fazer essa verificação silenciosamente em segundo plano, sem nenhuma interação do usuário.

A seção DNS mostra quais servidores estão processando suas consultas. Se você ver endereços IP pertencentes ao seu provedor ou operadora de telefonia, essas consultas estão saindo do túnel da sua VPN. Seu provedor consegue ver todos os domínios que você visita mesmo que o conteúdo esteja criptografado.

Se você não usa VPN, tanto a seção IP quanto a DNS vão mostrar os dados do seu provedor — esperado, mas importante entender. Para o seu provedor, você não é anônimo.

## Passo 3: Verifique sua configuração DNS

[DNS Leak Test](/tool/dnsleaktest-com) foca especificamente no DNS e faz uma verificação mais completa que o IPLeak. Use a opção "Extended Test" — ela envia múltiplas requisições DNS para subdomínios únicos e captura todos os resolvedores que respondem.

Os resultados mostram o endereço IP e a organização de cada servidor DNS. Resultado limpo: apenas os servidores do seu provedor de VPN aparecem. Vazamento DNS: os servidores do seu provedor aparecem junto com ou no lugar dos servidores da VPN. Vazamento grave: apenas os servidores do seu provedor aparecem mesmo com a VPN ativa, o que significa que a VPN não está roteando o tráfego DNS.

Aqui está uma comparação do que cada ferramenta gratuita de privacidade cobre:

| Ferramenta | Vazamento IP | Vazamento WebRTC | Vazamento DNS | Impressão Digital | Sem Cadastro |
|------|---------|-------------|----------|------|---------|
| [Cover Your Tracks](/tool/coveryourtracks-eff-org) | — | — | — | ✓ | ✓ |
| [IPLeak.net](/tool/ipleak-net) | ✓ | ✓ | ✓ | — | ✓ |
| [DNS Leak Test](/tool/dnsleaktest-com) | — | — | ✓ | — | ✓ |
| [BrowserLeaks](/tool/browserleaks-com) | ✓ | ✓ | — | ✓ | ✓ |
| [PrivacyTests.org](/tool/privacytests-org) | — | ✓ | ✓ | ✓ | ✓ |

Todas as cinco são gratuitas, sem cadastro e produzem resultados sobre os quais você pode agir imediatamente.

## Passo 4: Análise mais profunda com o BrowserLeaks

[BrowserLeaks](/tool/browserleaks-com) é uma coleção de páginas de teste individuais, cada uma focando em uma superfície específica de fingerprinting. É mais técnico que o Cover Your Tracks, mas te dá os dados brutos por trás da sua impressão digital.

As páginas mais importantes:

**Vazamentos WebRTC** — cruza com o que o IPLeak mostrou. Se as duas ferramentas reportam o mesmo IP vazado, o vazamento é real e consistente.

**Impressão digital Canvas** — mostra o hash de pixels que seu navegador produz quando solicitado a renderizar conteúdo de forma invisível. Se a resistência ao fingerprinting do Canvas estiver funcionando, esse valor muda a cada reload da página. Se for idêntico em cada carregamento, você pode ser rastreado via Canvas.

**Endereço IP** — inclui a geolocalização derivada do seu IP, normalmente precisa no nível de cidade sem GPS ou qualquer permissão sua.

**User-Agent Client Hints** — a nova API UA-CH do Chrome permite que sites consultem atributos individuais (versão do navegador, plataforma, arquitetura) separadamente em vez de ler uma string User-Agent monolítica. O BrowserLeaks mostra exatamente quais valores seu navegador expõe por esse canal mais recente.

[PrivacyTests.org](/tool/privacytests-org), mantido por um ex-engenheiro de privacidade do Firefox, faz benchmark de todos os principais navegadores em mais de 20 testes padronizados e publica os resultados publicamente. É menos para testar sua configuração atual e mais para comparar Firefox, Chrome, Brave e Safari lado a lado antes de decidir se vai trocar. Os testes são automatizados e atualizados regularmente, tornando-o uma referência confiável em vez de um instantâneo pontual.

## O que dá para consertar e o que não dá

Com seus resultados de referência em mãos, isso é o que você pode mudar na prática.

**Vazamento de IP por WebRTC** — resolvido em menos de dois minutos. No Firefox, abra `about:config`, procure `media.peerconnection.enabled` e defina como `false`. Isso desativa o WebRTC completamente; quebra as videochamadas no navegador, mas a maioria dos usuários não precisa delas. No Brave, vá em Configurações → Privacidade e segurança → Política de tratamento de IP WebRTC e selecione "Desativar UDP não proxiado". Para o Chrome não existe configuração nativa — instale a extensão uBlock Origin e ative "Impedir que o WebRTC vaze o endereço IP local" no painel de configurações.

**Vazamento DNS** — resolvido ativando o DNS-over-HTTPS. Isso criptografa suas consultas DNS e as roteia por um resolvedor de sua escolha em vez do seu provedor. Firefox: Configurações → Privacidade e segurança → role até DNS sobre HTTPS → ative "Proteção máxima" e escolha Cloudflare ou NextDNS. Chrome: Configurações → Privacidade e segurança → Segurança → Usar DNS seguro → escolha um provedor. A [documentação de DNS over HTTPS da Mozilla](https://support.mozilla.org/en-US/kb/firefox-dns-over-https) cobre a configuração específica do Firefox em detalhes. Depois de ativar, execute o DNS Leak Test novamente para confirmar que os servidores do seu provedor não aparecem mais.

**Impressão digital única** — mais difícil, mas significativamente melhorável. Três abordagens com resultados documentados:

Firefox com `privacy.resistFingerprinting` ativado (`about:config`, defina como `true`) normaliza sua impressão digital para corresponder a todos os outros usuários Firefox com a mesma configuração — resolução de tela fixa, fuso horário UTC, User-Agent genérico. O Cover Your Tracks deve então retornar "proteção forte".

Brave adiciona ruído aleatório às impressões digitais de Canvas e áudio em cada sessão, tornando impraticável a correlação entre sessões mesmo que sessões individuais sejam identificáveis por fingerprinting. Ative "Proteção contra fingerprinting" nas configurações do Shields.

uBlock Origin no modo médio bloqueia a maioria dos scripts de terceiros antes de serem executados — impedindo que scripts de fingerprinting funcionem. Essa é a abordagem mais poderosa para usuários do Chrome que não querem trocar de navegador.

**Scripts de rastreamento** — a extensão Firefox [Multi-Account Containers](https://support.mozilla.org/en-US/kb/containers) isola diferentes sites uns dos outros, impedindo o rastreamento entre sites mesmo quando scripts são executados. O log de requisições de rede do uBlock Origin mostra exatamente quais scripts de terceiros estão sendo carregados em qualquer página.

> A ironia desconfortável: ter extensões de privacidade incomuns pode te tornar *mais* identificável. Se você é um dos poucos que usa uma combinação específica de extensões, essa configuração se torna um sinal distintivo. O objetivo não é bloquear tudo — é parecer com muitas outras pessoas.

## Reduzir a exposição sem mexer nas configurações

As correções técnicas abordam o comportamento do navegador. Elas não resolvem o que acontece quando você faz login e cria contas. Assim que um site tem seu endereço de e-mail, o fingerprinting se torna desnecessário — eles já têm um identificador permanente que te segue em todos os dispositivos.

Uma abordagem prática: usar ferramentas que não exigem conta. Para compartilhar arquivos sensíveis sem cadastro, o [Wormhole](/tool/wormhole-app) usa criptografia de ponta a ponta sem precisar de registro. Para enviar uma mensagem que se autodestrói após ser lida, o [PrivNote](/tool/privnote-com) funciona imediatamente sem criar conta. Quando um site exige endereço de e-mail só para ver conteúdo, o [Temp Mail](/tool/temp-mail-org) gera um endereço descartável na hora — sem cadastro, sem senha.

Isso não é gambiarra — é um modelo estruturalmente diferente. Uma ferramenta sem sistema de contas não consegue construir um perfil seu, porque não há nada ao qual vincular os dados. O [diretório nologin.tools](/tool/nologin-tools) cataloga centenas de ferramentas em diversas categorias — edição de imagens, conversão de arquivos, utilitários de desenvolvedor, colaboração — todas usáveis sem se cadastrar. Usá-las não requer corrigir configurações do navegador; elimina diretamente o mecanismo de coleta de dados.

## Por onde começar agora

Execute o Cover Your Tracks. Se mostrar "impressão digital única", esse é seu principal problema, e migrar para o Firefox com `privacy.resistFingerprinting` ativado ou para o Brave é a correção de maior impacto.

Depois execute o IPLeak. Se o WebRTC expuser um IP diferente do da sua VPN, isso se resolve em menos de dois minutos com uma configuração do navegador.

Em seguida execute o DNS Leak Test. Se servidores do seu provedor aparecerem nos resultados, ativar o DNS-over-HTTPS no navegador leva cerca de três cliques.

Três testes. Três correções concretas. Nenhuma exige criar uma conta. Execute o Cover Your Tracks novamente após fazer as mudanças — a diferença entre "impressão digital única" e "proteção forte" aparece imediatamente e vale a pena ver.

A privacidade se fortalece em camadas. Corrigir um vazamento não resolve tudo, mas reduz o que está realmente exposto — e saber exatamente o que está vazando é melhor do que adivinhar.
