// Real Gemini evidence grounding verification script
// Tests the actual gemini.ts and route.ts verification pipeline
// Run with: node --experimental-vm-modules scripts/verify-evidence.mjs

import { GoogleGenAI, Type } from "@google/genai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = join(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  }
} catch {
  console.error("Could not read .env.local");
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
  console.error("No valid GEMINI_API_KEY found");
  process.exit(1);
}

// ─── Inline verifier (same logic as route.ts) ────────────────────────────

function normalizeForVerification(text) {
  return text
    .normalize("NFC")
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2014\u2013\u2012\u2011]/g, "-")
    .replace(/[\s\r\n]+/g, " ")
    .trim()
    .toLowerCase();
}

function verifyEvidence(evidence, sourceText) {
  if (!evidence) return null;
  if (evidence.length > 200) return null;
  const normEvidence = normalizeForVerification(evidence);
  const normSource = normalizeForVerification(sourceText);
  if (normEvidence.length === 0) return null;
  return normSource.includes(normEvidence) ? evidence : null;
}

function verifySourceLocation(location, sourceText) {
  if (!location) return null;
  const normLocation = normalizeForVerification(location);
  const normSource = normalizeForVerification(sourceText);
  if (normLocation.length === 0) return null;
  return normSource.includes(normLocation) ? location : null;
}

// ─── Real Gemini call ────────────────────────────────────────────────────

const TEST_PASTE_TEXT = `Payment Terms

The customer must pay all outstanding amounts within 30 days of receiving the invoice. Late payments may be subject to interest charges.

Termination

Either party may terminate this agreement by providing 30 days written notice to the other party.`;

const TEST_SITUATION_TEXT =
  "I signed a rental agreement and my landlord says I must pay a fee if I leave before the lease ends.";

async function runTest(label, mode, text) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST: ${label}`);
  console.log(`${"=".repeat(60)}`);

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const modeContext =
    mode === "situation"
      ? "The user has described a legal situation in their own words. There is NO supplied legal document. Set evidence and source_location to null for every finding — do not fabricate quotations from the user's description."
      : "The user has provided legal or document text. Evidence excerpts may be extracted from the supplied text. Quote the text verbatim and directly — do not paraphrase or invent.";

  const userPrompt = `${modeContext}

<<<USER_LEGAL_CONTENT>>>
${text}
<<<END_USER_LEGAL_CONTENT>>>

Provide your response adhering strictly to the requested structured JSON schema.`;

  let rawText;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simple_terms: { type: Type.STRING },
            important_points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  why_it_matters: { type: Type.STRING },
                  evidence: { type: Type.STRING, nullable: true },
                  source_location: { type: Type.STRING, nullable: true },
                },
                required: ["point", "why_it_matters", "evidence", "source_location"],
              },
            },
            review_points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  why_it_matters: { type: Type.STRING },
                  evidence: { type: Type.STRING, nullable: true },
                  source_location: { type: Type.STRING, nullable: true },
                },
                required: ["point", "why_it_matters", "evidence", "source_location"],
              },
            },
            confidence_note: { type: Type.STRING },
          },
          required: ["simple_terms", "important_points", "review_points", "confidence_note"],
        },
      },
    });
    rawText = response.text;
  } catch (e) {
    console.error("Gemini API error:", e.message);
    return;
  }

  const parsed = JSON.parse(rawText);

  console.log(`\nSIMPLE TERMS: ${parsed.simple_terms?.substring(0, 120)}...`);

  console.log("\nIMPORTANT POINTS:");
  for (const f of parsed.important_points || []) {
    console.log(`  POINT: ${f.point}`);
    console.log(`  WHY:   ${f.why_it_matters?.substring(0, 100)}`);
    const verifiedEvidence = mode === "situation" ? null : verifyEvidence(f.evidence, text);
    const verifiedLocation = mode === "situation" ? null : verifySourceLocation(f.source_location, text);
    console.log(`  EVIDENCE (raw):     ${JSON.stringify(f.evidence)}`);
    console.log(`  EVIDENCE (verified): ${JSON.stringify(verifiedEvidence)}`);
    console.log(`  LOCATION (raw):     ${JSON.stringify(f.source_location)}`);
    console.log(`  LOCATION (verified): ${JSON.stringify(verifiedLocation)}`);

    if (mode === "situation" && f.evidence !== null) {
      console.log("  ⚠️  WARN: Gemini returned evidence in situation mode — server would force null");
    }
    if (verifiedEvidence !== null) {
      console.log("  ✅ Evidence verified in source text");
    } else if (f.evidence !== null && mode !== "situation") {
      console.log("  ❌ Evidence NOT found in source text — would be nulled");
    }
    console.log("  ---");
  }
}

// Run tests
await runTest("PASTE MODE — real legal text", "paste", TEST_PASTE_TEXT);
await runTest("SITUATION MODE — no document", "situation", TEST_SITUATION_TEXT);
