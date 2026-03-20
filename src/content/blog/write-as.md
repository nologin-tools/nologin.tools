---
title: "Write.as: Publish to the Web Without Giving Anyone Your Email"
description: "Write.as lets you publish anything to the web instantly — no account, no tracking, no friction. Just open the editor and start writing."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["tools", "review", "writing", "privacy"]
featured: false
heroImageQuery: "minimal writing desk notebook pen"
---

![Hero image](/blog/images/write-as/hero.jpg)

Most publishing platforms start the same way: an email field, a password field, and a Terms of Service checkbox you'll never read. You haven't written a word yet, and already someone is building a profile on you.

Write.as skips all of that. Open the site, start typing, hit publish. You get a permanent URL. That's it.

## What Write.as Actually Does

Write.as is a minimalist writing and publishing platform built around a single premise: your words matter more than your identity. When you land on the site, you're immediately in an editor — a clean, full-screen textarea with no distractions, no sidebars, no pop-ups asking you to subscribe to a newsletter.

Write what you want. Then click "Publish." The platform generates a unique URL like `write.as/abc123xyz` and that post is live immediately, accessible to anyone with the link. You don't create an account. You don't verify an email. You just write.

Behind the scenes, Write.as stores an "owner token" locally in your browser so you can edit or delete the post later. If you want to claim permanent ownership across multiple devices, you can optionally create an account — but it's never required for the core use case.

The interface itself is almost aggressively simple. Markdown is supported. The editor shows you clean, readable text. There's no word processor toolbar, no formatting ribbon, no ribbon of emoji reactions. For writers who find most web editors visually exhausting, this restraint is the product.

## The Privacy-First Architecture

Most content platforms are built to know as much about you as possible — which posts you read, how long you spent on each, what you clicked next. That data is the business model.

Write.as was designed with the opposite assumption. The platform collects minimal data, runs no ad tracking, and doesn't require any personally identifying information to publish. This isn't a marketing claim bolted onto a normal ad platform — it's baked into the technical architecture from the start.

The open source engine behind Write.as is called **WriteFreely**, and it's available on GitHub at [github.com/writefreely/writefreely](https://github.com/writefreely/writefreely). This means:

- Anyone can inspect exactly how the software works
- Organizations and individuals can self-host their own instance
- The platform's privacy promises aren't just policies — they're verifiable code

Self-hosting WriteFreely is increasingly popular with journalism collectives, academic groups, and privacy-conscious communities who want federated, decentralized publishing without depending on any single company's servers.

> "I want a writing tool that doesn't want anything from me." — a recurring sentiment in the communities that gravitate toward Write.as

That sentence captures why this tool has found an audience that generic blogging platforms have never managed to serve well.

## How It Compares to Other No-Login Writing Tools

Several writing tools in our directory work without signup, but they serve different purposes. Here's how Write.as sits alongside them:

| Tool | Primary use | Login required? | Publish to web? |
|------|-------------|-----------------|-----------------|
| [ZenPen](/tool/zenpen-io) | Distraction-free drafting | No | No — local only |
| [Dillinger](/tool/dillinger-io) | Markdown editing | No | Export only |
| [StackEdit](/tool/stackedit-io) | Markdown with sync | Optional | No direct URL |
| [Hemingway Editor](/tool/hemingwayapp-com) | Style & readability check | No | No |
| Write.as | Anonymous publishing | No | Yes — instant URL |

The key distinction: every other no-login writing tool listed above is essentially a local drafting environment. Write.as is the only one where the natural endpoint of your work is a live URL on the public web, reachable by anyone, created without any account.

This makes it useful for a specific set of tasks that other tools simply don't handle:

- Sharing a draft with a collaborator without using Google Docs (which requires sign-in to edit)
- Publishing a public statement or open letter without attaching your name to a platform account
- Creating a quick, linkable reference document for a meeting or conversation
- Writing something you want to share exactly once, then forget

## Freemium Without the Dark Patterns

Write.as has a paid tier. It adds features like custom domains, multiple named blogs, team accounts, and analytics. These are legitimately useful things for people who want to build a long-term online presence.

But the paid tier is clearly an upsell to people who have already gotten value from the free tier — not a restriction designed to make the free tier feel broken. The core loop (open editor → write → publish → get a URL) is completely free and fully functional without any account at all.

This is a meaningful distinction. Many freemium tools design their free tier to feel frustrating by design, using limitations to push you toward a subscription. Write.as's free tier does exactly what it advertises. If you never create an account, you still get a fully functional publishing tool.

Compare this to the experience of trying to use most AI writing assistants — tools like [QuillBot](/tool/quillbot-com) give you a functional free tier but prompt you to upgrade constantly. Write.as doesn't interrupt the writing experience with subscription nudges.

## Who Actually Uses This

Write.as has found an audience across several communities that don't overlap much in other spaces:

**Privacy advocates** use it for publishing without building a digital identity. The combination of no required account and minimal data collection makes it one of the few platforms that matches the privacy community's stated values.

**Journalists and whistleblowers** have used WriteFreely-based instances for publishing documents and statements when anonymity matters. The self-hosting option means the publication doesn't depend on Write.as the company.

**Developers** use it for quick technical write-ups, RFC-style documents, or internal announcements that need a shareable link without setting up a full CMS.

**Writers exploring ideas** use it as a pressure-free space. When there's no account, no followers, no analytics, and no comments — the feedback loop of social validation disappears entirely. That's either liberating or terrifying, depending on your relationship with an audience.

**Open source communities** run self-hosted WriteFreely instances for community blogs and collective journals, with federated following via ActivityPub support built into the platform.

## ActivityPub and the Federated Web

One feature worth calling out: Write.as supports [ActivityPub](https://www.w3.org/TR/activitypub/), the open standard that powers Mastodon, Pixelfed, and other decentralized social platforms. This means that if you create an account on Write.as (or on any self-hosted WriteFreely instance), your blog becomes followable from Mastodon and other federated platforms.

Your readers can follow your Write.as blog from their Mastodon account. New posts appear in their federated timeline. No algorithmic feed. No engagement optimization. Just posts arriving in chronological order to the people who chose to follow you.

This federated design reflects a broader philosophy: your content should exist on the open web, not locked inside any platform's walled garden.

## Getting Started

There's no setup guide needed. Go to [write.as](https://write.as), and the editor is right there. Start writing. When you're ready, click Publish. Save your post URL and owner token somewhere safe if you want to be able to edit it later.

If you find yourself using it regularly, creating a free account is worth considering — it lets you manage all your posts from one place and gives you a permanent blog URL. But you can publish dozens of posts before you ever need to make that decision.

For anyone building their own publishing infrastructure, the WriteFreely repository includes Docker support and comprehensive documentation for self-hosting. The software is actively maintained and used by communities around the world.

The web has accumulated a lot of weight. Sign-up flows, tracking pixels, cookie consent banners, algorithmic feeds. Write.as is a reminder that publishing on the web was always simpler than the ecosystem around it suggests — and that it can still be that simple, without compromising anything that matters.
