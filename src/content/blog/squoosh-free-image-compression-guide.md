---
title: "Free Image Compression with Squoosh — No Account, No Upload"
description: "Step-by-step guide to compressing images with Squoosh in your browser. No login, no server upload — covers AVIF, WebP, JPEG, PNG settings and CLI batch use."
publishedAt: 2026-04-16
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "open-source"]
featured: false
heroImageQuery: "image compression browser WebAssembly optimize"
---

You need to compress an image. Ideally right now, without creating an account, without uploading your files to a server you don't control, and without playing quality-roulette with a tool that just outputs "compressed!" and tells you nothing. The usual suspects either cap you at 5MB on the free plan, watermark the output, or give you zero visibility into what they actually did to your file.

[Squoosh](https://squoosh.app) solves all of this. Open it in a browser tab, drop in your image, adjust the settings, download the result. No login required. No upload to a remote server. The compression happens inside your browser using WebAssembly modules compiled from the same codecs that production systems use — MozJPEG, libavif, OxiPNG, libwebp.

This guide covers how to use it effectively: which format to pick for which situation, which settings actually matter, and how to handle batch jobs without permanently installing anything.

## What Squoosh Actually Does (And Why That's Unusual)

Most online compressors upload your file to a backend server, run compression there, and return a smaller file. That means your images — client photos, confidential mockups, product shots before they're public — sit on someone else's server for some period of time. You're trusting their retention policy. Their security.

Squoosh compiles the compression codecs to WebAssembly and runs them locally in your tab. Nothing leaves your machine. This isn't a marketing claim — it's a consequence of the architecture. There's no server to upload to.

It's built and maintained by [Google Chrome Labs](https://github.com/GoogleChromeLabs/squoosh), open source under Apache 2.0. If you want a full breakdown of how it compares to alternatives like TinyPNG and Convertio, the [Squoosh review on this site](/blog/squoosh-beats-online-image-compressors) covers that head-to-head. This guide is practical: settings, workflows, decisions.

## Which Format Should You Use?

The first decision you'll make is the output format. This matters more than any quality slider, because different formats have fundamentally different strengths.

| Format | Best For | Browser Support | Size vs. JPEG |
|--------|----------|-----------------|---------------|
| MozJPEG | Photos, high color complexity | Universal | Baseline |
| OxiPNG | Transparent graphics, screenshots | Universal | Larger |
| WebP | General web images | All modern browsers | ~25% smaller |
| AVIF | Web images, best compression | Chrome, Firefox, Safari, Edge | ~50% smaller |
| JPEG XL | Future-proofing | Limited (experimental) | ~60% smaller |

For most web images in 2026, **AVIF is the right default**. It produces files 30-50% smaller than WebP at equivalent visual quality, and browser support now covers every major browser. If you need to support very old browsers or output images for a tool that doesn't handle modern formats, WebP is the safe fallback. JPEG stays relevant for universal compatibility — any platform, any viewer.

PNG is lossless. You'll reach for OxiPNG when transparency is required: icons, logos with transparent backgrounds, UI screenshots where pixel-perfect text rendering matters. Never PNG for photos. The files will be enormous.

JPEG XL is technically impressive but browser support is still inconsistent enough to skip for most production use.

## Settings That Actually Make a Difference

Once you've chosen a format, the quality slider is the main control. But "quality" means different things across codecs, and the numbers aren't directly comparable.

**Web photographs and hero images**: Start at AVIF quality 60-70. That sounds aggressive, but AVIF handles low quality settings far more gracefully than JPEG. At quality 60, a JPEG typically shows visible blocking artifacts; AVIF at the same nominal setting looks significantly cleaner. Use the comparison slider (more on this below) to confirm.

**Product photography for e-commerce**: WebP at quality 75-80, or MozJPEG at 75 if you need maximum format compatibility. Product images need fine detail at edges and textures — drop below quality 70 and you'll usually see softening on fabric, embossed text, and intricate shapes.

**Screenshots and UI captures**: OxiPNG with the compression level at 3. Higher levels reduce file size further but take meaningfully longer. Level 3 is the practical sweet spot for most screenshots. If the image has large areas of solid color (common in UI captures), OxiPNG will often beat AVIF because lossless compression handles uniform regions efficiently.

**Thumbnails and avatars**: WebP at quality 80, resized to the actual display dimension. Squoosh has a resize panel — use it. Serving a 3024-pixel original at 120px display size is one of the most common image performance mistakes, and no amount of compression fixes the underlying problem.

**Background images and textures**: These tolerate aggressive compression because they're seen in low visual focus. AVIF at quality 50-60 is usually fine; you're unlikely to notice any quality difference when an image sits behind text.

General rule: start at quality 75 for AVIF/WebP, or 80 for JPEG. Then use the comparison slider to see how far you can push it.

## Using the Comparison Slider Effectively

The comparison slider is what separates Squoosh from tools that hand you a result with no explanation. You get the original on the left, compressed output on the right, with real-time file size numbers at the bottom. Drag the divider to reveal either side.

The technique: center the slider, then focus on the parts of the image that compress worst — sharp edges, fine text, smooth color gradients, and human faces. These are where artifacts appear first. If you can't see a meaningful difference in these areas, the current quality setting is appropriate. If you see softening, blocking, or color banding, raise the quality.

With AVIF specifically, watch color transitions rather than just edges. AVIF can introduce subtle color banding in smooth gradients at low quality settings — it's most visible in sky photographs or backgrounds with soft color shifts, less so in detailed product photos.

For OxiPNG, the comparison slider mostly confirms the lossless compression worked correctly. Output should look identical to the original — if it doesn't, something unexpected happened (rare, but worth a quick check).

Once the quality looks right, check the file size reduction in the Squoosh interface. A reasonable result for web images is 60-80% smaller than the original. If you're getting less than 40% reduction on a JPEG photo converted to AVIF, try lowering quality further — you're almost certainly leaving savings on the table.

## Resizing: The Step People Skip

Quality settings aren't the only lever. Resizing to actual display dimensions often delivers bigger file size savings than any quality adjustment.

Squoosh's resize panel lets you set a target width or height. A few notes on the algorithm options: **Lanczos3** produces the sharpest result with minimal aliasing, and it's the right choice for most photos. **Triangle** is faster but softer. **Mitchell** falls between them.

Before touching the quality slider, ask whether you need the original resolution. If your site shows blog post images at 800px wide, serving a 3024-pixel original is wasted data even at maximum compression. Resize first, then compress. The combined savings are almost always larger than either approach alone.

Squoosh applies the resize before compression, which is the correct order. You set final dimensions in the resize panel, adjust quality in the compression panel, and the downloaded file reflects both changes.

## Going Beyond One File at a Time

Squoosh's web UI handles one image at a time. For compressing a folder of files in a single pass, the Squoosh CLI is the answer — and it requires no permanent installation.

With Node.js installed, run:

```bash
npx @squoosh/cli --avif '{"quality":65}' *.jpg
```

This compresses every JPEG in the current directory to AVIF at quality 65, writing output files alongside the originals with an `.avif` extension. For WebP: `--webp '{"quality":80}'`. For MozJPEG: `--mozjpeg '{"quality":75}'`. To resize while compressing: `--resize '{"width":1200}'`.

The CLI uses the same WebAssembly modules as the web UI, so output is identical. This is particularly useful for workflows where you have a folder of raw photographs that need to be web-ready before uploading to a CMS or publishing pipeline. No permanent install, no subscription, no server.

## When Squoosh Isn't the Right Tool

Squoosh handles raster images. For SVG files, [SVGOMG](/tool/jakearchibald-github-io-svgomg) is the equivalent — locally executed in your browser, no file size limits, no account required. Don't run SVGs through Squoosh.

For very large files — 100+ megapixel panoramas, TIFF files from medium format cameras — Squoosh may exhaust browser memory. Desktop tools handle these better.

If you need quick JPEG or PNG compression without quality control and you're not worried about file privacy, [TinyPNG](/tool/tinypng-com) is faster for that specific task. It automates the decision and skips the slider. Useful if you don't care about the tradeoff and just want something smaller.

For format conversion beyond images (documents, video, audio), Squoosh won't help — it's purpose-built for image compression.

## A Few Practices Worth Adopting

Rename files before downloading. Squoosh generates names like `image-compressed.avif`. If you process several files in a session without renaming, you'll end up with a folder of `image-compressed (1).avif`, `image-compressed (2).avif`, and so on.

Keep the original. AVIF and WebP compression is lossy. If you later need a different quality level or output format, you want to start from the original — compressing an already-compressed file stacks quality degradation.

Don't apply the same quality number to every image. A detailed close-up photograph compresses differently than a wide landscape at the same nominal setting. A quality value that's invisible degradation on one image might be clearly visible on another. The slider gives you the answer; trust it over fixed numbers.

---

Image optimization is one of those tasks that's worth getting right, and the right tool is free, works without an account, and runs entirely in your browser. For more tools in that category — no login, no upload, no tracking — [nologin.tools](/tool/nologin-tools) has hundreds organized by use case.
