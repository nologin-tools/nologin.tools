---
title: "无需注册：在浏览器中压缩、转换和调整图片大小"
description: "最好用的浏览器端图像工具合集，涵盖压缩、格式转换和尺寸调整——无需账号，无需安装软件，不限上传次数。"
publishedAt: 2026-03-12
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "guide"]
featured: false
locale: zh
originalSlug: compress-convert-resize-images-no-login
sourceHash: 18af3124efd343de
heroImageQuery: "image compression file size browser tool"
---

![Hero image](/blog/images/compress-convert-resize-images-no-login/hero.jpg)

图片大约占据了普通网页重量的一半。不是 JavaScript，不是 CSS——是图片。然而，大多数人在需要压缩照片、把 PNG 转成 WebP，或者为特定平台调整图片尺寸时，随手找到的工具都要求先注册账号才能动一个滑块。

这对于一个五秒钟就能完成的任务来说，代价实在太高了。

有一整类图像工具完全在浏览器中运行，在客户端处理文件，不需要上传到服务器，也不需要你做任何事——开一个标签页就够了。有的是谷歌出品，有的是单个开发者维护、却拥有数百万月活用户的项目。全部免费，全部无需注册。

## 格式选择比你想的更重要

大多数人压缩图片时根本不考虑格式。手里有 JPEG，压小一点，完事。但实际上，格式选择对结果的影响往往超过压缩参数本身。

[WebP](https://developers.google.com/speed/webp) 是谷歌开发的格式，在同等视觉质量下，文件大小比 JPEG 小约 25–34%。AVIF 是 Netflix 和开放媒体联盟支持的更新格式，与 JPEG 相比可以减少高达 50% 的文件体积。这两种格式现在所有主流浏览器都支持。如果你在为网站优化图片，光是从 JPEG 换成 WebP，在不调整质量滑块的情况下就能减少三分之一的体积。

这就是为什么一个同时处理格式转换和压缩的工具，比只能压缩现有 JPEG 的工具更有价值。对大多数网页工作来说，答案就是：转成 WebP，压到约 80% 质量，搞定。两款无登录工具让这件事变得极其简单。

## Squoosh：首选工具

需要对输出有精细控制时，[Squoosh](https://squoosh.app) 是这个领域最强的选择。它是谷歌开发的开源工具，完全在 WebAssembly 中运行——文件永远不会离开你的浏览器。

工作流程是左右并排对比视图：左边原图，右边压缩预览。选择输出格式（MozJPEG、WebP、AVIF、JPEG XL、PNG、OxiPNG 等），拖动质量滑块，实时查看大小估算更新。差异显示会告诉你准确节省了多少 KB，以及相对于原图的百分比。

Squoosh 比大多数替代品更好的地方在于它不过度简化。如果你知道这些概念，可以调整色度子采样、选择编码速度、微调高级编解码器设置。或者忽略这些，只移动质量滑块。无论如何，你在确认之前都能看到实时预览——这在无登录工具中相当罕见。

它还支持调整尺寸：宽高带可选锁定长宽比，以及多种缩放算法（Lanczos 适合锐度，Mitchell 适合边缘略有振铃的照片）。完整功能列表见 [nologin.tools 上的 Squoosh 收录页](/tool/squoosh-app)。唯一限制：每次只处理一张图片，如果你有一整个文件夹的 50 张照片，这就有点麻烦了。

## TinyPNG：快速且完全免手动

[TinyPNG](https://tinypng.com) 解决了批量处理的问题。一次最多拖入 20 张图片（每张最大 5MB，无需账号），用有损优化压缩，以人眼几乎察觉不到的方式选择性减少色彩数量。PNG 文件通常能缩小 60–80%。JPEG 和 WebP 也支持。

操作体验就是一个拖放框、一个进度条和一个下载链接。没有任何需要配置的东西。这是设计选择——算法替你做决定，而且效果足够好，你大概不会质疑它。

与需要注册才能批量处理的工具不同，TinyPNG 的 20 张限制是按批次的，不是按天。第一批处理完后再拖入另外 20 张。对于上传画廊前需要处理照片的摄影师，或者部署前清理图像资源的开发者，这个工作流程无需注册就完全能撑住。

网页版使用的压缩质量同样可以通过开发者 API 和 WordPress 插件获得——但网页版是免费无登录的选项。[TinyPNG 在 nologin.tools 上的收录页](/tool/tinypng-com)详细说明了免费版和付费版的区别。

## ezGIF：名字远没反映出它的能力

这个名字严重低估了它。[ezGIF](https://ezgif.com) 是无需账号就能使用的功能最丰富的图像工具之一，能处理的远不止动图。

GIF 功能：从视频文件或图片序列创建，优化帧时序，减少颜色数量，裁剪、调整大小、反转、添加文字。GIF 优化器尤其有用——动态 GIF 以体积大著称，ezGIF 的优化通常能减少 30–40%，视觉质量几乎不损失。

但工具列表远不止 GIF。还有 JPG/PNG/WebP 优化器、支持百分比或像素尺寸的调整工具、格式转换器（支持 AVIF、HEIC、BMP、TIFF 和其他很多「现代」替代品悄悄跳过的格式），以及图片转 PDF、CSS 精灵图切割工具。

界面偏实用——顶部标签，上传框，下方显示结果。大概从 2014 年前后就没重新设计过，一眼就能看出来。但每个功能都能用，文件类型支持的广度相当罕见：iPhone 的 HEIC、扫描仪的 TIFF、新款相机的 AVIF。如果一种格式存在，ezGIF 大概率支持。完整介绍见 [ezGIF 在 nologin.tools 上的收录页](/tool/ezgif-com)。

## Convertio 和 SVGOMG：处理边缘情况

有些格式转换太冷门，大多数工具都不支持。[Convertio](https://convertio.co) 覆盖了图像、文档、音频和视频 300 多种格式。图像方面：支持 RAW 相机格式（CR2、NEF、ARW）、DDS（游戏贴图）、TGA、EXR（VFX 流水线的 HDR 格式），以及其他专项工具跳过的格式。

免注册的免费转换有合理的每日上限，每个文件最大 100MB。文件会上传到 Convertio 的服务器（不像 Squoosh 是客户端处理），所以处理敏感图片前，请先查看他们的[隐私政策](https://convertio.co/privacy)。转换产品 Mockup 从 RAW 到 JPG，或者图标从 SVG 到 ICO，完全没问题。如果是私密内容，不想放在陌生服务器上，Squoosh 的本地处理是更安全的选择。见 [Convertio 在 nologin.tools 上的收录页](/tool/convertio-co)。

SVG 是另一个问题。Figma 和 Adobe Illustrator 导出的 SVG 往往充斥着编辑器元数据、冗余的 group 元素、精度到小数点后 8 位的数字，以及本可以作为属性的内联样式。[SVGOMG](https://jakearchibald.github.io/svgomg/) 是 SVGO 的浏览器端前端——拖入 SVG，它去掉噪声，同时显示实时预览。Figma 导出物的典型节省幅度是 40–70%。切换面板让你禁用特定优化，以防某个优化影响了某个 SVG 技巧。无上传，无账号，全本地。收录页见 [SVGOMG 在 nologin.tools](/tool/jakearchibald-github-io-svgomg)。

## 哪种任务用哪个工具

说实话，这些工具之间并非竞争关系——它们覆盖的是不同需求：

| 任务 | 最佳工具 | 文件是否离开浏览器 |
|------|---------|-----------------|
| 压缩单张图片并精细控制格式 | Squoosh | 否 |
| 批量压缩 PNG/JPEG/WebP | TinyPNG | 是（服务端处理） |
| 创建或优化 GIF | ezGIF | 是（服务端处理） |
| 带算法选择的尺寸调整 | Squoosh 或 ezGIF | 否 / 是 |
| 冷门格式转换（RAW、DDS、EXR） | Convertio | 是（服务端处理） |
| 优化设计工具导出的 SVG | SVGOMG | 否 |

「文件是否离开浏览器」这一列对隐私至关重要。Squoosh 和 SVGOMG 从不向外发送文件——一切都在你的浏览器中用 WebAssembly 或 JavaScript 完成。TinyPNG、ezGIF 和 Convertio 会上传到服务器处理后返回结果。三家都声明了较短的保留期限（通常 24 小时或更短），但你需要信任他们的声明。

对大多数日常任务来说——压缩一张产品图、调整头图大小、把 JPEG 转成 WebP——服务端处理换来的便利和格式支持是合理的权衡。如果是医疗影像、法律文件，或者任何你不想放到陌生服务器上的私密内容：选 Squoosh。

> 能在不锁住你的情况下存活下来的工具，往往是真正优秀的那些。Squoosh 由 Google Chrome 团队维护，不是作为有变现计划的产品，而是作为现代图像编解码器的参考实现。这种激励机制的契合——「让网络图像压缩变得更好」——比「让用户创建账号」产出的工具质量要高得多。

根据 [HTTP Archive 的 Web Almanac](https://almanac.httparchive.org)，WebP 在网络上的普及率显著提升，但 JPEG 和 PNG 仍然占主导。现代浏览器支持的格式和大多数网站实际提供的格式之间的差距，意味着还有大量性能未被挖掘。缩小这个差距所需的工具，没有一个要求你先交出邮箱。

[nologin.tools 目录](/tool/nologin-tools)收录了经过验证的各类隐私友好工具。图像工具部分是比较完整的一个角落——已经有不少服务意识到「无需注册」是一种特性，而非妥协，而且这个合集还在持续增长。
