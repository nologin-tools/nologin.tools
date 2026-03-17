---
title: "A regra dos 4% é só o começo. O cFIREsim testa se o seu plano realmente sobrevive."
description: "O cFIREsim roda seu portfólio de aposentadoria por 150 anos de histórico real do mercado para mostrar o que realmente importa para a independência financeira — sem precisar de conta."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tools", "review", "finance", "retirement"]
featured: false
heroImageQuery: "retirement financial planning calculator investment chart"
locale: pt
originalSlug: cfiresim-com
sourceHash: bd8fc70bc57933a3
---

![Hero image](/blog/images/cfiresim-com/hero.jpg)

A "regra dos 4%" é um dos conselhos de aposentadoria mais repetidos na internet. Saque 4% do seu portfólio no primeiro ano, ajuste pela inflação a cada ano, e seu dinheiro deve durar 30 anos. Simples. Direto. Fácil de lembrar.

Mas não necessariamente válido para a sua situação.

A regra vem do [Estudo Trinity](https://en.wikipedia.org/wiki/Trinity_study), um artigo de 1998 que analisou retornos históricos de ações e títulos ao longo de períodos de 30 anos. Esse é o primeiro problema: 30 anos. Se você planeja se aposentar aos 45, precisa de uma pista de 45 a 50 anos, e as contas mudam bastante. O estudo usou uma mistura específica de ações e títulos. Não levou em conta a Previdência Social, renda de trabalho em tempo parcial, nem a mudança bem documentada nos padrões de gastos conforme as pessoas envelhecem.

O que a regra dos 4% oferece é uma linha de base útil, derivada de uma análise histórica específica e simplificada. O que a maioria das pessoas realmente precisa é saber se sua situação concreta aguenta — o tamanho real do portfólio, os gastos esperados de verdade, o horizonte de aposentadoria real.

É exatamente isso que o **cFIREsim** faz.

## O que o cFIREsim faz e as calculadoras simples não conseguem

O cFIREsim (o "c" vem de "colaborativo") é um simulador de portfólio de aposentadoria que roda no navegador, desenvolvido de forma iterativa com contribuições da comunidade FIRE — Financial Independence, Retire Early (Independência Financeira, Aposentadoria Antecipada). Ele pega seus dados reais e os testa contra cada sequência histórica do mercado no [conjunto de dados de longo prazo de Robert Shiller](http://www.econ.yale.edu/~shiller/data.htm), que cobre retornos de ações americanas, retornos de títulos e inflação pelo IPCA americano desde 1871.

O resultado não é um número tranquilizador único. É uma **taxa de sucesso**: o percentual dos períodos históricos de 30 anos (ou 40, ou 50) em que seu portfólio sobreviveu sem chegar a zero. Você também pode ver quais períodos históricos específicos falharam, e por quê.

Configure uma taxa de retirada de 3,5% num portfólio 60/40 por 40 anos e o cFIREsim pode mostrar uma taxa de sucesso histórica de 96%. Suba para 5% e você pode ver 73% — o que significa que em aproximadamente um de cada quatro cenários históricos o dinheiro acaba. A diferença entre saber "a regra dos 4% diz que estou bem" e saber "meu plano concreto falha em 27% dos cenários históricos" é a diferença entre uma heurística e uma análise de verdade.

Rodar seu plano contra 150 anos de história o testa contra períodos que realmente aconteceram:

- A Grande Depressão (1929–1933), com perdas em ações superiores a 80%
- Os anos 70 estagflacionários, onde a inflação corroeu o poder de compra enquanto os retornos ficaram estagnados
- A "década perdida" de 2000–2009, com dois grandes crashes em dez anos
- Mercados em alta prolongados, onde até estratégias ruins de retirada deram certo

O risco de sequência de retornos — o perigo de que um crash logo no começo da aposentadoria possa danificar permanentemente um portfólio que um crash posterior deixaria intacto — fica concreto quando você o vê em cenários históricos reais.

## Sem conta, sem barreira

O cFIREsim é totalmente gratuito e não exige registro. Acesse [cfiresim.com](https://cfiresim.com), insira seus números e rode a simulação. A ferramenta completa — análise histórica, modo Monte Carlo, todas as opções de configuração — funciona sem fazer login.

Isso importa especificamente para o planejamento de aposentadoria. Seus dados de simulação são financeiramente sensíveis: valor do portfólio, gastos anuais esperados, idade de aposentadoria. Ferramentas que exigem uma conta vinculam essas informações à sua identidade e as armazenam nos servidores delas. O cFIREsim processa tudo no seu navegador. Seus dados financeiros não saem do seu dispositivo.

Existe uma função de conta opcional para salvar cenários de simulação entre sessões, mas o simulador principal funciona inteiramente sem ela. Isso coloca o cFIREsim claramente na categoria de ferramentas sem login que respeitam a privacidade — a mesma categoria que o [FICalc](/tool/ficalc-app) para cálculos FIRE e o [The Measure of a Plan](/tool/themeasureofaplan-com) para modelos de planejamento financeiro.

## Configuração que realmente bate com a realidade

A profundidade de configuração é o que separa o cFIREsim de uma calculadora básica de juros compostos. Os dados principais são valor do portfólio, gastos anuais e duração da aposentadoria. Mas a ferramenta vai além.

**Estratégias de retirada.** A regra padrão dos 4% usa "dólar constante" — um valor fixo ajustado pela inflação a cada ano. Aposentados de verdade raramente gastam assim. O cFIREsim suporta:

- **Dólar constante** — a regra clássica; gaste o mesmo valor corrigido pela inflação todo ano
- **Percentual constante** — gaste um percentual fixo do portfólio restante; os gastos oscilam com o valor do portfólio
- **Variable Percentage Withdrawal (VPW)** — gaste mais em mercados bons, menos nos ruins, com base no seu horizonte de tempo
- **Grades de proteção de Guyton-Klinger** — mantenha a retirada alvo a menos que o portfólio cruce limites definidos, então corte ou aumente conforme necessário
- **Percentual do portfólio restante** — divida o portfólio pelos anos restantes a cada ano

Mudar de dólar constante para uma estratégia variável frequentemente melhora as taxas de sucesso históricas de forma significativa. O motivo: os gastos em dólar constante mantêm as retiradas no mesmo nível durante um crash, forçando você a vender mais ações a preços deprimidos. Estratégias adaptativas reduzem os gastos quando o mercado cai, dando tempo ao portfólio para se recuperar.

**Fontes de renda.** Previdência Social, pensões, renda de aluguel, trabalho em tempo parcial. Você pode adicionar fluxos de renda que começam em anos específicos — por exemplo, R$ 24.000/ano de renda previdenciária a partir do ano 20 de aposentadoria. Para quem se aposenta cedo, com uma lacuna antes dos benefícios governamentais, essa é uma variável crítica. Um portfólio que falha sem Previdência pode mostrar mais de 95% de sucesso quando você inclui a renda que começa aos 70 anos.

**Ajustes de gastos.** Pesquisas sobre os gastos reais de aposentados mostram que eles tendem a diminuir nos anos mais tardios. Você pode modelar uma redução de gastos após certa idade — gastos maiores nos primeiros anos ativos, menores nos seguintes.

**Alocação de ativos e trajetórias de transição.** Defina a composição de ações/títulos/caixa e, opcionalmente, configure uma trajetória que vá ajustando a alocação gradualmente ao longo do tempo.

## Monte Carlo vs. análise histórica

O cFIREsim oferece dois modos de simulação, e entender a diferença importa.

| Modo | Base | Cenários | Melhor para |
|------|------|----------|-------------|
| Histórico | Sequências reais do mercado desde 1871 | ~100–130 períodos | Entender os piores casos reais |
| Monte Carlo | Sequências aleatórias a partir de estatísticas históricas | 5.000+ cenários | Explorar riscos de cauda de baixa probabilidade |

O modo histórico é literal: testa seu plano contra cada período sobreposto do conjunto de dados. Os cenários são reais. Os crashes e as altas realmente aconteceram.

O Monte Carlo gera milhares de sequências de retornos aleatórios usando estatísticas derivadas dos dados históricos. Ele pode revelar riscos que não ocorreram historicamente, mas são estatisticamente plausíveis — quedas mais profundas ou mais longas, padrões de correlação diferentes entre ações e títulos.

Rodar os dois modos para o mesmo cenário e comparar os resultados diz algo útil: se o Monte Carlo mostra uma taxa de sucesso visivelmente menor do que a histórica, seu plano pode ser sensível a sequências piores do que qualquer coisa que já vimos. Se estão próximos, seu plano é robusto para uma gama mais ampla de futuros possíveis.

## Como se compara ao FICalc

O [FICalc](/tool/ficalc-app) é outro simulador FIRE sem login que vale mencionar diretamente, já que os dois atendem a um público que se sobrepõe. O FICalc é mais limpo e mais rápido para uma verificação básica de taxa de retirada — insira portfólio, gastos e anos, e obtenha um resultado visual claro.

O cFIREsim vai mais fundo na configuração. A comparação não é de qualidade; é sobre qual pergunta você está tentando responder.

> Use o FICalc para testar rapidamente uma taxa de retirada e ver um histórico claro de sucesso e falha.
>
> Use o cFIREsim quando precisar modelar fases de renda da Previdência Social, comparar estratégias de retirada lado a lado, rodar Monte Carlo junto com a análise histórica, ou considerar um padrão de gastos que muda ao longo do tempo.

Para a maioria das pessoas que estão começando a pensar em simulação de aposentadoria, o FICalc é a ferramenta certa para começar. Quando você quiser estrestar suposições ou modelar estruturas de renda mais complexas, o cFIREsim tem a profundidade de configuração necessária.

## Código aberto, validado pela comunidade

O cFIREsim é open source. O código está disponível publicamente, o que significa que você pode verificar exatamente o que o simulador está fazendo — qual conjunto de dados usa, como define "sucesso", quais suposições estão embutidas em cada estratégia de retirada.

Isso importa especificamente para ferramentas de planejamento de aposentadoria. Quando um simulador diz que seu plano tem uma taxa de sucesso de 89%, esse número só é útil se você entende o que significa. O que conta como sucesso? Que dados alimentam a simulação? Uma ferramenta proprietária pede que você confie no resultado dela. Uma ferramenta open source deixa você verificar.

A ferramenta foi amplamente discutida em comunidades FIRE ao longo de muitos anos — no r/financialindependence do Reddit, nos fóruns do Bogleheads e espaços semelhantes. Esse envolvimento sustentado da comunidade validou a metodologia e trouxe à tona casos extremos. O conjunto de funcionalidades reflete necessidades reais dos usuários ao longo do tempo.

## Como começar

Acesse [cfiresim.com](https://cfiresim.com) e comece com uma simulação mínima:

1. Defina **Portfolio** com suas economias de aposentadoria atuais ou projetadas
2. Defina **Spending** com os gastos anuais de aposentadoria esperados em valores de hoje
3. Defina **Retirement Length** com quantos anos você espera ficar aposentado
4. Clique em **Run**

O primeiro resultado dá uma taxa de sucesso base e um gráfico mostrando quais pontos de entrada históricos falharam. A partir daí, teste uma variável de cada vez: reduza os gastos em 10% e veja a taxa de sucesso mudar; adicione R$ 18.000/ano de Previdência Social a partir do ano 15; mude de dólar constante para percentual variável.

Cada mudança mostra exatamente o quanto seu resultado é sensível àquela suposição específica. Essa análise de sensibilidade é o valor real — não um percentual único, mas um entendimento de quais variáveis do seu plano realmente importam.

Para uma checagem dos seus números antes de rodar simulações de aposentadoria, o [Omni Calculator](/tool/omnicalculator-com) cobre crescimento composto, taxas de poupança e projeções de portfólio durante seus anos de acumulação.

O planejamento de aposentadoria historicamente exigiu software caro, um consultor financeiro, ou disposição para montar planilhas sofisticadas do zero. O cFIREsim coloca uma simulação genuinamente rigorosa numa aba do navegador, de graça e sem registro, apoiada por 150 anos de dados reais do mercado.

A pergunta que vale fazer não é se o seu plano parece confortável em uma planilha. É se ele sobrevive aos anos 70.
