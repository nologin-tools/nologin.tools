---
title: "What Your Browser Leaks — Free Tests to Check, No Login"
description: "Your browser exposes far more than your IP address. Here are the specific data types that leak, and five free no-login tools to test exactly what yours reveals."
publishedAt: 2026-04-23
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "tools", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak security"
---

![Hero image](/blog/images/what-your-browser-leaks-free-privacy-tests/hero.jpg)

A security research team recently published something worth reading twice: they found a stable identifier inside Firefox that persisted across Tor Browser sessions. Not an exploit. Not a bug in the traditional sense. Just Firefox's IndexedDB API storing data with site-specific paths — paths stable enough to link "anonymous" sessions together into a single traceable identity.

Tor Browser is specifically designed to make you look like everyone else. That's the entire model: uniform fingerprint, no persistent state, a fresh identity per session. Yet a core browser storage API was quietly threading an identifier through all of it. You can read the full technical breakdown in [Fingerprint's research post](https://fingerprint.com/blog/firefox-tor-indexeddb-privacy-vulnerability/).

The lesson isn't "don't use Tor." It's this: the things that track you are often doing exactly what they were designed to do. Standard browser APIs, shipping in every browser, used as intended — just not in your interest.

## What "Leaking" Actually Means

Most people think of browser privacy in terms of cookies. Block third-party cookies, problem solved. But cookies are just one method, and increasingly the least interesting one. Modern tracking relies on data your browser exposes through completely standard APIs, no cookies involved.

Here's what most browsers expose by default:

**Your IP address** is obvious. Every HTTP request includes it. What's less obvious is that WebRTC — the technology behind in-browser video calls and peer-to-peer connections — negotiates connections by exchanging IP addresses at the network level. This bypasses VPN routing. A site can trigger WebRTC negotiation and see your real local network IP even when you're behind a VPN that hides your public IP.

**DNS requests** go to a resolver when you type a URL. If those requests travel outside your VPN tunnel — a "DNS leak" — the resolver sees every domain you visit. Your VPN can hide your IP from websites while your ISP's DNS server logs everything you look up. Many VPNs fix this; many don't.

**Browser fingerprinting** uses readable properties — screen resolution, installed fonts, timezone, language, hardware concurrency, WebGL renderer, canvas rendering output — to build a profile that's unique to your machine. No storage needed. No cookies set. The fingerprint is reconstructed fresh on each visit from information your browser hands over on request.

**Persistent storage leaks** cover localStorage, sessionStorage, IndexedDB, and the HTTP cache. The Firefox/Tor case falls here. Sites can write identifiers into these stores that survive cookie deletion, private browsing mode, or even browser restarts if you don't explicitly clear storage. IndexedDB is especially problematic because its storage paths can act as implicit identifiers before any data is written.

## Five Free Tools to See What Your Browser Exposes

The most direct way to understand your exposure is to test it yourself. All five of these tools run entirely in your browser — no signup, no account, no download required.

### BrowserLeaks

[BrowserLeaks](/tool/browserleaks-com) is the most thorough free testing suite available. Open it and you see a sidebar of tests: IP address, WebRTC, Canvas fingerprint, WebGL, CSS media features, font enumeration, client hints, and more. Each test shows you the raw data your browser exposes.

The WebRTC test is the one to check first if you use a VPN. It shows both your public IP and any local IPs WebRTC exposes. If your real IP appears there while your VPN is active, the VPN isn't stopping WebRTC leaks. The canvas fingerprint test renders the same image and shows you the hash — that hash is what tracking services store to recognize you.

### Cover Your Tracks

[Cover Your Tracks](/tool/coveryourtracks-eff-org) by the Electronic Frontier Foundation takes a different approach. Instead of showing raw technical values, it tells you how *unique* you look compared to other browsers it has tested. "Your fingerprint is unique among the X browsers we've seen" is more useful than a list of numbers.

The EFF tests both your fingerprint and your tracker-blocking ability. A browser with a unique fingerprint is trackable regardless of cookie settings. A browser that looks like millions of others is harder to track even without any extensions.

### DNS Leak Test

[DNS Leak Test](/tool/dnsleaktest-com) does one thing: it checks whether your DNS queries are escaping your intended network path. Run the extended test, not the basic one. The extended version queries multiple servers and shows exactly which resolvers answer. If you see your ISP's servers while connected to a VPN, that's a confirmed DNS leak.

The extended test is slower — takes about 30 seconds — because it's waiting for all those query responses. Worth it. A DNS leak completely undermines what a VPN is supposed to accomplish.

### IPLeak

[IPLeak](/tool/ipleak-net) combines IP address, DNS, and WebRTC checks on a single page. The practical value is IPv6 detection. Many VPNs protect IPv4 traffic but leave IPv6 unmasked, because IPv6 support in VPN clients lags behind. IPLeak shows both your IPv4 and IPv6 addresses. If you see an IPv6 address that resolves to your real location, the VPN isn't covering everything.

### PrivacyTests

[PrivacyTests](/tool/privacytests-org) doesn't test *your* browser — it compares browsers in general. The site runs automated tests across Chrome, Firefox, Safari, Brave, Edge, and others, checking each for tracking protection: first-party cookie blocking, fingerprint resistance, HTTPS upgrading, and referrer policy enforcement.

If you're deciding between browsers, this is the comparison to read. Brave and Firefox consistently perform better than Chrome on most privacy metrics. The test methodology is open source, which means the results are reproducible rather than just someone's opinion.

## What a Canvas Fingerprint Looks Like in Code

Canvas fingerprinting is the least intuitive leak because nothing gets stored and no request gets made. The site renders text to a hidden canvas element and reads back the pixel data:

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'top';
ctx.font = '14px Arial';
ctx.fillStyle = '#f60';
ctx.fillRect(125, 1, 62, 20);
ctx.fillStyle = '#069';
ctx.fillText('Browser fingerprint', 2, 15);
const fingerprint = canvas.toDataURL().slice(-50);
```

The string in `fingerprint` differs between machines because font rendering depends on your GPU, installed font files, driver-level antialiasing settings, and OS. Two computers running the same browser version on the same OS can still produce different outputs. The hash of that output becomes your identifier.

Brave Browser injects randomized noise into canvas output, making the hash different on each page load. Firefox with `privacy.resistFingerprinting` enabled returns a blank canvas. Both approaches break this vector. Chrome does neither by default.

## Browser Settings That Reduce Leaks

These are concrete changes, not general advice.

**Stop WebRTC IP leaks in Firefox**: Open `about:config`, search for `media.peerconnection.enabled`, and set it to `false`. This disables WebRTC entirely. If you need video calls in the browser, use `media.peerconnection.ice.default_address_only = true` instead — this restricts WebRTC to your public IP, which is already known, rather than leaking local network IPs.

**Enable DNS over HTTPS**: In Firefox, go to Settings → Privacy & Security → DNS over HTTPS. In Chrome/Edge, it's Settings → Privacy → Use secure DNS. This encrypts DNS queries and routes them through your chosen resolver. Cloudflare's 1.1.1.1 and NextDNS are common choices. DNS over HTTPS stops DNS leaks even without a VPN.

**Isolate first-party storage**: In Firefox's `about:config`, set `privacy.firstparty.isolate = true`. This partitions storage by top-level domain — a tracker embedded on multiple sites can't use localStorage to link your visits together. It's the same isolation principle Tor Browser applies by default.

**Resist fingerprinting**: `privacy.resistFingerprinting = true` in Firefox `about:config` normalizes many of the values that make your browser unique: canvas output, timezone reporting, screen size reporting, and more. Some sites break because they rely on accurate canvas output. Most don't.

## Browser Comparison: Privacy Out of the Box

| Browser | WebRTC leak protection | Canvas fingerprint protection | DNS leak protection | Third-party cookies blocked |
|---------|----------------------|------------------------------|---------------------|----------------------------|
| Chrome | No | No | Optional (DoH) | No (deprecated) |
| Firefox | No (config required) | No (config required) | Optional (DoH) | Partial (ETP) |
| Brave | Yes (built-in) | Yes (randomized) | Optional (DoH) | Yes |
| Safari | Partial | Partial | No | Yes (ITP) |
| Tor Browser | Yes | Yes (blank canvas) | Yes (Tor network) | Yes |

This table is a snapshot based on default configurations as of early 2026. "Optional" means the feature exists but requires enabling. Sources: [PrivacyTests.org](https://privacytests.org) and the Brave Browser [privacy documentation](https://brave.com/privacy-features/).

## The Fingerprinting Problem Has No Clean Solution

Blocking cookies was tractable: browsers could just stop accepting them. Fingerprinting is harder because the underlying information is useful. Websites legitimately need to know your screen size for responsive design. JavaScript needs accurate timing for animations. The Canvas API exists to let browsers render things — blocking it entirely would break web applications.

The practical solutions are either normalization (make everyone look the same, Tor's approach) or randomization (make each session look different, Brave's approach). Normalization is more effective but requires everyone to use the same browser settings, which doesn't scale. Randomization is less protective — sites can average out random noise over multiple visits — but more usable.

For most people, running [BrowserLeaks](/tool/browserleaks-com) and [Cover Your Tracks](/tool/coveryourtracks-eff-org) once is enough to understand their actual exposure. Most people aren't uniquely fingerprintable — if you're using a common browser on a common OS with default settings, your fingerprint probably matches thousands of others. The people most at risk are the ones who've customized heavily: unusual fonts, rare extensions, non-standard screen resolutions.

The Firefox/Tor IndexedDB case mattered because it targeted exactly the people who *had* tried to normalize their fingerprint. They used Tor, they used a standard window size, they disabled JavaScript — and a storage API they hadn't considered was doing the work of an identifier anyway.

For a broader look at browser configuration choices and which settings actually move the needle, the post on [how to browse the web without leaving a trace](/blog/browse-web-without-leaving-trace) covers the next level of hardening in detail. But start with the tests. Knowing what you're actually exposing is more useful than any advice about what to change.
