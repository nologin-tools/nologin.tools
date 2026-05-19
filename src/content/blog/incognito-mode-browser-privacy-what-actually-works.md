---
title: "Incognito Mode Won't Save You — What Actually Protects Browser Privacy"
description: "Incognito mode hides local history but doesn't stop fingerprinting or IP tracking. Free no-account tests show exactly what still leaks and what actually fixes it."
publishedAt: 2026-05-19
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "private browsing incognito mode browser privacy security lock"
---

![Hero image](/blog/images/incognito-mode-browser-privacy-what-actually-works/hero.jpg)

Every browser has a private mode. Chrome calls it Incognito. Firefox calls it Private Window. Safari calls it Private Browsing. They all do roughly the same thing, and they're all misunderstood in roughly the same way.

Private mode does one thing well: it stops your browser from storing a local record of your session. No history saved. Cookies deleted when the window closes. Form data not remembered. If you share a computer with someone, private mode keeps your session out of the shared history.

That's it. That's the complete protection.

The website you're visiting doesn't care whether you're in private mode. It can't tell. Your IP address looks identical. Your browser fingerprint is unchanged. Third-party scripts loaded on the page run the same way. Private mode is a privacy feature aimed at people sharing your device — not at the websites you visit or the networks your traffic crosses.

## What Private Mode Actually Does (And Only Does)

Private mode protects against a narrow set of real threats, and it's worth being precise about which ones.

If you log into your bank on a shared computer, private mode ensures your session cookies disappear when you close the window. The next person who opens the browser won't be logged in as you. On public or shared computers, that's a meaningful protection. It also prevents your browser from autofilling forms with data from your session, adding visited URLs to the shared autocomplete history, or saving new passwords into the browser's credential store.

Browser extensions generally don't run in private mode unless you explicitly grant them permission. This matters for extensions that modify page behavior, but it doesn't apply to tracking scripts served by the websites themselves — those are part of the page, not part of the browser.

When people expect private mode to protect them from websites and advertisers, it fails completely. That's not what it was built for.

## The Fingerprint That Persists Through Private Mode

> Your browser exposes a consistent hardware profile to every website you visit. Private mode cannot change your hardware. It cannot change how your GPU renders a canvas element, which fonts are installed on your system, or how many CPU cores your machine has.

The EFF's [Panopticlick research](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) tested millions of browsers and found that **83.6% have a fingerprint unique enough to identify them across sessions** — without setting a single cookie. Add browser plugins and that rises to 94.2%. Open a private window, and you get the same fingerprint. Clear your cookies, and you get the same fingerprint. Use a different browser on the same machine, and your fingerprint changes — but only because the hardware properties are now being reported by a different software stack.

Here's what makes up a fingerprint:

**Canvas fingerprinting** exploits the fact that different GPU hardware renders text and shapes with slightly different subpixel rounding. A site draws text and emoji to a hidden canvas element, then reads the pixel data as a number. Your GPU produces a consistent number that differs from someone else's GPU, even with identical browser versions and operating systems.

**WebGL fingerprinting** reads your GPU's renderer string directly — the exact make and model of your graphics hardware. The string `ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)` is a different fingerprint than `ANGLE (NVIDIA, NVIDIA GeForce RTX 4060)`.

**Font enumeration** uses JavaScript to test which fonts are installed by measuring rendered text widths across different font families. The specific set of fonts differs between operating systems, between users who've installed additional fonts, and between personal and corporate machines.

**Hardware properties** — CPU core count, device memory, audio processing fingerprint, screen resolution including taskbar gap, connection type — all contribute identifiers that don't change between sessions.

Private mode does nothing about any of this. Neither does clearing cookies. Neither does a VPN, for that matter — fingerprinting reads your browser properties directly and doesn't travel through a tunnel the VPN can intercept.

## What You're Actually Exposing: A Breakdown

| Privacy Threat | Private Mode Protects? | Notes |
|---|---|---|
| Saved local browsing history | ✓ Yes | Main use case |
| Session cookies after closing | ✓ Yes | Cookies deleted on close |
| Autofill / saved passwords | ✓ Yes | Data not written |
| IP address visible to websites | ✗ No | Identical to normal browsing |
| Browser fingerprinting | ✗ No | Hardware profile unchanged |
| WebRTC IP leaks | ✗ No | Real IP exposed even through VPN |
| Third-party tracking scripts | ✗ No | Scripts load the same way |
| ISP traffic monitoring | ✗ No | Traffic is unencrypted either way |
| DNS query logs at ISP | ✗ No | Queries go to same resolver |

WebRTC deserves a separate note. It's the browser API that powers in-browser video calls. When WebRTC negotiates a peer-to-peer connection, it exchanges IP addresses at the operating system level — below VPN tunnels and well below anything private mode touches. A page that initiates a WebRTC exchange can see your real local network IP even if you're behind a VPN and in private mode simultaneously. Most people discover this when they first test it.

## Free Tests That Show What's Actually Leaking — No Account Required

Running a few free no-login tests takes about ten minutes and gives you specific numbers instead of general descriptions. The results will probably be surprising.

**[Cover Your Tracks](https://nologin.tools/tool/coveryourtracks-eff-org)** by the EFF tests your browser against a database of millions of real fingerprints and shows how unique yours is — with per-attribute entropy scores. Run it in a normal window, note the result. Then open a private window and run it again. The fingerprinting result will almost certainly be identical. "Your browser has a unique fingerprint" in both cases confirms that private mode changed nothing about how sites can identify you.

**[BrowserLeaks](https://nologin.tools/tool/browserleaks-com)** runs approximately 20 individual tests: IP address, WebRTC leak status, canvas fingerprint hash, WebGL renderer string, font enumeration count, TLS fingerprint, and more. The WebRTC test is the most revealing — it shows every IP address your browser is currently exposing. If you see your real local IP listed alongside a VPN IP, you have a confirmed WebRTC leak. Running this in private mode produces the same output as normal mode.

**[IPLeak.net](https://nologin.tools/tool/ipleak-net)** combines IP detection and WebRTC leak checking on one page. Useful for a quick combined check: if your listed IP and your WebRTC IP are different, you have a WebRTC leak.

**[DNS Leak Test](https://nologin.tools/tool/dnsleaktest-com)** sends DNS queries and watches which resolvers respond. DNS queries resolve domain names to IP addresses — every URL you visit triggers one. If your ISP's resolver appears in the results (rather than your VPN provider's or a privacy-focused public resolver), your ISP sees every domain you visit regardless of private mode or VPN.

**[PrivacyTests.org](https://nologin.tools/tool/privacytests-org)**, maintained by a former Firefox privacy engineer, benchmarks browsers against each other across 20+ privacy tests. It shows which protections each browser ships by default versus which require configuration. Worth checking before deciding whether to change browsers or settings.

## Browser Settings That Actually Work Against Fingerprinting

The fixes that address fingerprinting require either different browsers or specific configuration — private mode alone can't help here.

**Firefox** has a setting called `privacy.resistFingerprinting`. Type `about:config` in the address bar, accept the warning, search for this setting, and double-click to set it to `true`. When enabled, Firefox returns standardized values for canvas rendering, WebGL output, font metrics, screen dimensions, and timezone — the same values for every user with the setting enabled. Your fingerprint becomes common rather than unique. This is the same technology the Tor Browser uses; Mozilla documents it in their [Firefox fingerprinting protection guide](https://support.mozilla.org/en-US/kb/firefox-protection-against-fingerprinting).

You can pair this with `media.peerconnection.enabled` set to `false` to block WebRTC entirely, eliminating the WebRTC leak vector. If you don't use browser-based video calls, there's no downside.

**Brave** randomizes canvas and WebGL output per session by default. Your fingerprint changes between browser sessions, preventing cross-session correlation. No configuration needed — it ships this way.

For DNS leaks: both Firefox and Chrome support DNS-over-HTTPS natively. In Firefox, go to Settings → Privacy & Security → DNS over HTTPS. In Chrome: Settings → Privacy and Security → Security → Use secure DNS. Point it at a privacy-focused resolver — Cloudflare's 1.1.1.1, Mullvad DNS, or NextDNS all offer encrypted resolution without query logging.

**[privacy.sexy](https://nologin.tools/tool/privacy-sexy)** is an open-source, no-login browser tool that generates customizable privacy hardening scripts for Windows, macOS, and Linux. Select which settings to apply — telemetry blocking, WebRTC configuration, DNS hardening, and more — and it generates a script you run locally. No account, no upload. The script runs on your machine and the service never sees your data.

## The Separate Problem: What You Actively Hand Over

Browser hardening addresses what your browser exposes passively. There's a second category: what you actively provide to online services.

Every account you create ties your activity to a persistent identity. That identity can be linked across services through data brokers, correlated with your browser fingerprint, and connected to your purchase history. This is different from passive fingerprinting — it requires you to hand over identifying information (an email address, usually) and then continue using the service.

No-login tools that process data locally short-circuit this entire chain. When an image compression tool runs entirely in your browser without uploading anything to a server — the way [Squoosh](https://nologin.tools/tool/squoosh-app) does — there's no record of you processing that file anywhere outside your device. Compare that to a service that requires signup: that service now has your email, a record of the file you processed, a timestamp, and your IP address at minimum.

The same logic applies to file encryption ([hat.sh](https://nologin.tools/tool/hat-sh) encrypts entirely client-side), collaborative whiteboards ([Excalidraw](https://nologin.tools/tool/excalidraw-com) works without an account), and dozens of other tool categories. These tools can still fingerprint your browser on page load — that's impossible to fully prevent without Firefox's `privacy.resistFingerprinting` or Brave's randomization. But they can't build a persistent usage profile on you because there's no identity to attach one to.

This isn't a complete privacy solution. But it meaningfully reduces the amount of data flowing from your activity to third parties.

## The Test You Should Run Before Changing Anything

Open [Cover Your Tracks](https://nologin.tools/tool/coveryourtracks-eff-org) in your current browser on a normal window. Note whether it says "unique fingerprint" or "some protection." Then open a private window and run the same test. Note whether the result changes.

If it doesn't change — if you get the same "unique fingerprint" result in both — you now have specific evidence that private mode provides zero additional protection from fingerprint-based tracking. That's not a general claim about browser privacy; it's a test result about your actual browser on your actual machine.

From there, you have a baseline. Enable `privacy.resistFingerprinting` in Firefox, or switch to Brave, and run the test again. You'll see whether the change worked. Enable DNS-over-HTTPS and run the DNS Leak Test to confirm your queries are no longer going to your ISP. Each change becomes verifiable.

Private mode was built for a specific, legitimate use case. For the people sharing your device, it works. For tracking by websites and advertisers, it was never designed to help. The tools above test what's actually happening and the settings above actually address it.
