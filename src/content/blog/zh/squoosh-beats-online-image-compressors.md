---
title: "为什么 Squoosh 比其他所有在线图片压缩工具都强"
description: "Squoosh 完全在浏览器中完成图片压缩，无需上传。来看看这究竟意味着什么，以及它与其他工具相比表现如何。"
publishedAt: 2026-03-27
author: "nologin.tools"
tags: ["tools", "review", "browser", "open-source"]
featured: false
locale: zh
originalSlug: squoosh-beats-online-image-compressors
sourceHash: ac06129c46b666ba
heroImageQuery: "image compression WebAssembly browser tool"
---

![Hero image](/blog/images/squoosh-beats-online-image-compressors/hero.jpg)

大多数在线图片压缩工具的逻辑都是一样的：你上传文件，对方服务器跑压缩，然后把压缩后的文件发回来。听起来很简单。但这意味着你的图片——产品照片、客户素材、保密设计稿——在别人的服务器上存放了一段时间。你得信任他们的数据留存策略，还有他们的安全措施。

[Squoosh](https://squoosh.app) 走的是另一条路。每一个字节的压缩运算都发生在你的浏览器标签页里。没有任何数据离开你的设备。而且奇怪的是，尽管完全在客户端运行，它生成的文件往往比大多数服务端方案还要小。

## 底层原理：它究竟是怎么做到的

Squoosh 之所以能在没有服务器的情况下跑出专业级压缩效果，靠的是 WebAssembly。Google Chrome Labs 把 MozJPEG、OxiPNG、libwebp、libavif 和 JPEG XL 等编解码器直接编译成了 WASM 模块，在浏览器里以接近原生的速度执行。

这里说的 MozJPEG，就是 Mozilla 专门为改进原版 JPEG 编码器而开发的那个。这里说的 libavif，就是生产系统在用的那个。Squoosh 用的不是 JavaScript 重新实现的版本——它跑的是真正的压缩库，只是编译到了不同的目标平台。最终的输出质量和命令行工具是等价的。

从隐私角度来说：没有上传，就没有服务器，没有需要阅读的留存协议，也根本不存在第三方介入。你压缩的文件永远不会离开你的设备。这不是营销话术——这是工具工作原理的技术结论。

## 支持的格式（以及为什么这很关键）

这里是 Squoosh 超越普通工具的地方。大多数在线压缩工具支持 JPEG 和 PNG，部分支持 WebP，而 Squoosh 支持：

| 格式 | 编码器 | 最适合 |
|--------|---------|----------|
| JPEG | MozJPEG | 照片、高色彩图像 |
| PNG | OxiPNG | 截图、带透明度的图形 |
| WebP | libwebp | 网页图片，浏览器兼容性好 |
| AVIF | libavif | 现代浏览器，最佳压缩比 |
| JPEG XL | jxl | 未来格式，出色的画质 |
| WebP2 | 实验性 | 仅供研究/测试 |

AVIF 值得单独说一下。它源自 AV1 视频编解码器，在相同视觉质量下，文件体积比 WebP 小 20–50%，比 JPEG 小 50% 以上。[Google 关于 AVIF 的研究](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/speed/avif.md)显示它在大多数图片类型上都优于其他格式。目前 Chrome、Firefox、Safari、Edge 全都支持——也就是说你现在就可以在生产环境里用了。

Squoosh 让你无需安装任何东西就能直接编码成 AVIF。TinyPNG 不支持 AVIF。Convertio 支持，但需要上传到他们的服务器。如果你处理的是不想外泄的图片，这个区别就很重要了。

## 并排对比：别家都没有的功能

Squoosh 最实用的功能甚至不是编解码器的丰富程度，而是那个对比滑块。

在 Squoosh 里打开一张图片，你会看到一个分屏视图：左边是原图，右边是压缩后的结果。拖动中间的分隔线左右滑动来对比。调整质量参数时文件大小实时更新。你可以清楚地看到压缩噪点从哪里开始出现，然后往回调质量滑块直到它消失。

听起来很简单，确实也很简单。但没有其他免登录图片工具能做得这么好。[TinyPNG](https://nologin.tools/tool/tinypng-com) 是全自动压缩，没有任何质量控制——给你什么就是什么。[Convertio](/tool/convertio-co) 可以数字输入质量值，但没有可视化反馈。Squoosh 让你实时看到质量和体积之间的权衡，你能做出有依据的决定，而不是靠猜数字。

文件大小显示同时包含绝对数值（比如「1.2 MB → 340 KB」）和百分比缩减率。这才是你做决策需要的信息，不是「已优化！」——是实实在在的数字。

## 与常见替代品的横向对比

当你需要为 Web 项目压缩图片时，通常会想到 TinyPNG、Convertio、iLoveIMG 这类服务。它们都要求上传文件，免费版都有文件大小限制，大多数还有使用次数上限。

[TinyPNG](/tool/tinypng-com) 速度快，PNG 和 JPEG 的处理效果也不错，但它用的是自家压缩算法，不暴露质量控制参数。免费版每月上限 20 个文件，不支持 AVIF 或 JPEG XL，而且你的文件会传到他们位于荷兰的服务器上。

[Convertio](/tool/convertio-co) 支持大量格式，做格式转换确实很好用。但免费账户每天只能转换 10 次，文件大小上限 100 MB，转换在服务端进行——对于不敏感的文件倒无所谓。

Squoosh 没有文件大小限制，没有转换次数上限，也不需要账户。它甚至不存在「免费版」这个概念，因为根本没有需要花钱维护的服务器基础设施。唯一的限制是你浏览器的内存，在处理超大图片时（比如 5000 万像素以上的 RAW 文件）才会成为问题。

Squoosh 的短板在于：每次只能处理一张图片。如果你需要在一个会话里压缩 200 张产品图，Web 界面就不够用了。批量压缩的话，[Squoosh CLI](https://github.com/GoogleChromeLabs/squoosh/tree/dev/cli) 能解决这个问题——它作为 npm 包提供（`npx @squoosh/cli`），支持与 Web UI 相同的编码器。

## 开源的意义

Squoosh 以 Apache 2.0 协议[在 GitHub 上开源](https://github.com/GoogleChromeLabs/squoosh)。代码库公开，压缩在本地进行，Google Chrome Labs 一直把它作为 WebAssembly 能力的展示项目在维护。

这有几方面的意义。你可以验证这个工具没有对你的文件做任何意外的事情——因为没有服务器，所以也没什么可隐瞒的。你可以自己搭建一个实例。而且项目开源意味着社区可以审计 WASM 编解码器实现的改进。

如果你想深入了解基于 WebAssembly 构建的浏览器端工具，[Datasette Lite](/tool/lite-datasette-io) 是另一个例子——一个完整的 SQLite 数据库跑在浏览器标签页里。WASM 这个趋势值得关注，它正在催生一类以前根本不可能存在的免登录工具。

## 什么时候用 Squoosh，什么时候用别的

在以下情况下 Squoosh 是最优选择：

- 你处理的照片或图形不想上传到任何地方
- 你需要编码成 AVIF 或 JPEG XL 但不想安装软件
- 你想在下载前可视化地确认质量和体积之间的权衡
- 你需要把文件体积压到极限

批量处理用 Squoosh CLI。图片以外的格式转换（文档、音频、视频），[Convertio](/tool/convertio-co) 覆盖更广。专门针对 SVG，[SVGOMG](/tool/jakearchibald-github-io-svgomg) 在浏览器本地运行，SVG 优化效果比 Squoosh 更好。

Squoosh 独占优势的场景：你有一张高质量图片，在乎压缩质量，并且希望文件不要离开你的电脑。发给客户之前的产品摄影。医疗图像。个人照片。恰好是图片格式的法律文件。在这些情况下，把文件上传到第三方服务只是为了调个尺寸，实在是一笔划不来的买卖。

## 一个尊重你文件的工具

大多数免登录工具之所以「免登录」，是因为它们足够简单，账户系统根本没必要。Squoosh 不一样——它技术上完全可以要求账户和服务器基础设施，但它被刻意设计成在客户端运行。这是一个设计选择，而不是局限。

Web 越来越有能力在不依赖后端服务器的情况下运行真正的软件。Squoosh 从 2018 年就在证明这一点。编解码器不断改进，浏览器对 AVIF 的支持不断扩大，「上传到服务器」和「本地运行」之间的差距正在缩小。

如果你还没用过，[squoosh.app](https://squoosh.app) 无需注册，打开即用。拖入图片，对比结果，导出。就这样。想找更多这类工具——无账户、无上传、无追踪——[nologin.tools 目录](/tool/nologin-tools)收录了各个类别的几百款。
