export interface RelatedArticle {
  slug: string;
  title: string;
  description: string;
  url: string;
}

interface ArticleMetaLocale {
  title: string;
  description: string;
}

interface ArticleMetaItem {
  en: ArticleMetaLocale;
  zh: ArticleMetaLocale;
}

const ARTICLES_META: Record<string, ArticleMetaItem> = {
  "photopea-vs-canva": {
    "en": {
      "title": "Photopea vs Canva: Which No-Login Design Tool Wins?",
      "description": "Photopea works without signup. Canva doesn't. A clear comparison of both tools for your next design task."
    },
    "zh": {
      "title": "Photopea vs Canva：哪款免登录设计工具更胜一筹？",
      "description": "Photopea 无需注册即可使用，Canva 不行。这篇对比帮你搞清楚两款工具的差异，找到适合你下一个设计项目的选择。"
    }
  },
  "canva-alternatives-no-login": {
    "en": {
      "title": "5 No-Login Alternatives to Canva for Quick Design",
      "description": "Canva demands your email. These browser-based design tools don't — and each is excellent at its specific job."
    },
    "zh": {
      "title": "5 款无需登录的 Canva 替代品，快速搞定设计",
      "description": "Canva 需要你的邮箱。这五款基于浏览器的设计工具不需要——每一款都在各自的领域表现出色。"
    }
  },
  "five-design-tools-no-account": {
    "en": {
      "title": "No Account Required: Five Tools for Every Design Task",
      "description": "Color palettes, font pairing, background removal, and diagrams done better by privacy-friendly browser tools."
    },
    "zh": {
      "title": "无需账号：五款覆盖各类设计任务的工具",
      "description": "配色方案、字体搭配、背景去除、演示文稿、流程图——这五款无需登录的浏览器工具，比 Canva 更专注，也更好用。"
    }
  },
  "excalidraw-free-whiteboard-no-login": {
    "en": {
      "title": "Excalidraw: Free Online Whiteboard, No Login Required",
      "description": "Excalidraw is a free, open-source whiteboard tool that works in your browser without signup. Draw diagrams with hand-drawn aesthetic."
    },
    "zh": {
      "title": "Excalidraw：免费在线白板，无需注册登录",
      "description": "Excalidraw 是一款免费开源的白板工具，直接在浏览器中使用，无需注册。支持手绘风格图表，协作数据端对端加密。"
    }
  },
  "excalidraw-privacy-review": {
    "en": {
      "title": "Is Excalidraw Private? Free Online Whiteboard, No Login",
      "description": "Excalidraw encrypts collaboration with cryptographic keys that never leave your browser. Learn how it stays private."
    },
    "zh": {
      "title": "Excalidraw 私密吗？免费在线白板，无需登录",
      "description": "Excalidraw 使用从不离开浏览器的密钥加密协作内容。了解这款免费白板如何在设计上保证你的图表私密性。"
    }
  },
  "open-source-tools-no-login": {
    "en": {
      "title": "Open Source Tools That Prove You Don't Need a Login",
      "description": "The best no-login tools are open source, allowing full mathematical verification of their zero-tracking claims."
    },
    "zh": {
      "title": "证明不需要登录的开源工具",
      "description": "最好的无需登录工具不仅跳过了注册表单——它们是开源的，你可以验证它们确实做到了所声称的事情。"
    }
  },
  "squoosh-beats-online-image-compressors": {
    "en": {
      "title": "Why Squoosh Beats Every Other Online Image Compressor",
      "description": "Squoosh performs lossy and lossless image compression entirely in your browser with zero remote file uploads."
    },
    "zh": {
      "title": "为什么 Squoosh 比其他所有在线图片压缩工具都强",
      "description": "Squoosh 完全在浏览器中完成图片压缩，无需上传。来看看这究竟意味着什么，以及它与其他工具相比表现如何。"
    }
  },
  "webassembly-no-login-browser-tools": {
    "en": {
      "title": "How WebAssembly Powers Free Browser Tools With No Login",
      "description": "WebAssembly lets browsers execute software at near-native speed — eliminating server dependencies and privacy compromises."
    },
    "zh": {
      "title": "WebAssembly 如何驱动无需登录的免费浏览器工具",
      "description": "WebAssembly 让浏览器能以接近原生的速度运行软件——这正是为什么越来越多的免费在线工具无需注册，也没有隐私代价。"
    }
  },
  "edit-pdf-without-installing-anything": {
    "en": {
      "title": "Edit a PDF in Your Browser Without Installing Anything",
      "description": "Practical guide to merging, splitting, compressing, and signing PDFs online without creating an account or installing software."
    },
    "zh": {
      "title": "在浏览器里编辑 PDF，不用安装任何东西",
      "description": "在线编辑 PDF 的实用指南——合并、压缩、填写表单、编辑文字，无需注册账号，无需安装软件。"
    }
  },
  "tinywow-review-free-tools-no-signup": {
    "en": {
      "title": "TinyWow Review: 50+ Free Tools With No Signup",
      "description": "TinyWow packs PDF, image, video, and AI tools into one site without asking for an email address."
    },
    "zh": {
      "title": "TinyWow 评测：50+ 款免费工具，无需注册",
      "description": "TinyWow 把 PDF、图像、视频和 AI 工具整合在一个网站里，无需邮箱注册。本文告诉你它哪里做得好、哪里有所欠缺。"
    }
  },
  "hat-sh": {
    "en": {
      "title": "hat.sh: Encrypt Files in Your Browser Without Trusting Anyone",
      "description": "hat.sh encrypts and decrypts files using AES-256-GCM directly in your browser with true zero-knowledge privacy."
    },
    "zh": {
      "title": "hat.sh：在浏览器里加密文件，不需要信任任何人",
      "description": "hat.sh 直接在浏览器中使用 AES-256-GCM 加密和解密文件。无需上传、无需服务器、无需账号——你的数据始终不离开本机。"
    }
  },
  "practical-guide-tools-without-email": {
    "en": {
      "title": "Use Online Tools Without Giving Away Your Email: A Practical Guide",
      "description": "Learn which tools skip signup entirely and how to safeguard your personal inbox from predatory data brokers."
    },
    "zh": {
      "title": "免邮箱使用在线工具：守护数字隐私的实操指南",
      "description": "大多数免费在线工具其实并不需要你的邮箱——它们索要邮箱只是为了营销。本文教你如何甄别免注册工具，并在遭遇强制注册壁垒时有效应对。"
    }
  },
  "jwt-io": {
    "en": {
      "title": "JWT.io: Instantly Decode Any Auth Token Without Installing Anything",
      "description": "JWT.io is the standard browser tool for decoding and verifying JSON Web Tokens without installation or account signups."
    },
    "zh": {
      "title": "JWT.io：无需安装任何东西，即刻解码任意 Auth Token",
      "description": "JWT.io 是解码和验证 JSON Web Token 的首选浏览器工具——无需注册，无需安装，所有处理均在浏览器本地完成。"
    }
  },
  "audiomass-co": {
    "en": {
      "title": "AudioMass: In-Browser Digital Audio Workstation (DAW) Without Installs",
      "description": "Record, slice, filter, and master audio tracks directly in your browser with full waveform visualization."
    },
    "zh": {
      "title": "AudioMass：一款完全运行在浏览器里的音频编辑器",
      "description": "AudioMass 是一款免费开源的网页音频编辑器——支持剪切、裁剪、应用效果和导出音频，无需安装软件，无需注册账号。"
    }
  },
  "cfiresim-com": {
    "en": {
      "title": "cFIREsim: Retirement Portfolio Monte Carlo Simulator",
      "description": "Run your retirement portfolio through 150 years of market history to test financial independence — no account required."
    },
    "zh": {
      "title": "4% 法则只是起点。cFIREsim 才能告诉你计划是否真的能撑下去",
      "description": "cFIREsim 将你的退休投资组合放到 150 年真实市场历史中反复模拟，揭示财务独立的关键所在——无需注册账号。"
    }
  },
  "fffuel-co": {
    "en": {
      "title": "Fffuel: 40+ SVG Generators for Design Assets Without Signup",
      "description": "Generate colorful SVG blobs, waves, noise textures, and organic gradients without logging in or paying subscriptions."
    },
    "zh": {
      "title": "40+ 设计工具一站搞定：Fffuel 无需注册，直接用",
      "description": "Fffuel 是免费的浏览器端 SVG 生成工具合集，涵盖背景、图案、渐变和纹理——无需账号。"
    }
  },
  "learngitbranching-js-org": {
    "en": {
      "title": "Learn Git Branching: Visual and Interactive Git Simulation",
      "description": "Master Git rebasing, branching, and cherry-picking through an interactive visual sandbox game in your browser."
    },
    "zh": {
      "title": "告别死记硬背 Git 命令：用可视化方式真正学懂 Git 分支",
      "description": "Learn Git Branching 把程序员最头疼的 Git，变成了一款可以直接在浏览器里玩的交互式可视化益智游戏。"
    }
  },
  "phet-colorado-edu": {
    "en": {
      "title": "PhET Simulations: 150+ Interactive Science Labs Without Signup",
      "description": "University of Colorado STEM simulations for physics, chemistry, and biology accessible to any browser without an account."
    },
    "zh": {
      "title": "PhET 模拟实验：150+ 个浏览器科学实验室，无需注册",
      "description": "科罗拉多大学博尔德分校出品的 PhET 互动模拟，让你在任意浏览器中体验真实的 STEM 实验——完全免费，无需账号。"
    }
  },
  "phind-com": {
    "en": {
      "title": "Phind: The AI Search Engine That Answers Like a Senior Developer",
      "description": "Phind combines live web search with AI reasoning to provide technical answers with runnable code and source citations."
    },
    "zh": {
      "title": "Phind：像资深开发者一样回答问题的 AI 搜索引擎",
      "description": "Phind 将实时网络搜索与 AI 推理相结合，附带代码示例和上下文回答编程问题——无需登录，无需注册。"
    }
  },
  "free-ai-tools-no-login": {
    "en": {
      "title": "Free AI Tools That Don't Need Your Email Address",
      "description": "The best free AI utilities that work without login or accounts — from code assistants to instant image isolation."
    },
    "zh": {
      "title": "不需要邮箱的免费 AI 工具",
      "description": "大多数 AI 工具都要求你注册才能使用。这里整理了最好用的免费 AI 工具，无需登录——从聊天机器人到图像生成器，一网打尽。"
    }
  },
  "browser-leaking-data-how-to-stop-it": {
    "en": {
      "title": "How Browsers Leak Data and How to Stop It",
      "description": "Discover how fingerprinting and tracking scripts harvest your data, and use no-login tools to protect your privacy."
    },
    "zh": {
      "title": "你的浏览器正在泄露数据——如何阻止它",
      "description": "你的浏览器会向每个网站暴露你的真实 IP、GPU、字体和时区。本文揭示哪些数据正在泄露，以及如何有效阻止。"
    }
  },
  "notion-alternatives-no-login": {
    "en": {
      "title": "Notion Alternatives That Work Without an Account",
      "description": "Local-first workspaces for writing, diagrams, and personal note-taking with zero forced signup funnels."
    },
    "zh": {
      "title": "不注册也能用的 Notion 替代品",
      "description": "需要写作、画图或做笔记，却不想再注册一个账号？这些工具覆盖了 Notion 最常用的功能，完全无需注册。"
    }
  },
  "google-docs-alternatives-no-login": {
    "en": {
      "title": "5 Free Google Docs Alternatives That Work Without an Account",
      "description": "Browser-based markdown and document editors that let you draft and export documents without signing into Google."
    },
    "zh": {
      "title": "5 款无需账号的免费 Google Docs 替代品",
      "description": "需要在不登录 Google 账号的情况下写作或协作？这五款免费浏览器工具让你无需账号、免注册即可创建和分享文档。"
    }
  },
  "clideo-com": {
    "en": {
      "title": "Clideo: Video and Audio Tools in Your Browser, No Account Required",
      "description": "Trim, compress, convert, and merge video and audio files in your browser without desktop software installs."
    },
    "zh": {
      "title": "Clideo：20 多款音视频工具，无需账号，浏览器直接用",
      "description": "Clideo 把完整的媒体编辑工具包搬进了浏览器——无需安装任何软件，无需注册账号，即可剪辑、压缩、转换和合并视频及音频文件。"
    }
  },
  "huggingface-co-chat": {
    "en": {
      "title": "HuggingChat: Access 100+ Open-Source AI Models Without an Account",
      "description": "Instant browser access to open-source foundation models (Llama, DeepSeek, Qwen) without account requirements."
    },
    "zh": {
      "title": "HuggingChat：无需账号，畅玩 100+ 开源 AI 模型",
      "description": "HuggingChat 让你在浏览器里即刻访问 Llama、DeepSeek、Qwen 等 100+ 款模型——无需注册。"
    }
  },
  "when2meet-com": {
    "en": {
      "title": "Schedule Group Meetings Without Anyone Creating an Account",
      "description": "Find meeting times across teams and clients in seconds without forcing organizers or participants to sign up."
    },
    "zh": {
      "title": "告别邮件轮询：无需任何人注册，就能搞定团队会议时间",
      "description": "when2meet 让所有人都能快速找到共同的空闲时段——无需注册，无需下载 App，对组织者和参与者都零门槛。"
    }
  },
  "write-as": {
    "en": {
      "title": "Write.as: Publish to the Web Without Giving Anyone Your Email",
      "description": "Publish anonymous text and articles to the web with zero tracking, no accounts, and instant permalinks."
    },
    "zh": {
      "title": "Write.as：无需注册，直接把文字发布到互联网",
      "description": "Write.as 让你瞬间发布内容到网络——无需账号，无追踪，无任何阻碍。打开编辑器，开始写作就行了。"
    }
  }
};

const TOOL_TO_BLOG_MAP: Record<string, string[]> = {
  "photopea-com": [
    "photopea-vs-canva",
    "canva-alternatives-no-login",
    "five-design-tools-no-account"
  ],
  "excalidraw-com": [
    "excalidraw-free-whiteboard-no-login",
    "excalidraw-privacy-review",
    "open-source-tools-no-login"
  ],
  "squoosh-app": [
    "squoosh-beats-online-image-compressors",
    "webassembly-no-login-browser-tools",
    "five-design-tools-no-account"
  ],
  "tinypng-com": [
    "squoosh-beats-online-image-compressors"
  ],
  "tools-pdf24-org-en": [
    "edit-pdf-without-installing-anything"
  ],
  "hat-sh": [
    "hat-sh",
    "practical-guide-tools-without-email"
  ],
  "jwt-io": [
    "jwt-io"
  ],
  "audiomass-co": [
    "audiomass-co"
  ],
  "audiotrimmer-com": [
    "audiomass-co"
  ],
  "cfiresim-com": [
    "cfiresim-com"
  ],
  "fffuel-co": [
    "fffuel-co",
    "canva-alternatives-no-login"
  ],
  "learngitbranching-js-org": [
    "learngitbranching-js-org"
  ],
  "phet-colorado-edu": [
    "phet-colorado-edu"
  ],
  "phind-com": [
    "phind-com",
    "free-ai-tools-no-login"
  ],
  "tinywow-com": [
    "tinywow-review-free-tools-no-signup",
    "edit-pdf-without-installing-anything"
  ],
  "privacytests-org": [
    "browser-leaking-data-how-to-stop-it"
  ],
  "temp-mail-org": [
    "practical-guide-tools-without-email",
    "browser-leaking-data-how-to-stop-it"
  ],
  "haveibeenpwned-com": [
    "practical-guide-tools-without-email"
  ],
  "dillinger-io": [
    "google-docs-alternatives-no-login",
    "notion-alternatives-no-login"
  ],
  "tldraw-com": [
    "notion-alternatives-no-login",
    "excalidraw-free-whiteboard-no-login"
  ],
  "remove-bg": [
    "free-ai-tools-no-login",
    "five-design-tools-no-account"
  ],
  "coolors-co": [
    "five-design-tools-no-account"
  ],
  "favicon-io": [
    "five-design-tools-no-account"
  ],
  "gchq-github-io-cyberchef": [
    "open-source-tools-no-login"
  ],
  "devdocs-io": [
    "open-source-tools-no-login"
  ],
  "svgedit-netlify-app-editor-index-html": [
    "canva-alternatives-no-login"
  ],
  "clideo-com": [
    "clideo-com"
  ],
  "huggingface-co-chat": [
    "huggingface-co-chat",
    "free-ai-tools-no-login"
  ],
  "when2meet-com": [
    "when2meet-com"
  ],
  "write-as": [
    "write-as",
    "google-docs-alternatives-no-login"
  ]
};

export function getRelatedArticlesForTool(toolSlug: string, locale: string = 'en'): RelatedArticle[] {
  const slugs = TOOL_TO_BLOG_MAP[toolSlug];
  if (!slugs || slugs.length === 0) return [];
  const isZh = locale === 'zh';
  return slugs
    .map((slug) => {
      const meta = ARTICLES_META[slug];
      if (!meta) return null;
      const text = isZh && meta.zh ? meta.zh : meta.en;
      const url = isZh ? `/zh/blog/${slug}` : `/blog/${slug}`;
      return {
        slug,
        title: text.title,
        description: text.description,
        url,
      };
    })
    .filter((a): a is RelatedArticle => a !== null);
}

export interface MentionedTool {
  slug: string;
  name: string;
  hostname: string;
  url: string;
  description: string;
  category: string;
}

interface ToolMetaItem {
  name: string;
  url: string;
  category: string;
  en: string;
  zh: string;
}

const TOOLS_META: Record<string, ToolMetaItem> = {
  "photopea-com": {
    "name": "Photopea",
    "url": "https://www.photopea.com",
    "category": "Design",
    "en": "Advanced in-browser raster and vector image editor supporting PSD, XCF, and Sketch.",
    "zh": "功能强大的免登录在线图像设计与 PSD/Sketch 编辑器。"
  },
  "excalidraw-com": {
    "name": "Excalidraw",
    "url": "https://excalidraw.com",
    "category": "Design",
    "en": "End-to-end encrypted virtual whiteboard for hand-drawn style sketches and diagrams.",
    "zh": "支持端到端加密、零数据泄露的手绘风格协同白板。"
  },
  "squoosh-app": {
    "name": "Squoosh",
    "url": "https://squoosh.app",
    "category": "Design",
    "en": "Google-engineered in-browser image compressor utilizing client-side WebAssembly.",
    "zh": "基于 WebAssembly 的纯本地无损/有损图片压缩工具。"
  },
  "tinypng-com": {
    "name": "TinyPNG",
    "url": "https://tinypng.com",
    "category": "Design",
    "en": "Smart lossy compression for WebP, PNG, and JPEG images.",
    "zh": "老牌高效的 WebP/PNG/JPEG 智能图片有损压缩工具。"
  },
  "tools-pdf24-org-en": {
    "name": "PDF24 Tools",
    "url": "https://tools.pdf24.org/en/",
    "category": "Productivity",
    "en": "Complete browser-based PDF toolbox for merging, splitting, compressing, and editing.",
    "zh": "无限制的在线 PDF 工具箱，支持合并、拆分、压缩与格式转换。"
  },
  "hat-sh": {
    "name": "hat.sh",
    "url": "https://hat.sh",
    "category": "Privacy",
    "en": "Client-side AES-256-GCM file encryption and decryption in your browser.",
    "zh": "基于 Web Crypto API 的纯浏览器端 AES-256-GCM 文件强加密工具。"
  },
  "jwt-io": {
    "name": "JWT.io",
    "url": "https://jwt.io",
    "category": "Development",
    "en": "Decode, verify, and generate JSON Web Tokens directly in the browser.",
    "zh": "主流的 JWT 令牌在线解码与有效性验证工具。"
  },
  "audiomass-co": {
    "name": "AudioMass",
    "url": "https://audiomass.co",
    "category": "Media",
    "en": "Full-featured in-browser digital audio workstation (DAW) and waveform editor.",
    "zh": "完全运行在浏览器中的开源音频剪辑工作站与波形编辑器。"
  },
  "audiotrimmer-com": {
    "name": "AudioTrimmer",
    "url": "https://audiotrimmer.com",
    "category": "Media",
    "en": "Fast, simple online audio cutter and MP3 trimmer.",
    "zh": "快速易用的在线音频剪切与铃声裁剪工具。"
  },
  "cfiresim-com": {
    "name": "cFIREsim",
    "url": "https://cfiresim.com",
    "category": "Finance",
    "en": "Retirement portfolio Monte Carlo and historical market independence simulator.",
    "zh": "基于 150 年真实市场数据的退休投资组合独立性模拟器。"
  },
  "fffuel-co": {
    "name": "Fffuel",
    "url": "https://fffuel.co",
    "category": "Design",
    "en": "Generative SVG design asset tools for textures, blobs, waves, and organic meshes.",
    "zh": "拥有 40+ 种矢量生成器的 SVG 纹理、渐变与流体背景工具箱。"
  },
  "learngitbranching-js-org": {
    "name": "Learn Git Branching",
    "url": "https://learngitbranching.js.org",
    "category": "Education",
    "en": "Interactive visual simulation game to master Git branching and commands.",
    "zh": "交互式 Git 分支可视化沙盒模拟教学游戏。"
  },
  "phet-colorado-edu": {
    "name": "PhET Interactive Simulations",
    "url": "https://phet.colorado.edu",
    "category": "Education",
    "en": "150+ interactive science and math simulations from University of Colorado.",
    "zh": "科罗拉多大学出品的 150+ 物理/化学/数学交互式 STEM 科学实验室。"
  },
  "phind-com": {
    "name": "Phind",
    "url": "https://www.phind.com",
    "category": "AI",
    "en": "AI-powered technical search engine delivering direct answers and code snippets.",
    "zh": "面向程序员的高质量技术问答 AI 搜索引擎。"
  },
  "tinywow-com": {
    "name": "TinyWow",
    "url": "https://tinywow.com",
    "category": "Productivity",
    "en": "Multi-utility platform offering 50+ free tools for PDF, image, and video editing.",
    "zh": "整合 50+ 款 PDF、图像及音视频处理工具的免费多功能平台。"
  },
  "privacytests-org": {
    "name": "PrivacyTests",
    "url": "https://privacytests.org",
    "category": "Privacy",
    "en": "Open-source tests auditing web browser privacy and fingerprint resistance.",
    "zh": "开源透明的主流网页浏览器隐私泄露与指纹防御测试平台。"
  },
  "temp-mail-org": {
    "name": "Temp Mail",
    "url": "https://temp-mail.org",
    "category": "Privacy",
    "en": "Disposable temporary email address generator to protect your primary inbox.",
    "zh": "无需注册的一次性临时邮箱服务，专用于拦截垃圾邮件与绕过注册墙。"
  },
  "haveibeenpwned-com": {
    "name": "Have I Been Pwned",
    "url": "https://haveibeenpwned.com",
    "category": "Privacy",
    "en": "Check if your email or password has been exposed in a known data breach.",
    "zh": "权威的数据泄露排查工具，利用 k-匿名机制安全查询泄露记录。"
  },
  "dillinger-io": {
    "name": "Dillinger",
    "url": "https://dillinger.io",
    "category": "Writing",
    "en": "Cloud-enabled browser markdown editor with styled HTML and PDF export.",
    "zh": "优雅好用的云就绪 Markdown 在线编辑器，支持导出排版 HTML 与 PDF。"
  },
  "tldraw-com": {
    "name": "tldraw",
    "url": "https://www.tldraw.com",
    "category": "Design",
    "en": "Infinite canvas virtual whiteboard for fast sketching, notes, and architecture diagrams.",
    "zh": "极简流畅的无限画布在线绘图、草图与架构白板工具。"
  },
  "remove-bg": {
    "name": "Remove.bg",
    "url": "https://www.remove.bg",
    "category": "Design",
    "en": "Instant AI background removal for photos and product images.",
    "zh": "一键智能自动识别人像与主体的在线抠图去背景工具。"
  },
  "coolors-co": {
    "name": "Coolors",
    "url": "https://coolors.co",
    "category": "Design",
    "en": "Superfast color palette generator with instant lock, randomize, and export.",
    "zh": "深受设计师喜爱的超快在线调色板与色彩搭配生成器。"
  },
  "favicon-io": {
    "name": "Favicon.io",
    "url": "https://favicon.io",
    "category": "Design",
    "en": "Generate web favicons instantly from text, images, or emojis.",
    "zh": "支持从文本、图片或 Emoji 瞬间生成多尺寸网页 Favicon 图标。"
  },
  "gchq-github-io-cyberchef": {
    "name": "CyberChef",
    "url": "https://gchq.github.io/CyberChef",
    "category": "Development",
    "en": "The Cyber Swiss Army Knife for encryption, encoding, compression, and analysis.",
    "zh": "英国政府通信总部 (GCHQ) 开源的网络瑞士军刀，支持百种编码转换。"
  },
  "devdocs-io": {
    "name": "DevDocs",
    "url": "https://devdocs.io",
    "category": "Development",
    "en": "Fast, offline-capable unified developer API documentation search.",
    "zh": "全能离线开发者 API 文档检索工具，毫秒级即时搜索。"
  },
  "svgedit-netlify-app-editor-index-html": {
    "name": "SVG-Edit",
    "url": "https://svgedit.netlify.app/editor/index.html",
    "category": "Design",
    "en": "Browser-based open-source vector graphics editor.",
    "zh": "基于浏览器的成熟开源矢量图形（SVG）在线编辑器。"
  },
  "clideo-com": {
    "name": "Clideo",
    "url": "https://clideo.com",
    "category": "Media",
    "en": "All-in-one browser video and audio manipulation suite.",
    "zh": "涵盖视频剪切、合并、压缩与格式转换的在线多媒体套件。"
  },
  "huggingface-co-chat": {
    "name": "HuggingChat",
    "url": "https://huggingface.co/chat",
    "category": "AI",
    "en": "Instant access to open-source LLMs without mandatory signups.",
    "zh": "Hugging Face 出品的免注册开源大模型在线对话体验平台。"
  },
  "when2meet-com": {
    "name": "When2meet",
    "url": "https://www.when2meet.com",
    "category": "Communication",
    "en": "Dead-simple group meeting scheduling grid without accounts.",
    "zh": "零账号门槛、极简直观的多人聚会与会议时间投票工具。"
  },
  "write-as": {
    "name": "Write.as",
    "url": "https://write.as",
    "category": "Writing",
    "en": "Minimalist, distraction-free publishing platform with zero accounts required.",
    "zh": "主打极简纯粹、开箱即写即发布的无账号匿名写作平台。"
  }
};

export function getToolsForBlogArticle(articleSlug: string, locale: string = 'en'): MentionedTool[] {
  const isZh = locale === 'zh';
  const matchedSlugs: string[] = [];

  for (const [toolSlug, blogSlugs] of Object.entries(TOOL_TO_BLOG_MAP)) {
    if (blogSlugs.includes(articleSlug)) {
      matchedSlugs.push(toolSlug);
    }
  }

  return matchedSlugs
    .map((slug) => {
      const tool = TOOLS_META[slug];
      if (!tool) return null;
      let hostname = '';
      try {
        hostname = new URL(tool.url).hostname.replace(/^www\./, '');
      } catch {}
      return {
        slug,
        name: tool.name,
        hostname,
        url: tool.url,
        description: isZh && tool.zh ? tool.zh : tool.en,
        category: tool.category,
      };
    })
    .filter((t): t is MentionedTool => t !== null);
}
