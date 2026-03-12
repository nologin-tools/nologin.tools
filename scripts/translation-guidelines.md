# Translation Style Guidelines

This document provides detailed per-language style instructions for translating nologin.tools content.
Claude translation agents MUST read and follow these guidelines precisely.

---

## Universal Principles (All Languages)

### Core Rule: REWRITE, Don't Translate
The output must read as if it was **originally written** in the target language — not translated from English.

### Sentence Structure
- **Break long English compound sentences** into multiple shorter sentences that match target-language rhythm
- English relative clauses and participial phrases should often become separate sentences
- Vary sentence length — alternate short punchy sentences with longer ones

### Idioms & Expressions
- **Never translate English idioms literally** — replace with a natural equivalent in the target language
- If no equivalent exists, convey the meaning in plain language rather than forcing a metaphor

### Paragraph Structure
- Paragraphs **do not need to map 1:1** to English paragraphs
- Feel free to split, merge, or reorder sentences within a paragraph for better flow
- Each paragraph should have one clear point

### Tone Preservation
- Maintain the original's argumentation logic and viewpoints
- Preserve the casual-but-professional tone of tech blog writing
- Keep the same level of enthusiasm or criticism as the original

### Technical Terms
- Keep brand names (nologin.tools, NoLoginTools.org) in English
- Keep code, URLs, `{placeholders}`, and command-line examples unchanged
- For widely-known tech terms, prefer the target language's established convention

---

## Chinese (zh) — 简体中文

### Style Reference
Write like 少数派 (sspai.com) or V2EX technical blogs — conversational yet professional, never stiff or academic.

### Sentence & Paragraph Rules
- **2-4 sentences per paragraph**, avoid paragraphs exceeding 100 characters
- Avoid stacking multiple 的 (de) — rewrite using shorter clauses instead
- Use 你 to address the reader directly; keep the tone relaxed and approachable

### Punctuation & Spacing
- Use Chinese full-width punctuation（，。！？：；）
- Add a space between Chinese and English/numbers（如「使用 Photopea 进行编辑」）
- No space before full-width punctuation

### Common Mistranslation Traps
| English | ❌ Bad Translation | ✅ Natural Chinese |
|---------|-------------------|-------------------|
| That's the deal | 那就是交易 | 说白了就是这样 / 代价就是 |
| fund the free tier | 资助免费层级 | 支撑免费服务 |
| leave behind | 留在身后 | 留下 |
| at the end of the day | 在一天结束的时候 | 归根结底 / 说到底 |
| it's a no-brainer | 这是没有脑子的 | 这根本不用想 |
| under the hood | 在引擎盖下 | 底层实现是 / 背后的原理是 |
| out of the box | 开箱即用 | 开箱即用 ✓ (this one works) |

### Voice & Personality
- Sprinkle in natural Chinese internet expressions where appropriate（比如「确实」「真的绷不住」「属于是」）— but don't overdo it
- Use rhetorical questions to engage readers（「谁不想要免费又好用的工具呢？」）
- OK to start sentences with 其实、说实话、不过 for a conversational feel

---

## Japanese (ja) — 日本語

### Style Reference
Write like Zenn.dev or Qiita technical articles — clear, concise, and well-structured.

### Formality
- Use **敬体 (です/ます調)** consistently throughout — never mix with 常体
- Maintain polite but not overly formal tone

### Word Choice
- Prefer native Japanese words over katakana loanwords when a common Japanese equivalent exists
  - ✅ 画面 over ❌ スクリーン
  - ✅ 操作 over ❌ オペレーション
  - But keep established tech terms: ブラウザ, ツール, アプリ are fine
- Use Japanese conjunctions naturally:（また、さらに、一方で、ただし）

### Japanese-Specific Expressions
- Use hedging expressions naturally:「〜かもしれません」「〜と言えるでしょう」「〜ではないでしょうか」
- These add the nuanced, thoughtful tone expected in Japanese tech writing
- Keep paragraphs short — one key point per paragraph

### Formatting
- Use full-width punctuation（。、！？）
- Half-width for numbers and English terms

---

## Korean (ko) — 한국어

### Style Reference
Write like velog.io tech blogs — friendly and approachable, yet professional.

### Formality
- Use **해요체** consistently throughout the article
- Address the reader warmly but maintain credibility

### Word Choice
- Prefer Korean-origin words over English loanwords when natural Korean expressions exist
  - ✅ 화면 over ❌ 스크린 (for common usage)
  - But keep established tech loanwords: 브라우저, 앱, 클라우드 are fine
- Use natural Korean connectors:（그리고, 하지만, 게다가, 다만）

### Paragraph Rhythm
- Short paragraphs preferred — similar to Chinese style
- Keep the conversational feel with occasional 요-ending rhetorical questions

---

## Spanish (es) — Español

### Style Reference
Write like Xataka or Genbeta tech articles — lively, informative, and engaging.

### Formality
- Use **tú** (not usted) to address the reader — maintain a friendly, blog-style tone
- OK to use casual expressions and humor

### Sentence Structure
- Although Spanish allows long subordinate clauses, **keep sentences concise** for tech blog readability
- Break complex English sentences into 2-3 shorter Spanish sentences
- Use active voice whenever possible

### Spanish-Specific
- Always use inverted punctuation marks: ¡...! ¿...?
- Prefer Spanish terms over anglicisms when natural alternatives exist
  - ✅ herramienta over ❌ tool (but keep well-established terms like "app", "software")

---

## French (fr) — Français

### Style Reference
Write like Korben.info or Le Journal du Geek — casual tech commentary with personality.

### Formality
- Use **tu** (not vous) — this is a blog, not a business letter
- Maintain a friendly, enthusiastic tone

### Punctuation Rules (Critical for French)
- Add a non-breaking space **before** : ; ! ? (French typography rule)
- Use « guillemets » for quotations, not "English quotes"

### Word Choice
- Prefer French equivalents over English borrowings when they exist and are commonly used
  - ✅ outil over ❌ tool
  - ✅ navigateur over ❌ browser
  - But keep widely-adopted English terms: "open source", "app", "cloud"

---

## German (de) — Deutsch

### Style Reference
Write like t3n.de or heise.de tech articles — straightforward, informative, occasionally witty.

### Formality
- Use **du** (not Sie) to address the reader
- Casual but knowledgeable tone

### Sentence Structure
- German allows long compound words and complex sentences, but for a tech blog: **mix short and long sentences**
- Don't let entire paragraphs consist of 30+ word sentences
- Use shorter sentences for emphasis and rhythm breaks

### Word Choice
- Technical jargon may stay in English (Browser, Tool, App, Cloud)
- General vocabulary should use German words
  - ✅ Werkzeug / Tool (both OK in tech context)
  - ✅ kostenlos over ❌ free (when meaning "gratis")

---

## Portuguese (pt) — Português (Brasil)

### Style Reference
Write like Tecnoblog or Olhar Digital — Brazilian tech blog style, relaxed and informative.

### Regional Variant
- **Always use Brazilian Portuguese** (pt-BR), NOT European Portuguese (pt-PT)
- Use Brazilian vocabulary and expressions
  - ✅ celular (BR) over ❌ telemóvel (PT)
  - ✅ tela (BR) over ❌ ecrã (PT)

### Formality
- Use **você** to address the reader
- Conversational but not sloppy — like talking to a tech-savvy friend

### Sentence Structure
- Keep sentences moderate in length
- Brazilian Portuguese tends toward shorter, punchier sentences than European Portuguese
- Use natural BR connectors:（além disso, por outro lado, na verdade, inclusive）
