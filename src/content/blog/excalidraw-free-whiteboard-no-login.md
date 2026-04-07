---
title: "Excalidraw: Free Online Whiteboard, No Login Required"
description: "Excalidraw is a free, open-source whiteboard tool that works in your browser without signup. Draw diagrams with a hand-drawn look, collaborate privately."
publishedAt: 2026-04-07
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source", "browser"]
featured: false
heroImageQuery: "whiteboard sketching digital drawing hand-drawn"
---

![Hero image](/blog/images/excalidraw-free-whiteboard-no-login/hero.jpg)

Most whiteboard tools ask you to create an account before you draw your first line. Miro wants your email. FigJam wants your Figma account. Lucidchart puts a paywall after five shapes. And if you pay, they can see everything you draw.

[Excalidraw](https://excalidraw.com) opens to a blank canvas, ready to use. No signup. No login. No pop-up asking for your email address. Just a whiteboard.

That's the pitch, and after millions of users and years of active development, it still holds up.

## What Excalidraw Actually Does

Excalidraw is a browser-based drawing tool that renders everything in a hand-drawn style. Rectangles have slightly wobbly edges. Lines have that natural imprecision that makes diagrams feel like they came off a napkin rather than a slide deck.

This aesthetic is a deliberate choice, not a limitation. When you're sketching out an architecture diagram or explaining a concept to a team, the rough look signals "this is a draft, comment freely" better than a polished Keynote slide ever could. Engineering teams use it for system design interviews. Designers use it for wireframing before they open Figma. Teachers use it to explain concepts without the formality of a slide deck getting in the way.

The tool supports the usual suspects — rectangles, circles, arrows, lines, text, freehand drawing — plus images you can embed directly into the canvas. You can group objects, layer them, lock them, and align them with a grid. There's a color picker, stroke width selector, and fill options. Nothing is hidden behind a premium tier.

Export works without any account. You can save as PNG (transparent background optional), SVG, or copy to clipboard. The `.excalidraw` file format is plain JSON, which means your drawings are readable and recoverable even without the app — useful if the project ever goes offline.

## The Privacy Architecture

Here's what makes Excalidraw worth writing about specifically as a privacy-friendly tool: the collaboration model is end-to-end encrypted by default.

When you share a drawing with someone via the "Live collaboration" link, the room ID and encryption key are both embedded in the URL fragment (the `#` part of the URL). The fragment never gets sent to the server — it stays in the browser. Excalidraw's servers relay the drawing data between participants, but they receive only encrypted bytes. They cannot read what you've drawn.

This is a meaningful privacy guarantee. With tools like Miro or Notion, the platform has full access to your whiteboard content. With Excalidraw's collaboration mode, they don't. The [source code is on GitHub](https://github.com/excalidraw/excalidraw) under an MIT license, so anyone can verify this claim by reading it — no trust required.

For solo use, nothing leaves your browser at all. Drawings are saved in `localStorage` and stay on your device unless you explicitly export them.

> "Your data is end-to-end encrypted, meaning the Excalidraw server cannot read what you've drawn." — Excalidraw documentation

This is the same design principle you see in other privacy-respecting tools: the server handles transport, not content. The user holds the keys.

## Excalidraw vs. tldraw vs. Diagrams.net

The free, no-login whiteboard category has a few solid contenders. Here's how they stack up:

| | Excalidraw | tldraw | Diagrams.net |
|---|---|---|---|
| Login required | No | No | No |
| Collaboration | E2E encrypted | Yes | No (export only) |
| Style | Hand-drawn | Clean/vector | Technical/UML |
| Self-hostable | Yes | Yes | Yes |
| Export formats | PNG, SVG, JSON | PNG, SVG, JSON | PNG, SVG, PDF, XML |
| Open source | MIT | MIT | Apache 2.0 |

[tldraw](/tool/tldraw-com) is the closest competitor. It's also free, no-login, and open source. The main difference is aesthetic — tldraw uses clean vector shapes while Excalidraw commits hard to the hand-drawn look. If precision matters (say, a diagram going into a formal technical document), tldraw's cleaner rendering is easier to work with.

[Diagrams.net](/tool/app-diagrams-net) targets a different use case entirely. It has proper UML shapes, flowchart templates, network topology icons, and an XML-based format that integrates with Confluence and other enterprise tools. It's more powerful for structured diagramming, less good for freeform sketching.

Miro is the enterprise option — polished, genuinely full-featured, and $16+/month per seat after the free tier runs out. It requires an account, tracks usage, and has full access to everything you draw. For a small team doing occasional diagramming, that's a lot to pay for what Excalidraw gives you for free.

## Collaboration Without the Data Handover

The typical real-time collaboration product works like this: you create an account, your content lives on their servers, they can read it. That's a known trade-off, and for many products it's fine.

Excalidraw's model is different. Two people can edit the same canvas in real-time — cursors appear with names, changes propagate instantly — and the intermediary server is functionally blind to the content. The encryption key never touches the server, so even a subpoena wouldn't produce readable drawing data.

To start a collaboration session, click the person icon in the toolbar and share the link. Anyone with the link can join without creating an account. Sessions persist only as long as someone is connected. There's no persistent cloud room on the free tier.

This does mean there's no version history, no cloud sync across devices, and no way to return to a session days later without having exported the file. For ad-hoc sketching sessions, that's an acceptable trade-off. For ongoing team whiteboards, you'd want to export `.excalidraw` files to a shared folder regularly, or look at [Excalidraw+](https://plus.excalidraw.com) — the paid hosted version that adds persistent cloud storage, password-protected rooms, and scene backups.

The free version handles what most people actually need: whiteboard a concept with a colleague, export it, move on.

## Keyboard Shortcuts and the Power-User Experience

Excalidraw rewards learning the keyboard shortcuts. Once they're in your fingers, drawing becomes fast.

The shape shortcuts are single-key: `R` for rectangle, `E` for ellipse, `A` for arrow, `L` for line, `X` for freehand, `T` for text. `V` returns to the selection tool. `H` and `V` flip horizontally and vertically. `Ctrl+A` selects everything, `Ctrl+G` groups selected objects.

For sharing: `Ctrl+Shift+E` opens the export dialog, where you can copy to clipboard or download. `Ctrl+L` copies a shareable link to the clipboard directly.

Zooming: `Ctrl+scroll` zooms in and out, `Ctrl+Shift+H` fits the entire drawing on screen. The hand tool (`Space+drag`) pans the canvas without changing the selected tool.

These shortcuts make the gap between thinking and drawing very small. That immediacy is most of what makes Excalidraw good for quick diagrams — you're not hunting through menus while the idea is still fresh.

## The Open Source Ecosystem

One of Excalidraw's real strengths is what others have built on top of it. Because it's MIT-licensed and ships as an npm package, it's been embedded in a surprising number of tools.

[Excalideck](/tool/excalideck-com) turns Excalidraw drawings into presentation slides — the hand-drawn aesthetic in a slide format, no additional software needed. For technical talks where you want to show rough architecture diagrams without switching between tools, this is genuinely useful.

There are Obsidian plugins that let you draw Excalidraw diagrams inside your notes vault. VS Code extensions embed a canvas alongside your code. Several documentation tools and wikis have added Excalidraw integration, letting teams keep diagrams in the same place as the text they illustrate.

The library system deserves a mention. The community has contributed hundreds of pre-made shape collections — AWS architecture icons, Google Cloud infrastructure diagrams, mobile UI components, flowchart templates, database diagrams. They're installable from the library browser inside the app, no registration needed.

The project has accumulated well over 80,000 stars on GitHub, which puts it among the most widely adopted open-source drawing tools available. Active maintenance, a responsive issue tracker, and a healthy ecosystem of integrations are the result of years of consistent development.

## Who Should Use Excalidraw

If you're sketching architecture diagrams, Excalidraw is hard to beat. The hand-drawn style removes the pressure to make things look polished before the idea is solid, and the keyboard shortcuts let you think and draw at the same speed.

For UX wireframing at the lo-fi stage — before you open Figma or Sketch — Excalidraw works well. The rough aesthetic communicates "this is exploration" clearly, which tends to generate more honest feedback than a pixel-perfect mockup.

For educational contexts, teachers use it to draw diagrams during video calls, with students joining the shared canvas. The no-account-required model is significant here: you can't assume all students have or want to create accounts on yet another platform.

For anything requiring precise alignment, conditional formatting, or a diagram that goes into a formal specification document, use [Diagrams.net](/tool/app-diagrams-net) or a dedicated vector tool instead. Excalidraw's hand-drawn style is also its ceiling.

## Getting Started Without Any Setup

Go to [excalidraw.com](https://excalidraw.com). Start drawing. That's the whole onboarding process.

Your drawing auto-saves to `localStorage` as you work, so closing the tab and reopening it brings back your last canvas. For anything you want to keep long-term, use `Ctrl+Shift+E` to export — either as a `.excalidraw` file (to reopen and edit later) or as PNG/SVG (to share or embed).

For collaboration, click the person icon and share the room link. Your collaborators need nothing installed, no account, no download. The link is everything.

If you want to self-host — for a company intranet, a school network, or just because you want full control over where your drawings are stored — the Docker image is available and the self-hosting documentation is thorough. The MIT license means you can modify and run it however you like.

More privacy-respecting no-login tools are listed at [nologin.tools](/tool/nologin-tools) if you're building out a toolkit that skips account creation across the board.

The whiteboard tool category is one where the free, open-source, privacy-first option is genuinely the best option for most users. That doesn't happen often. Excalidraw earned it by treating user privacy and local ownership as features, not afterthoughts.
