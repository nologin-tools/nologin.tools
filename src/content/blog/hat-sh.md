---
title: "hat.sh: Encrypt Files in Your Browser Without Trusting Anyone"
description: "hat.sh encrypts and decrypts files using AES-256-GCM directly in your browser. No uploads, no servers, no accounts — your data never leaves your device."
publishedAt: 2026-03-24
author: "nologin.tools"
tags: ["tools", "review", "privacy", "encryption"]
featured: false
heroImageQuery: "file encryption security lock browser"
---

Every cloud storage service, every file-sharing platform, every "secure" upload tool has one thing in common: your files travel through someone else's computer. You're trusting the provider's encryption, their key management, their employees, and their legal obligations to whoever might ask for your data. That's a lot of trust to extend to a company you've never met.

What if encryption happened before the file left your machine — in your browser, with no server ever seeing the plaintext?

That's exactly what [hat.sh](https://hat.sh) does.

## What hat.sh Actually Does

hat.sh is a browser-based file encryption tool. You drag a file onto the page, enter a password (or provide a public key), and it spits out an encrypted `.enc` file. To decrypt, you drag the `.enc` file onto the same page, enter the password, and get your original file back. Everything happens locally in JavaScript — no network requests with your file content, no backend, no database.

The encryption scheme is AES-256-GCM, which is the same algorithm used by signal, WhatsApp, and most modern TLS connections. It's authenticated encryption, which means decryption will fail — loudly — if the file was tampered with at any point. You can't silently corrupt an encrypted file and have hat.sh accept it.

hat.sh supports two modes:

- **Password-based encryption**: You set a password, and the tool derives an encryption key from it using PBKDF2. Anyone with the password can decrypt.
- **Public key encryption**: You generate a key pair, share your public key, and anyone can encrypt files that only you can open with your private key. This uses X25519 key exchange combined with AES-256-GCM.

The public key mode is particularly useful for teams. A journalist can publish their public key; sources can use hat.sh to encrypt documents before sending, with zero setup required on the sender's side.

## No Login, No Upload, No Account

The privacy story here is unusually clean. The [source code is on GitHub](https://github.com/sh-dv/hat.sh) under MIT license — you can read exactly what JavaScript is running in your browser. There's no telemetry, no analytics calls with your file metadata, and no server-side component to compromise.

Compare this with typical "secure" file sharing services that:

| Feature | Typical encrypted upload service | hat.sh |
|---------|----------------------------------|--------|
| Files sent to server | Yes | No |
| Account required | Often | Never |
| Server sees plaintext | Depends on implementation | No |
| Source code auditable | Rarely | Yes (MIT) |
| Works offline | No | Yes (after first load) |

Tools like [VirusTotal](/tool/virustotal-com) send your files to external servers by design — that's their purpose. hat.sh is the opposite: the entire point is that your file content goes nowhere.

## When You'd Reach for hat.sh

Picture a freelance accountant who needs to send tax documents to a client. Email is plaintext. Most file-sharing links expire or get indexed. The accountant wants something simple: open a webpage, encrypt the file with a shared password, send the result.

Or consider a developer who's rotating credentials in a repository. They need to share a `.env` file with a teammate — just once, securely. They don't want to set up GPG key infrastructure for a single transfer. hat.sh lets them encrypt with a one-time password and send the `.enc` file over Slack, Discord, or email. The encrypted blob is meaningless without the password.

For security researchers, the public key mode has real utility. You can distribute your public key on your website and let anyone send you encrypted files without installing anything. No PGP keyserver, no GPG client, no [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust) complexity.

## The Technical Honesty of Client-Side Encryption

Client-side encryption has a notable limitation worth acknowledging: if the website itself is compromised, malicious JavaScript could exfiltrate your password or file before encrypting. This is the fundamental tension with any browser-based crypto tool.

hat.sh addresses this in a few ways. First, the open-source code means the JavaScript can be audited by anyone. Second, you can download the repository and run hat.sh locally, completely air-gapped. Third, for users with very high security requirements, the project includes a Docker setup for self-hosting.

For most use cases — sending sensitive documents to a colleague, encrypting a backup before uploading to cloud storage, protecting a configuration file — the threat model doesn't include a compromised CDN. Browser-based encryption is a substantial improvement over sending files in the clear.

If you're interested in understanding how your browser handles cryptography, the [Web Crypto API specification](https://www.w3.org/TR/WebCryptoAPI/) documents the primitives that hat.sh uses under the hood. It's a native browser feature, not a custom implementation, which means the cryptographic operations happen in optimized C++ code, not interpreted JavaScript.

## hat.sh Compared to Similar No-Login Tools

You might already know [CyberChef](/tool/gchq-github-io-cyberchef), which also runs entirely in the browser and can handle AES encryption. CyberChef is a general-purpose data transformation tool — it handles encoding, compression, hashing, and hundreds of other operations in addition to encryption. That breadth makes it powerful but also complex for a non-technical user.

hat.sh is purpose-built for one thing: encrypting files for safe transport or storage. The interface is minimal enough that you can hand the URL to someone who doesn't know what AES means, and they'll figure it out in under a minute. The simplicity is a feature.

[Wormhole](/tool/wormhole-app) solves a related problem — it lets you transfer files peer-to-peer with end-to-end encryption — but it requires both parties to be online simultaneously, and files are routed through relay servers. hat.sh produces a static encrypted file you can send through any channel, asynchronously.

## Getting Started

Using hat.sh for the first time takes about 30 seconds:

1. Go to [hat.sh](https://hat.sh)
2. Drag and drop any file onto the page (or click to browse)
3. Choose "Password" mode and enter a strong passphrase
4. Click **Encrypt** — you'll download a `.enc` file
5. Share the `.enc` file through any channel; share the password separately

To decrypt:

1. Go to [hat.sh](https://hat.sh)
2. Drag and drop the `.enc` file
3. Enter the password
4. Your original file downloads automatically

The whole workflow requires no account, no installation, and no trust in any third party. The encrypted file is just bytes — you can store it in Dropbox, email it, or post it publicly. Without the password, it's opaque.

---

Privacy tools often come with a trade-off: you either get strong security with painful complexity (GPG), or you get ease of use with data going to someone else's servers. hat.sh makes a different bet — that a well-designed, transparent, open-source web app can give you both. As browsers become more capable and the Web Crypto API matures, expect more tools to follow this pattern: the server's job is just to deliver the code, and everything sensitive happens on your machine.
