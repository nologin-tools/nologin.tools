---
title: "Is Excalidraw Private? Free Online Whiteboard, No Login"
description: "Excalidraw encrypts collaboration with keys that never leave your browser. Learn how this free whiteboard keeps your diagrams private by design."
publishedAt: 2026-04-08
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source"]
featured: false
heroImageQuery: "privacy encryption whiteboard digital security"
---

Think about the last diagram you drew in a collaborative online whiteboard. Maybe it was an architecture sketch for a product you haven't announced. A process map that shows how your team actually operates. A competitor analysis. A fundraising timeline.

That content lives somewhere. On most whiteboard platforms, it lives on their servers — readable by their employees, accessible to legal requests, subject to whatever the privacy policy says. Most people don't consider this until they do.

Excalidraw handles this differently. When you share a drawing via collaboration link, your content is encrypted before it leaves your browser. The Excalidraw servers relay data between participants but cannot read what those bytes contain. The encryption key never touches their infrastructure.

That's a meaningful design choice for a free web tool. Here's what it actually means and when it matters.

## What Most Whiteboard Tools Do With Your Data

Popular whiteboard tools operate as cloud services. Your content lives on their servers, and the platform has read access to it. That's not necessarily malicious — it's just how cloud software works. But it has practical consequences.

Miro stores your boards on their infrastructure and their terms of service grant them rights to use content to improve the product. FigJam is part of Figma's enterprise suite, subject to Figma's data handling and enterprise security reviews. Lucidchart stores your diagrams in the cloud; data residency options are an enterprise-tier feature.

The privacy policies aren't hidden. Nobody reads them, but the situation they describe is: everything you draw is stored by a company that can see it. For a quick sketch this is probably fine. For a pre-launch product roadmap or a healthcare workflow diagram, the calculus changes.

The traditional alternative to cloud whiteboards was "tools that store locally but can't collaborate." Excalidraw broke that trade-off.

## How Excalidraw's Privacy Architecture Actually Works

When you start a collaboration session in [Excalidraw](https://excalidraw.com), the app generates two things: a random room ID and a random encryption key. Both get embedded into the URL after the `#` symbol.

This placement is significant. Browsers never send the URL fragment to servers. When your browser loads `https://excalidraw.com/#room=abc123,encryptionKey456`, it sends a GET request to `excalidraw.com/` with no room or key information included. The server receives only the base request — it never sees the fragment.

Drawing data is encrypted in the browser using the [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) before transmission. The server stores and forwards only encrypted ciphertext. Without the key — which it doesn't have and can't obtain — the data is unreadable to Excalidraw's infrastructure.

This is the same architecture used by [Yopass](/tool/yopass-se) for encrypted secret sharing and [hat.sh](/tool/hat-sh) for in-browser file encryption: the server handles transport, the user holds the keys. It's a principled approach, not an accident of implementation.

For solo use, the situation is even simpler. Excalidraw stores your current drawing in browser `localStorage`. Nothing is uploaded anywhere unless you explicitly start a collaboration session or export a file. If you're sketching alone, your drawing doesn't leave your machine.

## Verifying the Privacy Claims

A privacy claim from a closed-source tool requires trust. Anyone can say "we don't read your data."

Excalidraw is [MIT-licensed and publicly available on GitHub](https://github.com/excalidraw/excalidraw). The encryption implementation is in the source code, readable by anyone with a browser and a few minutes. The collaboration session code, the key generation, and the message passing can all be audited. No trust required — the code is the proof.

The project has accumulated over 80,000 stars on GitHub. That means a large number of developers have looked at the code over several years of active development. The issue tracker is public. If there were a privacy problem in the implementation, it would be findable. That level of scrutiny is a meaningful quality signal.

This is the meaningful gap between "we value your privacy" (marketing language) and "here's the code that implements privacy" (verifiable property).

## Collaboration Without Accounts — and Without Compromise

The typical assumption about privacy-respecting software is that it trades features for protection. Real-time collaboration usually requires accounts, which requires handing over an email address, which kicks off a relationship with a platform that has access to your content.

Excalidraw's collaboration model breaks this assumption. Two people can edit the same canvas in real time — cursors appear with names, changes propagate immediately — without either person having an account. The encrypted link is the access mechanism. Share it, and your collaborator joins. Don't share it, and they can't.

For use cases where account creation is a barrier — getting feedback from a client who doesn't want yet another SaaS login, or conducting a technical interview where you want the candidate focused on the problem, not a signup flow — this matters practically.

Sessions are ephemeral by default. When the last person closes the tab, the session ends. There's no persistent cloud room to return to unless you export the `.excalidraw` file. For a one-off brainstorm or a single working session, that's fine. For ongoing team work, regular exports to a shared folder is the workflow.

## Excalidraw vs. the Alternatives: A Privacy-First Comparison

When the question is specifically about data privacy, the comparison isn't features vs. features — it's data models.

| | Excalidraw | Miro | FigJam | tldraw |
|---|---|---|---|---|
| Server reads content | No (E2E encrypted) | Yes | Yes | No |
| Login required | No | Yes | Yes | No |
| Self-hostable | Yes (MIT) | No | No | Yes |
| Source code visible | Yes | No | No | Yes |
| Collaboration E2E encrypted | Yes | No | No | Partial |

[tldraw](/tool/tldraw-com) is the closest competitor on privacy. It's also open source, also no login required, and has a clean collaborative experience. The main difference is the encryption model — tldraw's architecture doesn't currently use the same URL-fragment approach for end-to-end encryption during collaboration. Both tools are private compared to Miro; Excalidraw's architecture makes the server functionally blind to content even during live sessions.

[Diagrams.net](/tool/app-diagrams-net) is another no-login option worth noting on privacy grounds. It saves locally by default and doesn't require an account. But it doesn't offer real-time collaboration in the same way, so it serves a different workflow.

Miro is powerful and polished. If your team is already paying for it and privacy isn't a concern for your use case, there's no compelling reason to switch. But if you're drawing anything that shouldn't be readable by a third party, the architecture difference is real.

## The Self-Hosting Option

If "the collaboration server is E2E blind" still involves too much trust in a third-party operator — because you're in a regulated industry, or your organization's policy requires tools to run on company infrastructure — Excalidraw is self-hostable.

The [official Docker image](https://hub.docker.com/r/excalidraw/excalidraw) makes deployment straightforward. You run Excalidraw on your own server, no Excalidraw infrastructure involved. All traffic routes through your server, in your jurisdiction, behind your firewall.

This option exists because the MIT license explicitly permits it. Organizations in healthcare, finance, and government have deployed Excalidraw on internal networks precisely because the alternative — a SaaS whiteboard that stores diagrams on external servers — creates compliance exposure.

For individuals and small teams, the hosted version is fine. But the self-hosting path matters for situations where the privacy architecture needs to be entirely under your control.

## Where the Privacy Model Has Limits

Accuracy matters here. Excalidraw's privacy model is strong in specific, well-defined ways. It has limits worth knowing.

If you export a PNG and upload it to Slack, Google Drive, or send it by email, Excalidraw's guarantees end at the export. The platforms you share through have normal access to those files.

Excalidraw+ — the paid hosted version that adds persistent cloud storage and password-protected rooms — is a different product with a different storage model. The E2E encryption for live collaboration still applies, but persistent storage involves their servers in ways the free ephemeral model doesn't.

Browser `localStorage` is generally not encrypted at the OS level. If someone has physical access to your machine and knows where to look, they could extract a drawing from browser storage. This is a remote concern for most people but worth knowing if you're in a higher-threat environment.

Metadata isn't encrypted. Excalidraw knows when you access the site, how long sessions last, and which IP addresses participated. That's standard web server logging, present regardless of content encryption. It's not specific to Excalidraw — all web tools have it.

None of these are reasons to avoid the tool. They're the accurate picture of what "private" means in this context.

## Starting Out

Go to [excalidraw.com](https://excalidraw.com). Start drawing. No signup. No install.

Your drawing auto-saves to `localStorage` as you work. Closing the tab and reopening it recovers your last canvas. For permanent storage, export as `.excalidraw` (a JSON file you can reopen and edit later), PNG, or SVG.

For collaboration, click the person icon in the toolbar and share the generated link. Your collaborator needs nothing installed, no account, no download. The link is the session.

If you want to explore more no-login, privacy-respecting tools beyond whiteboards, [nologin.tools](/tool/nologin-tools) collects tools across categories that share the same design philosophy — no account required, minimal data collection.

The interesting thing about Excalidraw isn't that it's free. It's that the people who built it chose, by design, to make the server blind to the content. Real-time collaboration where the intermediary can't read the data was considered an engineering problem. They solved it, and then open-sourced the solution. As more whiteboard tools push toward mandatory accounts and enterprise licensing, that choice looks more distinctive with every passing year.
