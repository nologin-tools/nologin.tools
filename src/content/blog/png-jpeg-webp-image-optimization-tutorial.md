---
title: "PNG, JPEG, or WebP? A Practical Image Optimization Tutorial"
description: "A format-first guide to compressing, converting, and resizing images with no-login browser tools — includes specific quality settings and platform dimensions."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tutorial", "tools", "browser", "guide"]
featured: false
heroImageQuery: "image format comparison compression web optimization"
---

![Hero image](/blog/images/png-jpeg-webp-image-optimization-tutorial/hero.jpg)

Most people pick a file format by accident. They export from Figma, save from Photoshop, or take a screenshot — and whatever format comes out is what they use. Then they run it through a compressor hoping it gets smaller, without understanding why it might not shrink as much as expected.

Format choice matters more than compression settings. A JPEG compressed at quality 85 will be smaller than a PNG compressed at quality 85 — not because the compressor worked harder, but because JPEG and PNG encode image data differently at a fundamental level. Getting this decision right before you reach for a compression tool will save more bytes than any slider.

This tutorial covers the format decision first, then specific tools and settings for compression, conversion, and resizing. Everything here works without creating an account.

## The Format Decision You Should Make Before Anything Else

Three formats handle almost every web and everyday use case: JPEG, PNG, and WebP. Here's the honest breakdown:

**JPEG** is for photographs and images with continuous tone gradients — things like portraits, landscapes, food photos. It uses lossy compression that specifically exploits how human vision perceives color vs. brightness, which is why a JPEG photo at quality 80 looks nearly identical to the original at roughly half the file size. JPEG handles smooth color transitions well but falls apart at hard edges (text, logos, icons), where you'll see characteristic blocking artifacts.

**PNG** is for screenshots, illustrations, logos, icons, and anything that needs exact pixel values or transparency. PNG is lossless — it compresses without discarding any data. That's why a PNG of a photo is always larger than a JPEG of the same photo. Never use PNG for photographs. Always use PNG for things with sharp edges, transparency, or text.

**WebP** is for everything, at smaller sizes. [WebP](https://developers.google.com/speed/webp) produces files roughly 25–35% smaller than JPEG for photos and about 26% smaller than PNG for graphics, at equivalent visual quality. Browser support is now [97% globally](https://caniuse.com/webp) — Safari added support in 2020, which was the last holdout. For web use, there's rarely a reason to deliver JPEG or PNG when you can serve WebP instead.

The practical decision tree: if you're saving for the web, use WebP. If something specifically requires PNG (transparent background, exact color accuracy for print), use PNG. If you're sending to someone who needs to edit the image later, use JPEG for photos or PNG for graphics. If you're attaching to an email or uploading to a platform that doesn't support WebP, fall back to JPEG for photos and PNG for everything else.

## Compressing with Squoosh: Settings That Actually Matter

When you have a single image that needs careful compression — a hero image, a product shot, a portfolio piece — [Squoosh](https://squoosh.app) is the right tool. It's built by the Google Chrome team, runs entirely in WebAssembly, and your files never leave the browser.

Open Squoosh and drop your image. The interface splits into a before (left) and after (right) view with a draggable divider. In the right panel, choose your output format and adjust settings.

For web images, start with **WebP at quality 80**. That setting covers most use cases — it produces visually near-identical output at dramatically smaller file sizes compared to JPEG at the same quality number. The size estimate in the lower right updates as you drag the slider. Watch what happens between quality 75 and 85: you'll typically see significant byte savings going down to 75 with minimal visible change, then sharper visible degradation below 70. Quality 80 is the sweet spot for most photographic content.

For images with text, sharp lines, or transparency, switch the output format to **WebP (lossless)**. Squoosh will warn you that this is larger than lossy, but it preserves exact pixel values. Compare the result to a lossy compress and check whether the difference is visible at your display size.

Squoosh also handles resizing under the "Edit" panel. Enter a target width in pixels — or click the percentage toggle and enter 50% to halve dimensions — and enable the aspect ratio lock. The **Lanczos3** resize algorithm is the right choice for photographs; it preserves sharpness better than bilinear or box. For icons or pixel art being scaled up, use "Nearest Neighbor" to preserve hard edges rather than blurring them.

One thing Squoosh doesn't do: batch processing. It's one file at a time, which is fine for a specific image you're working on but impractical for 40 product photos.

## Batch Compression Without the Account Wall

When quantity matters more than per-image control, [TinyPNG](https://tinypng.com) handles up to 20 images at once with no account required. Drop a folder of images onto the upload box, and it processes them all in parallel.

TinyPNG's algorithm for PNG files uses selective color quantization: it reduces the number of distinct colors from up to 16 million down to a smaller palette, then applies standard compression on the result. The visual difference is typically imperceptible. PNG files commonly shrink 60–80% — sometimes more for simple graphics with large solid-color areas.

For JPEG files, TinyPNG re-encodes with more aggressive quantization and strips metadata (EXIF data, color profiles, embedded comments). A 3MB phone photo often comes out under 500KB. The algorithm makes the quality decision for you, and it's well-calibrated.

There's no daily limit on the 20-file free tier — each batch of 20 is independent. Finish one batch, drop another 20 images. For a batch of 200 photos, that's 10 drag-and-drops. Tedious, but it works without creating an account or paying for API access.

One honest limitation: TinyPNG uploads files to its servers. Images are deleted after a short period, but if you're compressing sensitive images (legal documents, medical photos, private material), stick with Squoosh's local processing instead. For product photos or blog images, server-side processing is a fine tradeoff.

## Resizing for Specific Platforms

"Resize to the right dimensions" sounds simple until you're looking at eight different recommended sizes for eight different platforms. Here are the current standard dimensions for common cases:

| Platform / Use case | Recommended dimensions | Format |
|---------------------|----------------------|--------|
| Web hero image | 1920×1080 or 1440×900 | WebP |
| Blog post image | 1200×675 (16:9) | WebP or JPEG |
| Open Graph / link preview | 1200×630 | JPEG (broad compat.) |
| Twitter/X post image | 1600×900 | JPEG or WebP |
| Instagram square | 1080×1080 | JPEG |
| Instagram Story / Reel | 1080×1920 | JPEG |
| LinkedIn banner | 1584×396 | JPEG |
| Email newsletter image | 600px wide max | JPEG |
| Favicon | 32×32, 180×180 (Apple) | PNG |

For resizing, the same tools that compress also resize. Squoosh (with the Edit panel open) and [ezGIF](https://ezgif.com) both let you specify exact pixel dimensions. For more control — cropping to an exact aspect ratio, repositioning content within a frame — [Photopea](https://www.photopea.com) is the most capable no-login option. It loads a full Photoshop-like editor in the browser and lets you use canvas size, crop, and image size controls exactly as you would in Photoshop, without any account.

## Converting HEIC and Other Awkward Formats

iPhones shoot HEIC by default (sometimes written as HEIF). It's an excellent format — smaller than JPEG with better quality — but it's still not broadly accepted. WordPress rejects it. Most web browsers won't display it. Email clients render it inconsistently.

For HEIC-to-JPEG conversion, [ezGIF](https://ezgif.com) handles it without signup. Go to the "Image Converter" tab, upload a HEIC file, choose JPEG as output, and download the result. The conversion works, though ezGIF isn't the fastest for large batches.

[Convertio](https://convertio.co) handles RAW camera formats (CR2, NEF, ARW), game textures (DDS), and HDR formats like EXR — things most image tools silently skip. Free conversions without an account are limited to around 10 per day and 100MB per file, which covers occasional use. Files are uploaded to Convertio's servers, so check their [privacy policy](https://convertio.co/privacy) for sensitive material.

For SVG files specifically: design tools like Figma export SVGs packed with editor metadata, inline styles, and numerical precision out to 8 decimal places. The files are technically valid but unnecessarily large. Run them through [SVGOMG](/tool/jakearchibald-github-io-svgomg) — a browser-based SVG optimizer — before deploying. Typical savings on a Figma export run 40–70%, processed entirely client-side.

## A Realistic Workflow for the Common Cases

For most people most of the time, the right workflow is:

**Phone photo → website**: Open in Squoosh, set output to WebP, quality 80, resize to 1200px wide. Done. File will be under 200KB for almost any photo.

**Product photos (batch)**: Drop up to 20 at a time into TinyPNG. Download, repeat. No format conversion, just size reduction.

**Screenshot → blog post**: Squoosh or TinyPNG. PNG screenshots of dark UIs compress especially well with lossless WebP.

**HEIC from iPhone → shareable JPEG**: ezGIF image converter, HEIC input, JPEG output.

**Logo or icon for website**: If you have the SVG, optimize with SVGOMG. If you need a PNG, export from your design tool then run through TinyPNG.

**Converting anything unusual**: Convertio for formats the other tools don't handle.

> The single best thing most people can do for their image files is switch from JPEG to WebP for web output. The second best thing is to resize to actual display dimensions before compressing — there's no point in delivering a 3000px-wide image that will be displayed at 800px. Both steps are free, instant, and require no account.

The tools described here are verified in the [nologin.tools directory](/tool/squoosh-app). The [HTTP Archive Web Almanac](https://almanac.httparchive.org/en/2024/media) consistently shows that images are the largest asset category on the web and that WebP/AVIF adoption remains well below what browsers could handle. The gap between what's technically possible and what most sites deliver is still large — and it closes one file at a time.

If you want a broader look at what these tools cover beyond the basics described here, the earlier post on [image compression and conversion tools](/blog/compress-convert-resize-images-no-login) covers format choices and tool tradeoffs in more depth.
