---
title: "如何免费审查浏览器隐私——无需注册任何账号"
description: "一份分步指南，教你用无需注册的免费工具测试浏览器究竟在泄露什么。检查 IP 泄漏、DNS 泄漏和指纹唯一性。"
publishedAt: 2026-04-15
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "tools"]
featured: false
heroImageQuery: "browser privacy security audit magnifying glass"
locale: zh
originalSlug: browser-privacy-audit-free-step-by-step
sourceHash: 9d9947ee9e2f5374
---

![Hero image](/blog/images/browser-privacy-audit-free-step-by-step/hero.jpg)

大多数隐私建议都跳过了一个关键步骤：亲自验证当前的真实情况。修改设置、安装扩展这些操作都很容易推荐，但更难、也更有价值的，是运行具体测试，看看你的浏览器**现在**实际暴露了什么。

这就是这篇指南要做的事。十分钟，不用注册账号，不需要安装任何软件。只需一套免费的浏览器测试工具，给你看清楚究竟哪里在泄露，每个数据都有迹可循。

## 你在测试什么

浏览器通过四个主要渠道暴露数据，每个渠道需要单独测试。

**IP 地址** — 最显眼的那个。你发起的每一次连接都会暴露你的 IP。但 WebRTC（浏览器内置的视频通话 API）会绕过 VPN，直接暴露你的真实 IP，因为它工作在 VPN 拦截不到的层级。

**DNS 查询** — 你访问的每个域名都会触发一次 DNS 查询，这个查询要发送到某个地方。默认情况下是你的 ISP 的解析服务器，而且没有加密。你的 ISP 会记录你查询的每一个域名。VPN 应该把这些查询路由到自己的解析服务器，但往往做不到，结果 VPN 隧道之外仍然存在一份独立的浏览记录。

**浏览器指纹** — 你的 GPU 型号、已安装字体、时区、屏幕分辨率、硬件并发数，以及几十个其他属性组合在一起，形成了一个足够独特的特征，可以在不使用 Cookie 的情况下跨站点追踪你。EFF 的 [Panopticlick 研究](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) 发现 83.6% 的浏览器指纹是唯一的，如果算上浏览器插件这个数字会上升到 94.2%。无痕模式对此没有任何作用。

**第三方脚本** — 广告网络和数据经纪商在大多数商业网站上都部署了追踪脚本。这些脚本在你的浏览器中运行，读取你的指纹，然后将数据上报给它们的服务器。屏蔽这些脚本与修复上面提到的泄漏是两回事。

下面这四个免费工具分别测试以上每个渠道。先运行它们，不要做任何修改——你需要一个基准数据。

## 第一步：用 Cover Your Tracks 获取指纹评分

[Cover Your Tracks](/tool/coveryourtracks-eff-org) 由电子前哨基金会（EFF）开发，是最好的起点，因为它给出的是一个简单明了的结论：你的浏览器是否能融入人群。

点击「Test Your Browser」，等待大约十秒钟。结果会落入以下三类之一：

- **强保护** — 你的指纹足够普通，可以混入许多其他用户
- **一定保护** — 部分随机化，但在某些方面仍然可被识别
- **唯一指纹** — 即使没有 Cookie，你的浏览器也可以被识别并跨站追踪

大多数人第一次测试都会得到「唯一指纹」。这不是失败的结果——这是你可以改进的基准。工具还会按属性逐一显示熵值：每个特征贡献了多少比特的识别信息。屏幕分辨率通常贡献 3–4 比特，User-Agent 字符串大约贡献 10 比特。综合起来，一个唯一指纹通常携带 18–22 比特的熵——大约每 250,000 个浏览器中才有一个会有相同的组合。

在做任何修改之前记下你的结果，之后需要对比。

## 第二步：用 IPLeak 检查 IP 和 WebRTC 泄漏

[IPLeak.net](/tool/ipleak-net) 加载速度快，可以同时检查三件事：你的可见 IP 地址、通过 WebRTC 暴露的 IP，以及你的 DNS 服务器。

重点关注的地方：WebRTC 部分显示的 IP 是否与你的主 IP 不同？如果你开着 VPN，但 WebRTC 显示的是你真实的 ISP IP 而不是 VPN 的 IP——这就是确认的 WebRTC 泄漏。网站可以在后台静默运行这个检查，不需要任何用户交互。

DNS 部分显示哪些解析服务器在处理你的查询。如果你看到属于你的 ISP 或电信公司的 IP 地址，说明这些查询绕过了你的 VPN 隧道。即使内容是加密的，你的 ISP 也能看到你访问的每个域名。

如果你没有使用 VPN，IP 和 DNS 部分都会显示你的 ISP 信息——这在预期之中，但值得理解。你对自己的 ISP 来说不是匿名的。

## 第三步：验证 DNS 配置

[DNS Leak Test](/tool/dnsleaktest-com) 专注于 DNS，运行比 IPLeak 更彻底的检查。使用「Extended Test」选项——它会向多个唯一子域名发送 DNS 请求，并捕获所有响应的解析服务器。

结果会显示每个 DNS 服务器的 IP 地址及其所属机构。干净的结果：只显示你的 VPN 提供商的服务器。DNS 泄漏：你的 ISP 服务器和 VPN 提供商的服务器同时出现，或者只有 ISP 服务器。严重泄漏：尽管 VPN 在运行，仍然只显示 ISP 的服务器，说明 VPN 根本没有路由 DNS 流量。

下面是每个免费隐私测试工具覆盖范围的对比：

| 工具 | IP 泄漏 | WebRTC 泄漏 | DNS 泄漏 | 指纹 | 无需注册 |
|------|---------|-------------|----------|------|---------|
| [Cover Your Tracks](/tool/coveryourtracks-eff-org) | — | — | — | ✓ | ✓ |
| [IPLeak.net](/tool/ipleak-net) | ✓ | ✓ | ✓ | — | ✓ |
| [DNS Leak Test](/tool/dnsleaktest-com) | — | — | ✓ | — | ✓ |
| [BrowserLeaks](/tool/browserleaks-com) | ✓ | ✓ | — | ✓ | ✓ |
| [PrivacyTests.org](/tool/privacytests-org) | — | ✓ | ✓ | ✓ | ✓ |

这五个工具全部免费，不需要注册，结果可以立即采取行动。

## 第四步：用 BrowserLeaks 深入检查

[BrowserLeaks](/tool/browserleaks-com) 是一系列针对单一指纹表面的独立测试页面。它比 Cover Your Tracks 更技术化，但能给你看到指纹背后的原始数据。

最重要的几个页面：

**WebRTC 泄漏** — 交叉验证 IPLeak 的结果。如果两个工具报告了相同的泄漏 IP，说明泄漏是真实且持续存在的。

**Canvas 指纹** — 显示你的浏览器在被要求不可见地渲染内容时产生的像素哈希。如果 Canvas 指纹保护在起作用，每次刷新页面这个值都会变化。如果每次加载都完全一致，你就可以通过 Canvas 被追踪。

**IP 地址** — 包含从你 IP 派生的地理位置，通常精确到城市级别，不需要 GPS 或任何你的许可。

**User-Agent Client Hints** — Chrome 的新版 UA-CH API 允许网站分别查询各个属性（浏览器版本、平台、架构），而不是读取一整串 User-Agent 字符串。BrowserLeaks 会显示你的浏览器通过这个新通道暴露了哪些值。

[PrivacyTests.org](/tool/privacytests-org) 由一位前 Firefox 隐私工程师维护，在 20 多项标准化测试中对所有主流浏览器进行横向评测，结果公开发布。它不是用来测试你当前的设置，而是在决定是否换浏览器之前，对 Firefox、Chrome、Brave 和 Safari 进行全面比较。测试是自动化的，定期更新，是可信赖的参考而不是一次性快照。

## 哪些可以修复，哪些修复不了

有了基准数据之后，下面是你实际可以改变的内容。

**WebRTC IP 泄漏** — 两分钟内可以搞定。Firefox 里打开 `about:config`，搜索 `media.peerconnection.enabled`，设置为 `false`。这会完全禁用 WebRTC；浏览器内的视频通话会失效，但大多数用户不需要这个功能。Brave 里，进入「设置 → 隐私与安全 → WebRTC IP 处理策略」，设置为「禁用非代理 UDP」。Chrome 没有原生设置——安装 uBlock Origin 扩展，在设置面板里启用「防止 WebRTC 泄漏本地 IP 地址」。

**DNS 泄漏** — 通过启用 DNS-over-HTTPS 来修复。这会加密你的 DNS 查询，并通过你选择的解析服务器而不是 ISP 的服务器来路由它们。Firefox：设置 → 隐私与安全 → 滚动到「HTTPS 上的 DNS」→ 启用「最大保护」并选择 Cloudflare 或 NextDNS 作为提供商。Chrome：设置 → 隐私与安全 → 安全 → 使用安全 DNS → 选择提供商。Mozilla 的 [DNS over HTTPS 文档](https://support.mozilla.org/en-US/kb/firefox-dns-over-https) 详细介绍了 Firefox 的具体配置。启用后，重新运行 DNS Leak Test，确认 ISP 服务器不再出现。

**唯一指纹** — 更难修复，但可以显著改善。三种有文献记录的有效方法：

开启 `privacy.resistFingerprinting` 的 Firefox（`about:config`，设置为 `true`）会将你的指纹标准化为与所有开启同样设置的 Firefox 用户完全相同——固定的屏幕分辨率、UTC 时区、通用 User-Agent。此时 Cover Your Tracks 应该返回「强保护」。

Brave 会在每次会话时向 Canvas 和音频指纹添加随机噪音，使跨站关联在实践中变得不可能，即使单次会话仍然可能被指纹化。在 Shields 设置里启用「指纹保护」。

中等模式下的 uBlock Origin 会在大多数第三方脚本运行之前就将其屏蔽——直接阻止指纹采集脚本执行。这是 Chrome 用户不想换浏览器时最强力的方案。

**追踪脚本** — Firefox 的 [Multi-Account Containers](https://support.mozilla.org/en-US/kb/containers) 扩展可以将不同网站相互隔离，即使脚本在运行也无法实现跨站追踪。uBlock Origin 的网络请求日志可以精确显示任何页面上加载了哪些第三方脚本。

> 有个令人不安的讽刺：装了隐私扩展反而可能让你*更容易*被识别。如果你是极少数同时使用某种特定扩展组合的人，这个配置本身就成了一个区分性信号。目标不是屏蔽一切——而是看起来和很多其他人一样。

## 不改配置也能减少暴露

技术修复针对的是浏览器行为，但无法解决你登录和创建账号之后发生的事情。一旦网站拿到了你的邮件地址，指纹追踪就变得多余了——他们已经有了一个跨设备、永久跟随你的标识符。

一个实际的做法：使用不需要账号的工具。需要在不注册的情况下共享敏感文件，[Wormhole](/tool/wormhole-app) 提供端对端加密，不需要注册。需要发送一条阅后即焚的消息，[PrivNote](/tool/privnote-com) 无需创建账号即可立即使用。当某个网站只是为了让你看内容就要求你提供邮件地址，[Temp Mail](/tool/temp-mail-org) 可以即时生成一次性地址，不需要注册，不需要密码。

这些不是权宜之计，而是一种结构上完全不同的模式。一个没有账号系统的工具根本无法建立关于你的档案，因为没有任何东西可以附着这些数据。[nologin.tools 目录](/tool/nologin-tools) 收录了数百个跨类别的工具——图像编辑、文件转换、开发者工具、协作——全部无需注册即可使用。使用它们不需要修改浏览器设置；它根本上移除了数据收集机制。

## 现在就开始

运行 Cover Your Tracks。如果显示「唯一指纹」，这是你首要需要解决的问题，换到开启 `privacy.resistFingerprinting` 的 Firefox 或 Brave 是最有效的修复。

再运行 IPLeak。如果 WebRTC 暴露的 IP 和你的 VPN IP 不同，这个问题用一个浏览器设置两分钟内就能修复。

再运行 DNS Leak Test。如果结果里出现 ISP 服务器，在浏览器里启用 DNS-over-HTTPS 大概只需要三次点击。

三个测试，三个具体修复，没有一个需要注册账号。改完之后重新运行 Cover Your Tracks——从「唯一指纹」到「强保护」的变化会立竿见影，亲眼看到这个结果是值得的。

隐私保护是叠加的。修复一个泄漏不能解决所有问题，但它会缩小实际暴露的范围——而且清楚知道哪里在泄漏，总比猜测要好。
