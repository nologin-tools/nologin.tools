---
title: "The 4% Rule Is a Starting Point. cFIREsim Tests Whether Your Plan Actually Survives."
description: "cFIREsim runs your retirement portfolio through 150 years of real market history to show what actually matters for financial independence — no account needed."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tools", "review", "finance", "retirement"]
featured: false
heroImageQuery: "retirement financial planning calculator investment chart"
---

![Hero image](/blog/images/cfiresim-com/hero.jpg)

The "4% rule" is one of the most repeated pieces of retirement advice on the internet. Withdraw 4% of your portfolio in year one, adjust for inflation each year, and your money should last 30 years. Simple. Clean. Easy to remember.

Also, not necessarily true for your situation.

The rule comes from [the Trinity Study](https://en.wikipedia.org/wiki/Trinity_study), a 1998 paper analyzing historical stock and bond returns over 30-year periods. That's the first problem: 30 years. If you plan to retire at 45, you need 45–50 years of runway, and the math changes significantly. The study used a specific stock/bond mix. It didn't account for Social Security, part-time income, or the well-documented shift in spending patterns as people age.

What the 4% rule gives you is a useful baseline derived from a specific, simplified historical analysis. What most people actually need is to know whether their specific situation holds up — their actual portfolio size, their actual expected spending, their actual retirement timeline.

That's what **cFIREsim** does.

## What cFIREsim Does That Simple Calculators Can't

cFIREsim (the "c" stands for "collaborative") is a browser-based retirement portfolio simulator built iteratively with input from the FIRE — Financial Independence, Retire Early — community. It takes your actual inputs and runs them against every historical market sequence in [Robert Shiller's long-run dataset](http://www.econ.yale.edu/~shiller/data.htm), which covers US equity returns, bond returns, and CPI inflation going back to 1871.

The output isn't a single reassuring number. It's a **success rate**: the percentage of historical 30-year (or 40-year, or 50-year) periods where your portfolio survived without hitting zero. You can also see which specific historical periods failed, and why.

Set a 3.5% withdrawal rate on a 60/40 portfolio for 40 years and cFIREsim might show you a 96% historical success rate. Push to 5% and you might see 73% — meaning roughly one in four historical scenarios leads to running out of money. The difference between knowing "the 4% rule says I'm fine" and knowing "my specific plan fails in 27% of historical scenarios" is the difference between a heuristic and an actual analysis.

Running your plan against 150 years of history tests it against periods that actually happened:

- The Great Depression (1929–1933), with equity losses exceeding 80%
- The stagflationary 1970s, where inflation eroded purchasing power while returns stayed flat
- The "lost decade" of 2000–2009, with two major crashes inside ten years
- Extended bull markets where even poor withdrawal strategies succeeded

The sequence of returns risk — the danger that a crash early in retirement can permanently damage a portfolio that a later crash would leave intact — becomes concrete when you see it in actual historical scenarios.

## No Account, No Barrier

cFIREsim is fully free and requires no registration. Visit [cfiresim.com](https://cfiresim.com), enter your numbers, and run the simulation. The complete tool — historical analysis, Monte Carlo mode, all configuration options — works without signup.

This matters for retirement planning specifically. Your simulation inputs are financially sensitive: portfolio value, expected annual spending, retirement age. Tools that require an account tie that information to your identity and store it on their servers. cFIREsim processes everything in your browser. Your financial inputs don't leave your device.

There's an optional account feature for saving simulation scenarios across sessions, but the core simulator works entirely without it. This puts cFIREsim squarely in the category of privacy-friendly no-login tools — the same category as [FICalc](/tool/ficalc-app) for FIRE calculations and [The Measure of a Plan](/tool/themeasureofaplan-com) for financial planning templates.

## Configuration That Actually Matches Reality

The depth of configuration is where cFIREsim separates itself from a basic compound interest calculator. The core inputs are portfolio value, annual spending, and retirement length. But the tool goes further.

**Withdrawal strategies.** The standard 4% rule uses "constant dollar" — a fixed inflation-adjusted amount every year. Real retirees rarely spend that way. cFIREsim supports:

- **Constant dollar** — the classic rule; spend the same inflation-adjusted amount every year
- **Constant percentage** — spend a fixed percentage of your remaining portfolio; spending fluctuates with portfolio value
- **Variable Percentage Withdrawal (VPW)** — spend more in good markets, less in bad ones, based on your time horizon
- **Guyton-Klinger guardrails** — maintain your target withdrawal unless the portfolio crosses defined thresholds, then cut or increase accordingly
- **Percent of remaining portfolio** — divide the portfolio by years remaining each year

Switching from constant dollar to a variable strategy often dramatically improves historical success rates. The reason: constant dollar spending keeps withdrawing the same amount into a crash, forcing you to sell more shares at depressed prices. Adaptive strategies reduce spending when the market is down, giving the portfolio time to recover.

**Income sources.** Social Security, pensions, rental income, part-time work. You can add income streams that start at specified years — for example, $24,000/year in Social Security income beginning at year 20 of retirement. For early retirees with a gap before government benefits, this is a critical variable. A portfolio that fails without Social Security might show 95%+ success once you account for income that starts at age 70.

**Spending adjustments.** Research on actual retiree spending shows it tends to decrease in later years. You can model a spending reduction after a certain age — higher spending in active early years, lower in later years.

**Asset allocation and glide paths.** Set your stock/bond/cash mix, and optionally configure a glide path that gradually shifts allocation over time.

## Monte Carlo vs. Historical Analysis

cFIREsim offers two simulation modes, and understanding the difference matters.

| Mode | Basis | Scenarios | Best For |
|------|-------|-----------|----------|
| Historical | Actual market sequences since 1871 | ~100–130 periods | Understanding real worst-cases |
| Monte Carlo | Randomized sequences from historical statistics | 5,000+ scenarios | Exploring low-probability tail risks |

Historical mode is literal: it tests your plan against every overlapping period in the dataset. The scenarios are real. The crashes and booms actually happened.

Monte Carlo generates thousands of randomized return sequences using statistics derived from the historical data. It can surface risks that didn't occur historically but are statistically plausible — deeper or longer downturns, different correlation patterns between stocks and bonds.

Running both modes for the same scenario and comparing results tells you something useful: if Monte Carlo shows a noticeably lower success rate than historical, your plan may be sensitive to sequences worse than anything we've seen. If they're close, your plan is robust across a wider range of possible futures.

## How It Compares to FICalc

[FICalc](/tool/ficalc-app) is another no-login FIRE simulator and worth addressing directly, since the two tools serve an overlapping audience. FICalc is cleaner and faster for a basic withdrawal rate check — enter portfolio, spending, and years, get a clear visual result.

cFIREsim goes deeper on configuration. The comparison isn't about quality; it's about what question you're trying to answer.

> Use FICalc to quickly test a withdrawal rate and see a clean historical pass/fail breakdown.
>
> Use cFIREsim when you need to model Social Security income phases, compare withdrawal strategies head-to-head, run Monte Carlo alongside historical analysis, or account for a spending pattern that changes over time.

For most people starting to think about retirement simulation, FICalc is the right first tool. Once you want to stress-test assumptions or model more complex income structures, cFIREsim has the configuration depth you need.

## Open Source, Verified by the Community

cFIREsim is open source. The code is publicly available, which means you can verify exactly what the simulator is doing — what dataset it uses, how it defines "success," what assumptions are built into each withdrawal strategy.

This matters for retirement planning tools specifically. When a simulator tells you your plan has an 89% success rate, that number is only useful if you understand what it means. What counts as success? What data powers the simulation? A proprietary tool asks you to trust its output. An open-source tool lets you check.

The tool has been discussed extensively in FIRE communities over many years — on Reddit's r/financialindependence, the Bogleheads forums, and similar spaces. That sustained community engagement has validated the methodology and surfaced edge cases. The feature set reflects real user needs over time.

## Getting Started

Visit [cfiresim.com](https://cfiresim.com) and begin with a minimal simulation:

1. Set **Portfolio** to your current or projected retirement savings
2. Set **Spending** to expected annual retirement spending in today's dollars
3. Set **Retirement Length** to how many years you expect to be retired
4. Click **Run**

The first result gives you a baseline success rate and a chart showing which historical entry points failed. From there, test one variable at a time: lower spending by 10% and watch the success rate change; add $18,000/year in Social Security starting at year 15; switch from constant dollar to variable percentage withdrawal.

Each change shows you exactly how sensitive your outcome is to that specific assumption. That sensitivity analysis is the real value — not a single percentage, but an understanding of which variables in your plan actually matter.

For a reality check on your numbers before running retirement simulations, [Omni Calculator](/tool/omnicalculator-com) covers compound growth, savings rates, and portfolio projections over your accumulation years.

Retirement planning has historically required expensive software, a financial advisor, or willingness to build sophisticated spreadsheets from scratch. cFIREsim puts a genuinely rigorous simulation into a browser tab, free and without registration, backed by 150 years of real market data.

The question worth asking isn't whether your plan looks comfortable in a spreadsheet. It's whether it survives the 1970s.
