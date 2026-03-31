---
title: "你的浏览器正在泄露数据——如何阻止它"
description: "你的浏览器会向每个网站暴露你的真实 IP、GPU、字体和时区。本文揭示哪些数据正在泄露，以及如何有效阻止。"
publishedAt: 2026-03-31
updatedAt: 2026-03-31
author: nologin.tools
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak surveillance"
locale: zh
originalSlug: browser-leaking-data-how-to-stop-it
sourceHash: fd14e428ffc082f9
---

![Hero image](/blog/images/browser-leaking-data-how-to-stop-it/hero.jpg)

打开一个全新的无痕标签页。没有 Cookie，没有历史记录，没有登录状态。你感觉自己是匿名的。

但其实根本不是。

EFF 的 [Panopticlick 研究](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) 发现，**83.6% 的浏览器拥有唯一指纹**——足以在你访问的每个网站上识别你的身份，而无需设置任何 Cookie。如果算上浏览器插件，这个数字会攀升到 94.2%。无痕模式对此毫无帮助，清空 Cookie 也同样无效。

下面就来聊聊，究竟什么数据在泄露，以及你能做什么。

## 你的浏览器实际上在发送什么

每次加载页面，你的浏览器都会主动向服务器汇报一大堆关于自身的信息。甚至在 JavaScript 执行之前，HTTP 请求头就已经暴露了你的浏览器名称和版本、操作系统、首选语言以及编码支持。这一切都是自动发生的，没有任何提示，没有任何授权。

JavaScript 让情况变得更糟。网站可以读取你的屏幕分辨率（包括任务栏占去的那部分）、精确的时区、CPU 核心数量、设备内存大小（四舍五入到最近的 2 的幂次，但仍然有价值），以及你偏好的配色方案。这些全都不需要任何权限弹窗。

现代指纹采集库（比如 FingerprintJS）可以收集每个浏览器 **100 多个独立属性**。把这些属性合并成一个哈希值，就能生成一个跨会话、跨浏览器、甚至在无痕模式下依然有效的标识符。FingerprintJS 声称，即使用户清空了 Cookie，他们识别回访用户的准确率仍高达 99.5%。

残酷的事实是：大多数人所理解的"保护隐私"——清 Cookie、用 VPN、开无痕——对指纹追踪根本没有任何作用。那些方法解决的是另一个问题。

## WebRTC 问题（以及为什么 VPN 帮不上忙）

WebRTC 是浏览器内视频通话的底层 API，Google Meet、Discord、Zoom 网页版都依赖它。它通过在浏览器之间建立点对点连接来工作，因此需要知道你的真实网络地址。

问题在于：任何网站只需几行 JavaScript 就能触发 WebRTC 连接尝试，不需要用户交互，也不需要任何权限。为了找到对等节点之间最快的路径，WebRTC 使用一种叫做 ICE（交互式连接建立）的协议，它会联系一个公共 STUN 服务器。而 STUN 服务器的响应中，包含了你的**真实公网 IP 地址**。

你的 VPN 拦截不了这个。WebRTC 流量使用 UDP，在操作系统网络层的处理方式与浏览器的 HTTP 流量不同。大多数 VPN 实现根本不拦截它。所以即使开着 VPN，一个网站也能用下面这段代码在一秒内拿到你的真实 IP：

```js
const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
pc.createDataChannel("");
pc.createOffer().then(o => pc.setLocalDescription(o));
pc.onicecandidate = e => { /* your real IP is in e.candidate.candidate */ };
```

这就是所谓的 WebRTC 泄露，商业指纹采集 SDK、广告技术平台和反欺诈系统都有记录在案。

**如何阻止：** Firefox 可以通过在 `about:config` 中将 `media.peerconnection.enabled` 设置为 `false` 来完全禁用 WebRTC。但这会导致浏览器内的视频通话无法使用，是个二选一的取舍。uBlock Origin 的高级设置里有一个"防止 WebRTC 泄露本地 IP 地址"选项，破坏性更小——它在允许 WebRTC 正常工作的同时，阻止本地 IP 暴露。Brave 则在其 Shields 面板中默认屏蔽本地 IP 泄露。

你可以用 [IPLeak](/tool/ipleak-net) 检测自己是否正在泄露——它会实时显示你的浏览器正在暴露的所有 WebRTC ICE 候选地址。

## DNS 泄露：VPN 的另一个漏洞

当你在浏览器中输入一个域名时，DNS 解析器会将它转换为 IP 地址。如果你使用 VPN，这个查询应该通过 VPN 隧道发送到你的 VPN 服务商的解析器——而不是你的 ISP。

所谓 DNS 泄露，就是查询仍然发到了 ISP，不管你用不用 VPN，ISP 都能看到你访问了哪些域名。流量内容依然是加密的，但 ISP 可以看到你在周二晚上 9 点 14 分访问了 `example.com`。这足以构建一份详细的行为画像。

DNS 泄露的原因通常很无聊。Windows 有一个叫做"智能多宿主名称解析"的功能，它会**同时**向所有可用的网络适配器发送 DNS 查询，并使用最快的响应。这意味着查询会同时发送到 VPN 解析器和 ISP 解析器。很多 VPN 客户端没有正确覆盖这个行为。

IPv6 是另一个常见原因。许多 VPN 只隧道化 IPv4 流量。如果你的路由器和操作系统支持 IPv6，通过该路径的 DNS 查询会完全绕过 VPN 隧道。

部分 ISP 还会使用透明 DNS 代理——拦截所有到 53 端口的出站 UDP 流量，强制重定向到他们自己的解析器，即使你已经把系统配置为使用 1.1.1.1 或 8.8.8.8 也没用。

**如何检测泄露：** 在 [DNS Leak Test](/tool/dnsleaktest-com) 运行扩展测试。它会向一组唯一子域发送 DNS 查询，并观察哪些解析器响应了。如果结果显示的是你的 ISP 服务器而不是 VPN 提供商的服务器，那就是确认泄露了。

修复方式取决于你的具体设置，但在浏览器中启用 DNS-over-HTTPS（DoH）是一个合理的起点，它完全绕过系统解析器。Firefox 的入口在"设置→隐私与安全→HTTPS 上的 DNS"，建议设置为"最大保护"，防止回退到系统解析器。

## Canvas 和音频指纹（更让人不安的部分）

即使屏蔽了 WebRTC，也保护好了 DNS，还有一类指纹技术完全不依赖网络——它利用的是你的硬件在渲染图形时产生的细微差异。

Canvas 指纹的原理是这样的：脚本在一个不可见的 `<canvas>` 元素上绘制文字和图形，然后读取像素数据。输出结果会因 GPU 型号、GPU 驱动版本、操作系统和字体渲染引擎的不同而产生细微但可测量的差异。macOS 用 CoreText，Windows 用 DirectWrite，Linux 用 FreeType，各自的子像素抗锯齿效果不同，每种 GPU 驱动的浮点数舍入行为也不一样。2014 年的学术论文《The Web Never Forgets》发现，当时排名前 10 万的网站中有 5% 部署了 Canvas 指纹技术，而那已经是十多年前的事了。

音频指纹类似。脚本创建一个 `AudioContext`，通过分析器运行振荡器，然后读取输出值。你的硬件处理音频时产生的细微浮点差异，具有足够的一致性，可以跨会话识别你。全程不需要麦克风权限。

Canvas 加 WebGL 指纹这两个信号各自携带大约 15 个比特以上的熵。这意味着大约每 32768 个浏览器中，才有一个与你的 Canvas 指纹相同。再结合你的屏幕分辨率、时区、CPU 核心数和 User-Agent，样本量就缩小到了 1。

> 讽刺的是：安装隐私扩展反而可能让你**更容易**被识别。如果你是少数几个在"中等模式"下运行 uBlock Origin 并搭配特定扩展组合的用户，这个配置本身就成了一个区分性信号。

## 现在就测试自己

在做任何改变之前，先弄清楚你实际上在暴露什么。

EFF 的 [Cover Your Tracks](/tool/coveryourtracks-eff-org) 是最好的起点。它将你的浏览器与数百万真实指纹的数据库进行比对，并告诉你你的浏览器有多独特，还会给出每个属性的熵值。"你的浏览器有唯一指纹"意味着你可以被识别；"强保护"意味着你的浏览器看起来和其他很多人一样——这才是真正的目标。

[BrowserLeaks](/tool/browserleaks-com) 更深入，提供 WebRTC 泄露、Canvas 指纹、WebGL 详情、已安装字体、TLS 指纹等独立测试页面。先跑 WebRTC 测试——它最可能给你惊喜。

[PrivacyTests](/tool/privacytests-org) 由一位前 Firefox 隐私工程师运营，在 20 多个隐私测试中对各浏览器进行横向对比。它不是测试你的特定浏览器，而是在标准化场景下比较 Chrome、Firefox、Brave、Safari 和 Tor Browser。在决定要不要换浏览器之前，值得读一读。

## 真正有效的措施

坦白说，没有任何单一设置能解决所有问题。但以下改变有经过验证的、有据可查的效果：

**换浏览器。** 这是影响最大的一步。Brave 默认屏蔽 WebRTC 本地 IP 暴露和 Canvas 指纹——它每次会话向 Canvas/音频输出添加随机噪音，使跨站关联变得不可能，同时不需要你破坏任何网站。Firefox 开启 `privacy.resistFingerprinting = true` 则采用不同的策略：将所有内容标准化，让你看起来像一个通用浏览器（固定屏幕尺寸 1000×900、UTC 时区、通用 UA 字符串）。这让你看起来和所有开启该设置的 Firefox 用户一样，这才是正确的模型。

| 浏览器 | Canvas 指纹 | WebRTC IP | DNS-over-HTTPS | 第三方 Cookie |
|---|---|---|---|---|
| Chrome | 无保护 | 泄露 | 可选 | 部分拦截 |
| Firefox（默认） | 无保护 | 泄露 | 可选 | 严格（ETP） |
| Firefox（RFP） | 随机化 | 禁用 | 可选 | 严格 |
| Brave | 随机化 | 已屏蔽 | 可选 | 已屏蔽 |
| Tor Browser | 统一化 | 禁用 | 不适用（走 Tor） | 已屏蔽 |

**安装 uBlock Origin。** 在 Firefox 上使用中等模式（默认拦截所有第三方脚本，按需白名单）。在高级设置中启用"防止 WebRTC 泄露本地 IP 地址"。这能在大多数指纹采集脚本运行之前就将其拦截。在 Chrome 上，趁 Google 的 Manifest V3 变更进一步限制扩展能力之前尽快用起来。

**启用 DNS-over-HTTPS。** Firefox 和 Chrome 现在都原生支持。推荐使用 Cloudflare（1.1.1.1）或 NextDNS。NextDNS 特别好用，它能让你看到浏览器正在解析哪些域名——对于审计页面上运行的内容非常有帮助。

**冻结你的 User-Agent。** 根据最初的 Panopticlick 研究，仅 UA 字符串就携带约 10.5 比特的熵。Firefox 的 `privacy.resistFingerprinting` 会自动处理这一点。在 Chrome 上，UA-CH API（User-Agent Client Hints）已逐渐取代旧的 UA 字符串，初衷是减少熵，但推进并不一致。

Tor Browser 仍然是指纹对抗的黄金标准。它将所有可指纹化的属性标准化，使所有 Tor 用户看起来完全一致——相同的 UA、相同的屏幕尺寸、相同的字体、相同的时区。目标是统一性，而不是拦截。每个 Tor Browser 用户看起来都一样，这是真正击败指纹追踪而不只是提高其成本的唯一方法。

对大多数人来说，Brave 或搭配 uBlock Origin 的 Firefox 能帮你实现 80% 的防护，同时不会搞坏你日常使用的网站。这是个合理的权衡。

你无法自行完全解决的是 TLS 指纹——你的浏览器在 HTTPS 握手期间发送的加密套件顺序和 TLS 扩展值，在网络层面足以识别你的浏览器，这发生在任何 HTTP 之前。Cloudflare 和其他 CDN 已经在使用 JA3 哈希（一种标准化的 TLS 指纹）进行机器人检测。没有任何浏览器扩展能触及这一层。这是个可以解决的问题，但只有浏览器自身才能修复它。

网络中内嵌的监控基础设施比大多数用户意识到的要多得多。好消息是，几个具体的改变——换一个更好的浏览器、装一个扩展、启用 DNS-over-HTTPS——能有效减少你的数据泄露。先从 Cover Your Tracks 开始，看看结果，再决定自己能接受什么程度的妥协。

还有一点值得一提：那些最尊重你隐私的工具，往往是不需要你提供身份信息的工具。无需注册就能使用的隐私友好工具，根本无法将你的会话数据关联到某个档案，因为根本就没有档案。如果你想了解有多少功能强大的免登录工具，[nologin.tools](/tool/nologin-tools) 维护着一份精选列表——从图片编辑器到文件共享再到开发工具，全部无需注册即可使用。这是在不影响效率的前提下，减少你在线足迹的实际方法。
