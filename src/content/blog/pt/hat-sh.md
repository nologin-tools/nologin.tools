---
title: "hat.sh: criptografe arquivos no navegador sem precisar confiar em ninguém"
description: "hat.sh criptografa e descriptografa arquivos usando AES-256-GCM diretamente no seu navegador. Sem uploads, sem servidores, sem contas — seus dados nunca saem do seu dispositivo."
publishedAt: 2026-03-24
author: "nologin.tools"
tags: ["tools", "review", "privacy", "encryption"]
featured: false
locale: pt
originalSlug: hat-sh
sourceHash: 49157d5e315dbffb
heroImageQuery: "file encryption security lock browser"
---

![Hero image](/blog/images/hat-sh/hero.jpg)

Todo serviço de armazenamento em nuvem, toda plataforma de compartilhamento de arquivos, toda ferramenta de upload que se diz "segura" tem uma coisa em comum: seus arquivos passam pelo computador de outra pessoa. Você está confiando na criptografia do provedor, na gestão das chaves deles, nos funcionários deles e nas obrigações legais deles com quem quer que solicite seus dados. É muita confiança para depositar em uma empresa que você nunca conheceu.

E se a criptografia acontecesse antes de o arquivo sair da sua máquina — no navegador, sem que nenhum servidor visse o texto em claro?

É exatamente isso que o [hat.sh](https://hat.sh) faz.

## O que o hat.sh realmente faz

hat.sh é uma ferramenta de criptografia de arquivos baseada no navegador. Você arrasta um arquivo para a página, digita uma senha (ou fornece uma chave pública), e ele gera um arquivo `.enc` criptografado. Para descriptografar, arraste o `.enc` para a mesma página, digite a senha e o arquivo original está de volta. Tudo acontece localmente em JavaScript — sem requisições de rede com o conteúdo do arquivo, sem backend, sem banco de dados.

O esquema de criptografia é AES-256-GCM, o mesmo algoritmo usado pelo Signal, WhatsApp e pela maioria das conexões TLS modernas. É criptografia autenticada, o que significa que a descriptografia falha — de forma explícita — se o arquivo foi adulterado em algum momento. Não dá para corromper silenciosamente um arquivo criptografado e esperar que o hat.sh aceite.

hat.sh suporta dois modos:

- **Criptografia baseada em senha**: você define uma senha e a ferramenta deriva uma chave de criptografia usando PBKDF2. Qualquer pessoa com a senha pode descriptografar.
- **Criptografia por chave pública**: você gera um par de chaves, compartilha sua chave pública, e qualquer pessoa pode criptografar arquivos que só você consegue abrir com sua chave privada. Usa troca de chaves X25519 combinada com AES-256-GCM.

O modo de chave pública é especialmente útil para equipes. Um jornalista pode publicar sua chave pública; fontes podem usar o hat.sh para criptografar documentos antes de enviar, sem nenhuma configuração do lado de quem envia.

## Sem login, sem upload, sem conta

A história de privacidade aqui é excepcionalmente limpa. O [código-fonte está no GitHub](https://github.com/sh-dv/hat.sh) sob licença MIT — você pode ler exatamente qual JavaScript está rodando no seu navegador. Sem telemetria, sem chamadas de analytics com os metadados dos seus arquivos, e sem componente no servidor para ser comprometido.

Compare com serviços típicos de compartilhamento "seguro" de arquivos:

| Recurso | Serviço típico de upload criptografado | hat.sh |
|---------|----------------------------------------|--------|
| Arquivos enviados ao servidor | Sim | Não |
| Conta necessária | Frequentemente | Nunca |
| Servidor vê o texto em claro | Depende da implementação | Não |
| Código-fonte auditável | Raramente | Sim (MIT) |
| Funciona offline | Não | Sim (após o primeiro carregamento) |

Ferramentas como o [VirusTotal](/tool/virustotal-com) enviam seus arquivos para servidores externos por design — esse é o propósito delas. hat.sh é o oposto: o ponto é exatamente que o conteúdo dos seus arquivos não vai a lugar nenhum.

## Quando você usaria o hat.sh

Imagine uma contadora autônoma que precisa enviar documentos fiscais a um cliente. E-mail é texto em claro. A maioria dos links de compartilhamento expira ou fica indexada. Ela quer algo simples: abrir uma página web, criptografar o arquivo com uma senha compartilhada, enviar o resultado.

Ou pense num desenvolvedor rotacionando credenciais num repositório. Ele precisa compartilhar um arquivo `.env` com um colega — só uma vez, com segurança. Não quer montar toda uma infraestrutura de chaves GPG para uma única transferência. Com o hat.sh, ele criptografa com uma senha descartável e manda o `.enc` pelo Slack, Discord ou e-mail. Sem a senha, o blob criptografado não vale nada.

Para pesquisadores de segurança, o modo de chave pública tem utilidade real. Você pode distribuir sua chave pública no seu site e deixar qualquer pessoa te enviar arquivos criptografados sem precisar instalar nada. Sem servidor de chaves PGP, sem cliente GPG, sem a complexidade da [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust).

## A honestidade técnica da criptografia no lado do cliente

A criptografia no lado do cliente tem uma limitação importante que vale reconhecer: se o próprio site for comprometido, um JavaScript malicioso poderia exfiltrar sua senha ou arquivo antes da criptografia. Essa é a tensão fundamental de qualquer ferramenta de criptografia baseada no navegador.

hat.sh lida com isso de algumas formas. Primeiro, o código aberto permite que qualquer pessoa audite o JavaScript. Segundo, você pode baixar o repositório e rodar o hat.sh localmente, em ambiente completamente isolado. Terceiro, para usuários com requisitos de segurança muito elevados, o projeto inclui um setup com Docker para self-hosting.

Para a maioria dos casos de uso — enviar documentos sensíveis a um colega, criptografar um backup antes de subir para a nuvem, proteger um arquivo de configuração — o modelo de ameaça não inclui uma CDN comprometida. A criptografia no navegador é uma melhoria substancial em relação a enviar arquivos sem proteção.

Se você quer entender como seu navegador lida com criptografia, a [especificação da Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/) documenta os primitivos que o hat.sh usa por baixo dos panos. É um recurso nativo do navegador, não uma implementação personalizada — as operações criptográficas acontecem em código C++ otimizado, não em JavaScript interpretado.

## hat.sh comparado a ferramentas similares sem login

Talvez você já conheça o [CyberChef](/tool/gchq-github-io-cyberchef), que também roda inteiramente no navegador e consegue lidar com criptografia AES. Mas o CyberChef é uma ferramenta de transformação de dados de uso geral — ele lida com encoding, compressão, hashing e centenas de outras operações além da criptografia. Essa amplitude o torna poderoso, mas também complexo para usuários não técnicos.

hat.sh foi construído para uma coisa só: criptografar arquivos para transporte ou armazenamento seguro. A interface é minimalista o suficiente para você passar a URL para alguém que não sabe o que é AES e ele descobrir como usar em menos de um minuto. A simplicidade é uma funcionalidade.

[Wormhole](/tool/wormhole-app) resolve um problema relacionado — transferência de arquivos P2P com criptografia ponta a ponta —, mas exige que as duas partes estejam online ao mesmo tempo, e os arquivos passam por servidores de retransmissão. hat.sh gera um arquivo estático criptografado que você pode enviar por qualquer canal, de forma assíncrona.

## Como começar

Usar o hat.sh pela primeira vez leva cerca de 30 segundos:

1. Acesse [hat.sh](https://hat.sh)
2. Arraste qualquer arquivo para a página (ou clique para procurar)
3. Escolha o modo "Password" e insira uma senha forte
4. Clique em **Encrypt** — você vai baixar um arquivo `.enc`
5. Compartilhe o `.enc` pelo canal que preferir; envie a senha separadamente

Para descriptografar:

1. Acesse [hat.sh](https://hat.sh)
2. Arraste o arquivo `.enc`
3. Digite a senha
4. Seu arquivo original é baixado automaticamente

Todo o processo não exige conta, instalação nem confiança em terceiros. O arquivo criptografado são apenas bytes — você pode salvá-lo no Dropbox, enviar por e-mail ou publicar. Sem a senha, ele é opaco.

---

Ferramentas de privacidade costumam ter um custo: ou você tem segurança forte com complexidade dolorosa (GPG), ou tem facilidade de uso com os dados indo para os servidores de outra pessoa. hat.sh aposta em algo diferente — que um aplicativo web bem projetado, transparente e de código aberto pode te dar os dois. À medida que os navegadores ficam mais capazes e a Web Crypto API amadurece, espere ver mais ferramentas seguindo esse padrão: o servidor só entrega o código, e tudo que é sensível acontece na sua máquina.
