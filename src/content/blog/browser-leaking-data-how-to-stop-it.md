---
title: "Your Browser Is Leaking Data — Here's How to Stop It"
description: "Your browser exposes your real IP, GPU, fonts, and timezone to every site you visit. Here's what's leaking and how to stop it."
publishedAt: 2026-03-31
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak surveillance"
---

Open a fresh incognito tab. No cookies, no history, no login. You feel anonymous.

You're not. Not even close.

The EFF's [Panopticlick research](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) found that **83.6% of browsers have a unique fingerprint** — enough to identify you across every site you visit without setting a single cookie. Add browser plugins to the mix and that number climbs to 94.2%. Incognito mode does nothing about this. Neither does clearing your cookies.

Here's what's actually leaking, and what you can do about it.

## What Your Browser Is Actually Sending

Every time you load a page, your browser volunteers a small novel about itself. Before JavaScript even runs, the HTTP request headers reveal your browser name and version, operating system, preferred languages, and encoding support. This happens automatically — no prompts, no consent.

JavaScript makes it much worse. Sites can read your screen resolution (including the gap left by your taskbar), your exact timezone, how many CPU cores you have, how much RAM your device has (rounded to the nearest power of two, but still useful), and which color scheme you prefer. None of these require any permission dialog.

The total count: modern fingerprinting libraries like FingerprintJS collect **100+ individual attributes** per browser. Combined into a hash, they produce an identifier that persists across sessions, browsers on the same machine, and even incognito mode. FingerprintJS claims 99.5% accuracy in re-identifying returning visitors even after cookies are cleared.

The uncomfortable truth is that most of what makes you "private" online — clearing cookies, using VPNs, opening incognito — doesn't touch fingerprinting at all. Those are solutions to a different problem.

## The WebRTC Problem (and Why Your VPN Doesn't Help)

WebRTC is the browser API that powers in-browser video calls — Google Meet, Discord, Zoom web. It works by establishing peer-to-peer connections directly between browsers, which means it needs to know your real network address.

Here's the problem: any website can trigger a WebRTC connection attempt with a few lines of JavaScript, requiring no user interaction or permission. To find the fastest path between peers, WebRTC uses a protocol called ICE (Interactive Connectivity Establishment), which contacts a public STUN server. That STUN server response includes your **real public IP address**.

Your VPN doesn't catch this. WebRTC traffic uses UDP and is handled at the OS network level differently from your browser's HTTP traffic. Most VPN implementations simply don't intercept it. So even with a VPN running, a website can run this code and discover your actual IP in under a second:

```js
const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
pc.createDataChannel("");
pc.createOffer().then(o => pc.setLocalDescription(o));
pc.onicecandidate = e => { /* your real IP is in e.candidate.candidate */ };
```

This is called a WebRTC leak, and it's been documented in commercial fingerprinting SDKs, ad tech platforms, and anti-fraud systems alike.

**How to block it:** Firefox lets you disable WebRTC entirely by setting `media.peerconnection.enabled` to `false` in `about:config`. This breaks in-browser video calls, so it's a trade-off. uBlock Origin's advanced settings include a "Prevent WebRTC from leaking local IP addresses" option that's less destructive — it blocks the local IP exposure while allowing WebRTC to function. Brave blocks local IP leakage by default under its Shields panel.

You can verify whether you're leaking with [IPLeak](/tool/ipleak-net), which shows all WebRTC ICE candidates your browser is exposing right now.

## DNS Leaks: The Other Hole in Your VPN

When you type a domain into your browser, a DNS resolver turns it into an IP address. If you're using a VPN, that query should go through the VPN tunnel to your VPN provider's resolver — not to your ISP.

A DNS leak is when it goes to your ISP anyway, revealing every domain you visit to them regardless of the VPN. The content of your traffic stays encrypted, but your ISP can see that you visited `example.com` at 9:14 PM on Tuesday. That's enough to build a detailed behavioral profile.

DNS leaks happen for several boring infrastructure reasons. Windows has a feature called Smart Multi-Homed Name Resolution that sends DNS queries to **all** available network adapters simultaneously and uses the fastest response. This means queries go to both the VPN's resolver and your ISP's resolver at the same time. Many VPN clients don't override this behavior correctly.

IPv6 is another common culprit. Many VPNs only tunnel IPv4 traffic. If your router and OS support IPv6, DNS queries over that path bypass the VPN tunnel entirely.

Some ISPs make this worse by running transparent DNS proxies — they intercept all outbound UDP traffic on port 53 and redirect it to their own resolvers, even if you've configured your system to use a different DNS server like 1.1.1.1 or 8.8.8.8.

**To test whether you're leaking:** Run an extended test at [DNS Leak Test](/tool/dnsleaktest-com). It sends DNS queries to a set of unique subdomains and watches which resolvers pick them up. If the results show your ISP's servers rather than your VPN provider's servers, you have a confirmed leak.

The fix depends on your setup, but enabling DNS-over-HTTPS (DoH) in your browser is a reasonable starting point that bypasses the system resolver entirely. Firefox has this under Settings → Privacy & Security → DNS over HTTPS. Set it to "Max Protection" to prevent fallback to the system resolver.

## Canvas and Audio Fingerprinting (The Creepier Stuff)

Even with WebRTC blocked and DNS secured, there's a category of fingerprinting that doesn't depend on your network at all. It exploits tiny differences in how your hardware renders graphics.

Canvas fingerprinting works like this: a script draws some text and shapes to an invisible `<canvas>` element, then reads back the pixel data. The output varies — subtly, but measurably — based on your GPU model, GPU driver version, operating system, and font rendering engine. macOS uses CoreText, Windows uses DirectWrite, Linux uses FreeType. Each produces slightly different sub-pixel antialiasing. Each GPU driver has its own floating-point rounding behavior. The 2014 academic paper ["The Web Never Forgets"](https://dl.acm.org/doi/10.1145/2660267.2660347) found canvas fingerprinting deployed on 5% of the top 100,000 websites at the time, and that was over a decade ago.

Audio fingerprinting is similar. A script creates an `AudioContext`, runs an oscillator through an analyzer, and reads the output values. The tiny floating-point differences in how your hardware processes audio are consistent enough to identify you across sessions. No microphone access required.

These two signals combined — canvas + WebGL fingerprint — carry roughly 15+ bits of entropy each. That means roughly 1 in 32,768 browsers shares the same canvas fingerprint in isolation. Combined with your screen resolution, timezone, CPU core count, and User-Agent, you're down to a sample size of one.

> The uncomfortable irony: having privacy extensions can make you *more* identifiable. If you're one of the few people running uBlock Origin in "medium mode" with a specific extension set, that configuration itself becomes a distinguishing signal.

## How to Test Yourself Right Now

Before changing anything, it's worth seeing what you're actually exposing.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) by the EFF is the best starting point. It tests your browser against a database of millions of real fingerprints and tells you how unique yours is, with per-attribute entropy scores. "Your browser has a unique fingerprint" means you can be identified. "Strong protection" means your browser looks like many others — which is the actual goal.

[BrowserLeaks](/tool/browserleaks-com) goes deeper, with separate pages for WebRTC leaks, canvas fingerprints, WebGL details, installed fonts, TLS fingerprinting, and more. Run the WebRTC test first — it's the most likely surprise.

[PrivacyTests](/tool/privacytests-org), run by a former Firefox privacy engineer, benchmarks browsers against each other across 20+ privacy tests. It's less about testing your specific browser and more about comparing Chrome vs Firefox vs Brave vs Safari vs Tor Browser across standardized scenarios. Worth reading before you decide whether to switch browsers.

## What Actually Helps

The honest answer is that no single setting fixes everything. But these changes have measurable, documented effects:

**Switch browsers.** This is the highest-impact move. Brave blocks WebRTC local IP exposure and canvas fingerprinting by default — it adds random noise to canvas/audio output each session, making cross-site correlation impossible without requiring you to break the web. Firefox with `privacy.resistFingerprinting = true` takes a different approach: it normalizes everything to look like a generic browser (fixed screen size of 1000×900, UTC timezone, generic UA string). This makes you look like every other Firefox user with that setting enabled, which is the right model.

| Browser | Canvas FP | WebRTC IP | DNS-over-HTTPS | Third-party cookies |
|---|---|---|---|---|
| Chrome | None | Leaks | Optional | Partial blocks |
| Firefox (default) | None | Leaks | Optional | Strict (ETP) |
| Firefox (RFP) | Randomized | Disabled | Optional | Strict |
| Brave | Randomized | Blocked | Optional | Blocked |
| Tor Browser | Uniform | Disabled | N/A (uses Tor) | Blocked |

**Install uBlock Origin.** On Firefox, use medium mode (block all third-party scripts by default, whitelist as needed). Enable "Prevent WebRTC from leaking local IP addresses" in the advanced settings. This blocks the majority of fingerprinting scripts before they even run. On Chrome, use it before Google's Manifest V3 changes further limit extension capabilities.

**Enable DNS-over-HTTPS.** Both Firefox and Chrome support this natively now. Use Cloudflare (1.1.1.1) or NextDNS. NextDNS in particular lets you see exactly which domains your browser is resolving — useful for auditing what's running on a page.

**Freeze your User-Agent.** Your UA string alone carries about 10.5 bits of entropy, according to the original Panopticlick research. Firefox's `privacy.resistFingerprinting` handles this automatically. On Chrome, the UA-CH API (User-Agent Client Hints) has gradually been replacing the old UA string — the intent was to reduce entropy, but the rollout has been inconsistent.

The Tor Browser remains the gold standard for fingerprinting resistance. It normalizes every fingerprintable attribute to be identical across all Tor users — same UA, same screen size, same fonts, same timezone. The goal is uniformity, not blocking. Every Tor Browser user looks identical. That's the only approach that truly defeats fingerprinting rather than just raising the cost.

For most people, Brave or Firefox with uBlock Origin gets you 80% of the way there without breaking the sites you actually use. That's a reasonable trade-off.

What you can't fully solve on your own is TLS fingerprinting — the cipher suite order and TLS extension values your browser sends during the HTTPS handshake are characteristic enough to identify your browser at the network level, before any HTTP. Cloudflare and other CDNs already use JA3 hashes (a standardized TLS fingerprint) for bot detection. No browser extension touches this. It's a solvable problem, but only browsers themselves can fix it.

The web has more surveillance infrastructure baked in than most users realize. The good news is that a few concrete changes — a better browser, one extension, DNS-over-HTTPS enabled — meaningfully reduce what you're leaking. Start with Cover Your Tracks. See what it says. Then decide what you're comfortable with.

One more thing worth noting: the tools that tend to respect your privacy most are the ones that don't require you to identify yourself. Privacy-friendly tools that work without signup can't correlate your session data to a profile because there's no profile to correlate to. If you want to get a sense of how many capable no-login tools exist, [nologin.tools](/tool/nologin-tools) keeps a curated list — everything from image editors to file sharing to developer utilities, all usable without creating an account. It's a practical way to reduce your online footprint while still getting things done.
