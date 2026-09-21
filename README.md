# ClauseLens

**Legal information, without the legal complexity.**

---

## Problem

Legal documents are often written in dense, technical language that makes them difficult for non-lawyers to understand. Whether it is a tenancy agreement, a non-compete clause, an employment contract, or a privacy policy, most people cannot quickly determine what they are agreeing to, what their rights are, or what questions they should ask a qualified professional. Comparing two versions of a clause — such as an original and a revised draft — adds another layer of difficulty.

ClauseLens addresses this by turning opaque legal text into structured, plain-language information that helps users understand and prepare — without claiming to replace professional legal advice.

---

## What ClauseLens Does

### Understand Mode

Accepts either a described situation or pasted legal text (clause, notice, contract section) and produces:

- A plain-language summary of what the text means
- Important points the user should be aware of
- Points that may deserve closer review
- Possible next steps to consider
- A practical checklist
- Questions to prepare for a qualified legal professional
- Contextual notes on scope, jurisdiction, and limitations

Each important point and review point includes:

- The finding
- Why it may deserve attention
- A verbatim excerpt from the user's text, when available and independently verified
- The section or clause label it comes from, when identifiable

### Compare Mode

Accepts two legal texts (Text A and Text B) and produces:

- An overview of how the two texts relate
- Shared provisions that appear substantially the same in both texts
- Meaningful differences — only substantive changes affecting obligations, rights, deadlines, or key terms (not trivial punctuation differences)
- For each difference: what Text A says, what Text B says, why the difference may matter, and supporting excerpts from each text
- Review points
- Questions for a legal professional
- A scope and limitations note

ClauseLens does **not** declare which version is better, safer, more favorable, or legally superior.

---

## GenAI Role

**Gemini 3.8 Flash** (`gemini-3.8-flash` via `@google/genai`) performs:

- Semantic understanding of legal text
- Plain-language explanation and summarization
- Extraction of important points and review areas
- Identification of meaningful differences between two texts
- Generation of practical next steps, checklists, and professional questions
- Identification of supporting evidence excerpts from supplied text

**Server-side deterministic code** (in `src/app/api/analyze/route.ts` and `src/lib/gemini.ts`) independently performs:

- Request validation (Zod schema)
- Structured-output validation (Zod schema on the model's JSON response)
- Evidence verification (substring match against user-supplied text)
- Source-location verification (same)
- Sanitization (forces evidence and source_location to null in situation mode; silently nulls unverifiable excerpts)
- Error classification and safe user-facing error messages
- Bounded retry on transient service errors

The deterministic layer does **not** perform the legal reasoning — that is the role of the Gemini model.

---

## Grounding

When a finding includes a quoted excerpt, that excerpt is:

1. Required by the model to come verbatim from the user-supplied text only
2. **Independently verified server-side** via normalized substring matching before it is sent to the client

The label "Evidence from your text" is used precisely. It confirms only that the excerpt appears in the text the user supplied. It does **not** establish that the finding is legally correct, that the document is authentic, or that the law applies.

---

## Safety

- ClauseLens provides **general legal information and educational guidance only**.
- It is **not a substitute** for advice from a qualified legal professional.
- All output uses cautious, non-definitive language (e.g. "may", "could", "worth reviewing") — never "you will win", "this is illegal", or "you should sue".
- Compare Mode never ranks, scores, or declares a version legally better or safer.
- No legal outcome guarantees are made.
- User-provided content is treated as **untrusted data** and processed within explicit delimiters. Instructions embedded within user input cannot override system behavior.
- Prompt-injection boundaries are enforced both in system instructions and in server-side sanitization.
- The Gemini API key is **server-side only** — never exposed to the client. No NEXT_PUBLIC_GEMINI_API_KEY exists in this codebase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3.4 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| AI Model | Gemini 3.8 Flash |
| AI SDK | @google/genai 2.23.0 |
| Schema Validation | Zod 4.6.5 |
| Testing | Vitest 5.0.1 |

---

## Setup

Prerequisites: Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Create local environment file and add your Gemini API key
#    Obtain a key at https://aistudio.google.com/app/apikey
#    Never commit this file.
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local

# 3. Start the development server
npm run dev
```

Open http://localhost:3000

---

## Verification

```bash
# Unit tests (54 tests, no live API calls)
npm test

# TypeScript type checking
npx tsc --noEmit

# ESLint
npm run lint

# Production build
npm run build
```

All four checks should pass cleanly.

---

## Scope and Limitations

| Limitation | Status |
|---|---|
| PDF / OCR support | Not implemented |
| Persistent accounts or history | Not implemented |
| Database | Not implemented |
| Legal professional marketplace | Not implemented |
| Follow-up Q&A | Not implemented in current MVP |
| Professional legal advice | Out of scope — use a qualified solicitor/lawyer |
| Jurisdiction-specific statutory questions | May require qualified local legal advice |

ClauseLens is an information and comprehension tool. For legal decisions, always consult a qualified legal professional.
