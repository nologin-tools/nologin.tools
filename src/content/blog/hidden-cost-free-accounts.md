---
title: "The Hidden Cost of Free Accounts: What You Trade"
description: "Free accounts aren't free — Meta earns $233 per US user annually. Here's what actually gets collected, how it's used, and what you can do about it."
publishedAt: 2026-03-14
author: "nologin.tools"
tags: ["privacy", "analysis", "tools"]
featured: false
heroImageQuery: "digital privacy data collection surveillance"
---

Meta earned approximately $233 from each US and Canadian user in 2024. Not from subscriptions. From selling access to behavioral profiles built from everything you typed, clicked, hovered over, and ignored while using their "free" products.

That number comes straight from their quarterly earnings filings. It's not a privacy advocate's estimate. It's what the advertising market thinks your attention and behavioral data are worth — and it's gone up every year.

So when a service is free, you're not getting a deal. You're the deal.

## What Actually Gets Collected When You Sign Up

The email address is the least of it. The moment you create an account — and often before, through tracking pixels and third-party scripts — a company starts building a profile.

The explicit stuff is obvious: name, email, birthday, location. But the behavioral data is where the real value lives. Every scroll, pause, search query, and piece of content you linger on gets logged and fed into models that infer things you never told anyone. Whether you're anxious. Whether you're pregnant. Whether you're about to buy a car.

Technical fingerprinting runs underneath all of this. Browser type, screen resolution, installed fonts, graphics card behavior — combined, these create a near-unique identifier that follows you across sites even when you're not logged in and even if you clear your cookies. The EFF's [Cover Your Tracks](https://coveryourtracks.eff.org) tool ([also available without signup](/tool/coveryourtracks-eff-org)) can show you exactly how unique your browser looks to the sites you visit. Most people are surprised.

The cross-site dimension is what makes it especially hard to escape. "Sign in with Google" and "Sign in with Facebook" buttons on third-party sites report back to Google and Meta even when you don't click them. The login widget loads, and the tracking happens regardless. You didn't sign up for anything on that website, but your visit is still recorded.

## The Real-Time Auction Behind Every Page Load

When you load a webpage that runs programmatic advertising, an auction takes place in roughly 100 milliseconds. Your profile — inferred demographics, purchase intent signals, browsing history — gets broadcast to hundreds of potential advertisers. They bid. The winner serves an ad. You never see any of this, but your data has been shared with every bidder in that auction, not just the winner.

This is called real-time bidding, and it's the foundation of the ad economy. The privacy implications aren't incidental — they're structural. Sharing your data with hundreds of parties simultaneously is how the system works.

Google's advertising division pulled in roughly $237 billion in 2024. Alphabet doesn't sell ads on name recognition alone; it sells targeting that's only possible because it tracks behavior across Search, Gmail, YouTube, Maps, Android, and the Chrome browser simultaneously. A 2022 Vanderbilt University study estimated that idle Android phones send data to Google servers approximately 14 times per hour.

## The Breach Problem Is Larger Than You Think

Free accounts accumulate. Over time, most people have dozens of them — forum registrations, trial signups, apps downloaded and forgotten. Each one is a potential breach target.

Troy Hunt's [Have I Been Pwned](https://haveibeenpwned.com) database ([accessible without login](/tool/haveibeenpwned-com)) had tracked over 14 billion compromised accounts by early 2025. That number represents thousands of individual breaches, from small forums to major platforms. Chances are, your email address is in there multiple times.

The real catastrophe isn't the individual breaches — it's what happens after. Data brokers aggregate records from different sources, merge them, and sell comprehensive profiles. The 2024 National Public Data breach exposed approximately 2.9 billion records including Social Security numbers and addresses. That company was a data broker. It had collected all that information specifically because people's data leaks from free services constantly, and there's a market for buying it, cleaning it, and reselling it.

IBM's 2024 Cost of a Data Breach Report put the global average breach cost at $4.88 million per incident. But that's the cost to the company. For the individuals whose data gets exposed, the cost is borne differently: in phishing attempts, in credential stuffing attacks against other accounts, in identity fraud years later.

> "The data doesn't disappear after a breach — it circulates. A set of credentials exposed in 2016 may still be used in active credential stuffing campaigns in 2026."

## What Gets Done With the Data You Didn't Think Mattered

The most alarming documented misuse cases aren't hypothetical. They've been investigated, fined, and in some cases admitted.

Meta's advertising pixel was found embedded on at least 33 of the top 100 US hospital websites, sending patient health inquiry data — searches for specific conditions, appointment booking interactions — back to Facebook's ad targeting systems. This was reported by The Markup in 2022. The data was never supposed to leave the hospital's system.

BetterHelp, a mental health therapy platform, paid a $7.8 million FTC settlement in 2023 for sharing users' sensitive mental health information with Facebook and Snapchat for advertising targeting — despite explicit promises not to share health data.

Twitter (pre-acquisition) settled for $150 million in 2023 over a specific pattern: it had collected phone numbers for two-factor authentication security, then used those same numbers for ad targeting. Phone numbers given for security ended up being used for revenue.

Google paid a $391 million multi-state settlement in 2022 after an Associated Press investigation found it tracked users' precise locations even when they had explicitly disabled "Location History." The setting said one thing. The behavior did another.

None of these are edge cases. They're documented enforcement actions by federal regulators against some of the largest technology companies in the world.

## Why GDPR Helps (and Where It Doesn't)

The EU's General Data Protection Regulation gives European users meaningful rights: access to their data, deletion, portability, and the requirement that companies demonstrate a legal basis for processing personal data. GDPR fines can reach 4% of global annual revenue — which is why Meta has paid over €1.2 billion in GDPR fines since 2018.

California's CCPA gives similar rights to California residents. If you're a California resident, you can technically tell data brokers to delete your records. The problem: a Consumer Reports study found that brokers often re-acquired deleted data within months through other sources. Deletion requests work once. The data economy re-fills gaps automatically.

The US still has no comprehensive federal privacy law as of 2026. Protections vary by state, sector, and company goodwill. For most users outside California and the EU, legal protections are thin.

## The Comparison You Should Actually Be Making

| Tool | Requires account | Data collected | Revenue model |
|---|---|---|---|
| Google Docs | Yes | Document content, behavior, metadata | Ad targeting |
| Microsoft 365 Free | Yes | Usage telemetry, content scanning | Upsell + data |
| Photopea (no login) | No | Minimal session data | Display ads (non-targeted) |
| Excalidraw (no login) | No | Nothing stored server-side | Open source / donations |
| PDF24 Tools (no login) | No | File contents (processed, not retained) | Ads |

[Photopea](/tool/photopea-com) handles PSD files at the level of a desktop application. [Excalidraw](/tool/excalidraw-com) is a full collaborative whiteboard. Neither requires an account. Neither builds a behavioral profile on you. The capability gap between these and their account-required equivalents has narrowed dramatically.

The comparison isn't always in favor of no-login tools — Google Docs has features Photopea doesn't. But for a large portion of everyday tasks, the feature difference is either negligible or nonexistent, and the tradeoff shifts entirely.

## What You Can Actually Do

Using no-login tools for tasks that don't need persistence is the most direct approach. For quick image editing, format conversion, PDF tools, whiteboard sketching, grammar checking, and dozens of other use cases, tools that work without signup exist and work well. [nologin.tools](/tool/nologin-tools) maintains a curated directory of verified options.

For cases where you genuinely need an account, [temporary email services](/tool/temp-mail-org) let you create a throwaway address for signup purposes, preventing your real inbox from becoming a data point linked across dozens of services. This doesn't help with behavioral tracking after login, but it limits the aggregation of your real identity across services.

Browser hygiene matters. Separate browsers for separate contexts, aggressive content blocking, and understanding what your browser exposes are all meaningful. [BrowserLeaks](/tool/browserleaks-com) can show you what fingerprinting data is visible from your current setup.

The tool that launched on Hacker News recently — Ichinichi, a one-note-per-day app that's E2E encrypted and local-first — represents a broader architectural direction worth paying attention to. Local-first applications that process data on your device rather than in the cloud avoid the server-side data accumulation problem entirely. The trend toward local-first, zero-knowledge, and privacy-by-design tools is accelerating. Not because of moral victory, but because enough users have started asking for it that there's a market for it.

## The Shift That's Already Happening

Regulatory pressure is increasing. Enforcement actions are getting larger. GDPR fines have crossed the billion-euro mark. The FTC under recent administrations has been more active on data practices than in the previous decade. State-level legislation is multiplying. The legal cost of data misuse is rising, which changes the calculation for companies that have treated user data as pure upside.

The technical alternatives are better than they've ever been. Privacy-preserving tools for nearly every common workflow now exist, often built on open-source foundations that make them trustworthy in ways that proprietary services can't match.

The default, though, is still surveillance. Most people will continue creating accounts, accepting terms they don't read, and unknowingly funding behavioral advertising ecosystems with the record of their daily digital lives. Changing that default — one tool swap at a time — is not a perfect solution, but it's a real one.

The question isn't whether you can go completely account-free. You probably can't. The question is which accounts are actually necessary, and which ones you signed up for because it was faster than looking for an alternative.
