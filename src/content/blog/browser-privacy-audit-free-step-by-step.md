---
title: "How to Audit Your Browser Privacy for Free — No Account Needed"
description: "A step-by-step guide to testing what your browser exposes using free tools that require no sign up. Check for IP leaks, DNS leaks, and fingerprint uniqueness."
publishedAt: 2026-04-15
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "tools"]
featured: false
heroImageQuery: "browser privacy security audit magnifying glass"
---

Most privacy advice skips the part where you check what's actually happening. Settings changes and extensions are easy to recommend. What's harder — and more useful — is running specific tests to see what your browser is actually exposing right now, before changing anything.

This is that guide. Ten minutes, no account creation, no software to install. Just a set of free browser tools that show you exactly what's leaking, with specific numbers you can act on.

## What You're Testing For

Your browser exposes data through four main channels, and they each require a different test.

**IP address** — the obvious one. Every connection you make reveals your IP. But WebRTC (the browser API that powers in-browser video calls) can reveal your real IP even through a VPN, because it operates at a level the VPN doesn't intercept.

**DNS queries** — every domain you visit triggers a DNS lookup that goes somewhere. By default, it goes to your ISP's resolver, unencrypted. Your ISP logs every domain you query. A VPN should route these through its own resolver — but often doesn't, leaving a separate record of your browsing outside the tunnel.

**Browser fingerprint** — your combination of GPU, installed fonts, timezone, screen resolution, hardware concurrency, and dozens of other attributes forms a profile unique enough to track you across sites without cookies. The EFF's [Panopticlick research](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) found 83.6% of browsers have a unique fingerprint, rising to 94.2% when browser plugins are included. Incognito mode does nothing about this.

**Third-party scripts** — ad networks and data brokers place tracking scripts on most commercial websites. These scripts run in your browser, read your fingerprint, and report back to their servers. Blocking them is separate from fixing the leaks above.

The four free tools below test each of these. Run them before making any changes — you want a baseline.

## Step 1: Get Your Fingerprint Score With Cover Your Tracks

[Cover Your Tracks](/tool/coveryourtracks-eff-org) is built by the Electronic Frontier Foundation and it's the right starting point because it gives a single, clear verdict: either your browser blends in or it doesn't.

Click "Test Your Browser" and wait about ten seconds. The result falls into one of three categories:

- **Strong protection** — your fingerprint is common enough to blend with many other users
- **Some protection** — partially randomized, but still identifiable in some ways
- **Unique fingerprint** — your browser can be identified and tracked across sites even without cookies

Most people get "unique fingerprint" the first time. That's not a failure state — it's a baseline you can improve on. The tool also shows an entropy breakdown per attribute: how many bits of identifying information each characteristic contributes. Screen resolution typically adds 3–4 bits. The User-Agent string adds around 10 bits. Combined, a unique fingerprint often carries 18–22 bits of entropy — meaning roughly 1 in 250,000 browsers shares the same combination.

Write down your result before making any changes. You'll want to compare after.

## Step 2: Check for IP and WebRTC Leaks With IPLeak

[IPLeak.net](/tool/ipleak-net) loads fast and checks three things at once: your visible IP address, any IPs exposed via WebRTC, and your DNS servers.

The specific thing to watch: does the WebRTC section show a different IP than your main IP? If you're running a VPN and WebRTC shows your real ISP IP — not your VPN's IP — you have a confirmed WebRTC leak. Websites can run this same check silently in the background, no user interaction required.

The DNS section shows which resolvers are handling your queries. If you see IP addresses belonging to your ISP or telecom company, those queries are going outside your VPN tunnel. Your ISP can see every domain you visit even though the content stays encrypted.

If you're not using a VPN, both the IP and DNS sections will show your ISP's details — expected, but worth understanding. You're not anonymous to your ISP.

## Step 3: Verify Your DNS Configuration

[DNS Leak Test](/tool/dnsleaktest-com) focuses specifically on DNS and runs a more thorough check than IPLeak. Use the "Extended Test" option — it makes multiple DNS requests to unique subdomains and captures every resolver that responds.

The results show each DNS server's IP address and its associated organization. Clean result: only your VPN provider's servers appear. DNS leak: your ISP's servers appear alongside or instead of your VPN provider's. Severe leak: only your ISP's servers appear despite a VPN being active, meaning the VPN isn't routing DNS traffic at all.

Here's a comparison of what each free privacy test tool covers:

| Tool | IP Leak | WebRTC Leak | DNS Leak | Fingerprint | No Sign Up |
|------|---------|-------------|----------|-------------|------------|
| [Cover Your Tracks](/tool/coveryourtracks-eff-org) | — | — | — | ✓ | ✓ |
| [IPLeak.net](/tool/ipleak-net) | ✓ | ✓ | ✓ | — | ✓ |
| [DNS Leak Test](/tool/dnsleaktest-com) | — | — | ✓ | — | ✓ |
| [BrowserLeaks](/tool/browserleaks-com) | ✓ | ✓ | — | ✓ | ✓ |
| [PrivacyTests.org](/tool/privacytests-org) | — | ✓ | ✓ | ✓ | ✓ |

All five are free, require no registration, and produce results you can act on immediately.

## Step 4: Deep Dive With BrowserLeaks

[BrowserLeaks](/tool/browserleaks-com) is a collection of individual test pages, each targeting one fingerprinting surface. It's more technical than Cover Your Tracks but gives you the raw data behind your fingerprint.

The most important pages:

**WebRTC Leaks** — cross-references what IPLeak showed. If both tools report the same leaked IP, the leak is real and consistent.

**Canvas Fingerprint** — shows the pixel hash your browser produces when asked to render content invisibly. If canvas fingerprinting resistance is working, this value changes on each page reload. If it's identical across reloads, you can be tracked via canvas.

**IP Address** — includes geolocation derived from your IP, which is typically accurate to city level without requiring GPS or any permission from you.

**User-Agent Client Hints** — Chrome's newer UA-CH API lets sites query individual attributes (browser version, platform, architecture) separately rather than reading one monolithic User-Agent string. BrowserLeaks shows exactly which values your browser is exposing through this newer channel.

[PrivacyTests.org](/tool/privacytests-org), maintained by a former Firefox privacy engineer, benchmarks all major browsers across 20+ standardized tests and publishes results publicly. It's less about testing your current setup and more about comparing Firefox, Chrome, Brave, and Safari side by side before deciding whether to switch. The tests are automated and updated regularly, making it a reliable reference rather than a one-time snapshot.

## What's Fixable and What Isn't

Once you have your baseline results, here's what you can actually change.

**WebRTC IP leak** — fixable in under two minutes. In Firefox, open `about:config`, search for `media.peerconnection.enabled`, and set it to `false`. This disables WebRTC entirely; it breaks in-browser video calls, but most users aren't running those. In Brave, go to Settings → Privacy and Security → WebRTC IP Handling Policy and set it to "Disable non-proxied UDP." For Chrome, there's no native setting — install the uBlock Origin extension and enable "Prevent WebRTC from leaking local IP addresses" in its settings panel.

**DNS leak** — fixable by enabling DNS-over-HTTPS. This encrypts your DNS queries and routes them through a chosen resolver rather than your ISP's. Firefox: Settings → Privacy & Security → scroll to DNS over HTTPS → enable "Max Protection" and choose Cloudflare or NextDNS as your provider. Chrome: Settings → Privacy and Security → Security → Use secure DNS → choose a provider. Mozilla's [DNS over HTTPS documentation](https://support.mozilla.org/en-US/kb/firefox-dns-over-https) covers Firefox-specific configuration in detail. After enabling it, rerun DNS Leak Test to confirm ISP servers no longer appear.

**Unique fingerprint** — harder, but meaningfully improvable. Three approaches with documented results:

Firefox with `privacy.resistFingerprinting` enabled (`about:config`, set to `true`) normalizes your fingerprint to match every other Firefox user with the same setting — fixed screen resolution, UTC timezone, generic User-Agent. Cover Your Tracks should then return "strong protection."

Brave adds random noise to canvas and audio fingerprints each session, making it impractical to correlate sessions even if individual sessions are fingerprintable. Enable "Fingerprinting Protection" in Shields settings.

uBlock Origin in medium mode blocks most third-party scripts before they run — preventing fingerprinting scripts from executing in the first place. This is the strongest approach for Chrome users who aren't switching browsers.

**Tracking scripts** — the Firefox [Multi-Account Containers](https://support.mozilla.org/en-US/kb/containers) extension isolates different sites from each other, preventing cross-site tracking even when scripts do run. uBlock Origin's network request log shows you exactly which third-party scripts are loading on any given page.

> The uncomfortable irony: having unusual privacy extensions can make you *more* identifiable. If you're one of very few people running a specific combination of extensions, that configuration itself becomes a distinguishing signal. The goal isn't to block everything — it's to look like many other people.

## Reducing Exposure Without Configuration Changes

Technical fixes address browser behavior. They don't address what happens when you log in and create accounts. Once a site has your email address, fingerprinting becomes unnecessary — they already have a permanent, cross-device identifier that follows you everywhere.

One practical approach: use tools that don't require accounts. For sharing sensitive files without registration, [Wormhole](/tool/wormhole-app) uses end-to-end encryption with no sign up required. For sending a message that self-destructs after reading, [PrivNote](/tool/privnote-com) works immediately without creating an account. When a site demands an email address just to view content, [Temp Mail](/tool/temp-mail-org) generates a disposable address on the spot — no registration, no password.

These aren't workarounds — they're a structurally different model. A tool that has no account system cannot build a profile on you, because there's nothing to attach the data to. The [nologin.tools directory](/tool/nologin-tools) catalogs hundreds of tools across categories — image editing, file conversion, developer utilities, collaboration — all usable without signing up. Using them doesn't require fixing browser settings; it removes the data collection mechanism entirely.

## Where to Start Right Now

Run Cover Your Tracks. If it shows "unique fingerprint," that's your primary problem, and switching to Firefox with `privacy.resistFingerprinting` enabled or Brave is the highest-impact fix.

Then run IPLeak. If WebRTC exposes a different IP than your VPN's IP, that's fixable in under two minutes with one browser setting.

Then run DNS Leak Test. If ISP servers appear in the results, enabling DNS-over-HTTPS in your browser takes about three clicks.

Three tests. Three concrete fixes. None require creating an account. Re-run Cover Your Tracks after making changes — the difference between "unique fingerprint" and "strong protection" shows up immediately and is worth seeing.

Privacy protection compounds. Fixing one leak doesn't fix everything, but it narrows what's actually exposed — and knowing exactly what's leaking is better than guessing.
