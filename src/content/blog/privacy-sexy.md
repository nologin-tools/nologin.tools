---
title: "The Browser Tool That Writes Your OS Privacy Scripts for You"
description: "privacy.sexy generates customizable privacy hardening scripts for Windows, macOS, and Linux in your browser — no account, no installation needed."
publishedAt: 2026-04-15
author: "nologin.tools"
tags: ["tools", "review", "privacy"]
featured: false
heroImageQuery: "operating system privacy security computer settings"
---

![Hero image](/blog/images/privacy-sexy/hero.jpg)

Windows 11 calls home to Microsoft servers dozens of times in the first hour after installation, under default settings. Not just for updates — for telemetry data, advertising IDs, diagnostic logs, Cortana activity, and usage patterns from every app you open. Apple has its own version of this story. Ubuntu quietly enabled data collection in 2012 and has been adjusting those settings ever since.

Most users handle this by opening the system privacy settings, toggling a few visible switches, and moving on. Those switches control a fraction of what's actually being transmitted. The deeper controls live in registry keys, system services, group policies, and configuration files — documentation scattered across tech blogs and forums, each change requiring administrator access and careful execution to avoid breaking something.

privacy.sexy is a browser-based tool that does the research and writes the scripts for you.

## What the Tool Does

privacy.sexy lets you browse through over 900 privacy-related configuration options for Windows, macOS, and Linux. You check the ones you want to apply, and the tool assembles a script — PowerShell for Windows, shell script for macOS and Linux — that you download and run with administrator permissions. The script generation happens entirely in your browser using client-side JavaScript. No account required. No selections transmitted to a server.

The tool's approach is built around visibility and choice rather than automation. Each tweak shows you exactly what it does before you apply it. Some tweaks involve tradeoffs: disabling Windows Error Reporting prevents crash data from going to Microsoft, but your crash reports also won't contribute to bug detection. Removing the advertising ID eliminates ad targeting, but some apps may behave differently without it. privacy.sexy presents these consequences explicitly, which is why there's no single "apply everything" button.

Picture a scenario: you've just set up a fresh Windows install and want to prevent Microsoft from building an advertising profile on you, stop the OS from sending diagnostic data to third parties, and disable the delivery optimization feature that uses your bandwidth to distribute Windows updates to strangers on the internet. Normally, that requires hunting through Settings menus, running specific registry edits, and disabling services one by one — if you know where to look. With privacy.sexy, you select those categories, review the generated script, and run it.

## Coverage by Operating System

The scope varies by platform, reflecting where data collection is most deeply integrated:

| OS | Approximate Tweaks | Notable Coverage |
|----|-------------------|-----------------|
| Windows | 600+ | Telemetry services, advertising ID, Cortana, delivery optimization, activity history |
| macOS | 200+ | Siri analytics, iCloud data sharing, App Store tracking, crash reporting |
| Linux | 100+ | Ubuntu telemetry, package manager behavior, crash reporters |

Windows coverage is the most extensive because Microsoft has built data collection into more layers of the OS. Categories include:

- **Telemetry**: The DiagTrack service and Connected User Experiences, which send usage data to Microsoft continuously
- **Delivery optimization**: Windows Update's peer-to-peer sharing feature, which uses your bandwidth and exposes your IP to other Windows users during update downloads
- **Activity history**: The Timeline feature, which logs every document and app you open and can sync this to Microsoft's servers
- **Windows Search**: Bing integration in the Start menu, which routes local search queries through Microsoft's servers

macOS coverage targets Apple's growing collection of behavioral data: Siri analytics that include your voice patterns, iCloud integration points that send metadata off-device, and crash reporting that sends detailed system snapshots. Linux coverage focuses on distribution-level telemetry — Ubuntu's opt-out data collection, nag screens for Ubuntu Pro, and crash reporter services that send data to Canonical.

## Reading What You're About to Run

Privacy tools that apply changes silently ask you to take something on faith. privacy.sexy takes a different position: you see the complete script before running anything.

Here's a representative excerpt from what a Windows script might look like for disabling the advertising ID:

```powershell
# Disable Advertising ID
If (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AdvertisingInfo")) {
    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AdvertisingInfo" | Out-Null
}
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AdvertisingInfo" -Name "DisabledByGroupPolicy" -Type DWord -Value 1
```

You don't have to be a PowerShell expert to verify this. The registry paths and value names are human-readable enough to confirm what's being changed. If a line looks unfamiliar, you can search the registry path independently before running. The tool generates scripts you can audit — that's the design intent.

This matters because you're running these scripts with administrator access. Privacy scripts found in random GitHub gists often lack explanation, may be years out of date, or may include changes you don't actually want. privacy.sexy's scripts are curated, documented, and actively maintained against changes in each operating system.

## The Open Source Foundation

The [source code is public on GitHub](https://github.com/undergroundwires/privacy.sexy) under MIT license. The scripts are defined in YAML files that are separate from the application logic, making them independently auditable and open to community contributions. Anyone can trace how a configuration option in the browser interface maps to specific commands in the generated output.

The project has been actively maintained since 2020 — meaningful given that OS privacy is not a static problem. Microsoft re-enables telemetry settings during major Windows updates. New OS features introduce new data collection points. The project tracks these changes and adds or updates scripts accordingly.

> "The application respects your privacy by design: the web application is entirely static, and all scripts are generated client-side in your browser. Your selections are never sent to any server." — from the privacy.sexy documentation

For users who want complete control over the application itself, the repository includes Docker configuration for self-hosting:

```bash
git clone https://github.com/undergroundwires/privacy.sexy
cd privacy.sexy
docker-compose up
```

The self-hosted version makes sense in sensitive environments, air-gapped setups, or for anyone who wants to review the exact application code before running any script it generates.

## How This Fits Alongside Browser Privacy Tools

Most privacy tools in the no-login space focus on what happens in the browser. [BrowserLeaks](/tool/browserleaks-com) shows you what data your browser exposes to websites. [Cover Your Tracks](/tool/coveryourtracks-eff-org) by the EFF tests whether your browser fingerprint is unique enough to track you across sessions. These are valuable tools that address the browser layer.

privacy.sexy addresses the OS layer — the platform the browser and every other application runs on top of. Even a hardened, privacy-respecting browser operates on an operating system that may be reporting your usage patterns, connected accounts, and device identifiers back to the software vendor. Addressing one layer doesn't address the other.

[Privacy Guides](https://privacyguides.org/en/os/windows/) describes this gap clearly: OS-level telemetry runs beneath browser-level tracking and isn't addressed by browser settings, extensions, or VPNs. The browser sees websites; the OS sees everything. Both layers matter, and they require different tools.

The two approaches complement each other. If you've used browser privacy tools to understand what data you're leaking at the network layer, privacy.sexy is the natural next step for what's being reported at the system level.

## When and How to Use It

Two moments where privacy.sexy provides the most immediate value:

**After a fresh OS installation.** Default settings on all three major platforms favor data collection. Running privacy.sexy scripts early means those defaults never take effect — you're configuring privacy from day one rather than correcting weeks of exposure.

**After a major OS update.** Both Microsoft and Apple have documented histories of resetting privacy settings to their defaults during major version upgrades. Windows 10 to Windows 11 re-enabled several telemetry settings for users who had previously disabled them. A post-upgrade check catches anything that got silently reset.

Using the tool itself requires no account, no download, and no installation:

1. Open [privacy.sexy](https://privacy.sexy) in any browser
2. Select your OS from the tab at the top
3. Browse the category tree in the left panel — each entry has an explanation
4. Check boxes next to tweaks you want to apply; the script panel updates in real time
5. Download the generated script
6. Run it with administrator or root permissions

Generated Windows scripts are PowerShell `.ps1` files. If your system blocks PowerShell scripts by default, you may need to temporarily set the execution policy: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`. macOS and Linux scripts are standard shell scripts that run in any terminal.

The scripts are also useful as documentation independent of running them. Browsing what privacy.sexy covers gives you a map of where data collection is happening in your OS — even if you skip some tweaks, knowing what the defaults include is itself valuable information.

---

Every default setting your OS ships with was chosen by someone, for reasons that may or may not align with yours. The defaults favor data collection because that data has value to the company that built the OS. Changing those defaults takes work that most users don't know how to do or don't want to spend time on. Tools that make that work accessible — without requiring an account, without adding a new privacy risk in the form of a third-party service, without asking you to run commands you can't read — shift that calculation. As operating systems add more telemetry features over time, expect privacy.sexy's list of tweaks to keep expanding alongside them.
