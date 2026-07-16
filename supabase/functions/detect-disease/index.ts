import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum image size: 10MB in base64 (approximately 7.5MB actual file)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

function getClientIP(req: Request): string {
  // Try various headers that might contain the client IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback to a generic identifier
  return 'unknown';
}

function checkRateLimit(clientIP: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    // Start new window
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

// Clean up old entries periodically (simple garbage collection)
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// Known diseases per crop in Madhya Pradesh — constrains model to a realistic shortlist
const CROP_DISEASES: Record<string, string[]> = {
  soybean: [
    'Soybean Rust (Phakopsora pachyrhizi)',
    'Yellow Mosaic Virus (YMV)',
    'Bacterial Pustule (Xanthomonas axonopodis)',
    'Frogeye Leaf Spot (Cercospora sojina)',
    'Anthracnose (Colletotrichum truncatum)',
    'Charcoal Rot (Macrophomina phaseolina)',
    'Pod Blight / Aerial Blight (Rhizoctonia)',
    'Powdery Mildew',
    'Girdle Beetle damage',
    'Tobacco Caterpillar / Semilooper damage',
    'Nutrient deficiency (Iron / Magnesium / Sulphur)',
  ],
  wheat: ['Yellow Rust', 'Brown Rust', 'Black Rust (Stem Rust)', 'Loose Smut', 'Karnal Bunt', 'Powdery Mildew', 'Leaf Blight (Alternaria)', 'Foot Rot'],
  rice: ['Blast (Pyricularia)', 'Bacterial Leaf Blight', 'Sheath Blight', 'Brown Spot', 'False Smut', 'Tungro Virus', 'Stem Borer damage', 'BPH damage'],
  maize: ['Turcicum Leaf Blight', 'Maydis Leaf Blight', 'Common Rust', 'Banded Leaf and Sheath Blight', 'Downy Mildew', 'Fall Armyworm damage', 'Stalk Rot'],
  cotton: ['Cotton Leaf Curl Virus', 'Bacterial Blight', 'Alternaria Leaf Spot', 'Grey Mildew', 'Pink Bollworm damage', 'Whitefly damage', 'Jassid (Hopper Burn)'],
  chickpea: ['Wilt (Fusarium)', 'Ascochyta Blight', 'Botrytis Grey Mould', 'Dry Root Rot', 'Pod Borer (Helicoverpa) damage', 'Stunt Virus'],
  pigeonpea: ['Wilt (Fusarium udum)', 'Sterility Mosaic Disease', 'Phytophthora Blight', 'Pod Borer damage', 'Pod Fly damage'],
  mustard: ['Alternaria Blight', 'White Rust', 'Downy Mildew', 'Sclerotinia Stem Rot', 'Powdery Mildew', 'Aphid infestation'],
  tomato: ['Early Blight (Alternaria)', 'Late Blight (Phytophthora)', 'Leaf Curl Virus', 'Bacterial Wilt', 'Septoria Leaf Spot', 'Fruit Borer damage', 'Whitefly damage'],
  potato: ['Late Blight', 'Early Blight', 'Black Scurf', 'Common Scab', 'Leaf Roll Virus', 'PVY / PVX'],
  onion: ['Purple Blotch', 'Stemphylium Blight', 'Downy Mildew', 'Basal Rot', 'Thrips damage'],
  garlic: ['Purple Blotch', 'Stemphylium Blight', 'Downy Mildew', 'Basal Rot', 'Thrips damage'],
  sugarcane: ['Red Rot', 'Smut', 'Wilt', 'Pokkah Boeng', 'Top Borer damage', 'Pyrilla damage'],
  groundnut: ['Tikka (Early & Late Leaf Spot)', 'Rust', 'Collar Rot', 'Stem Rot', 'Bud Necrosis Virus'],
};

function getCropKey(cropName: string): string {
  const n = (cropName || '').toLowerCase().trim();
  for (const k of Object.keys(CROP_DISEASES)) if (n.includes(k)) return k;
  return '';
}

const systemPrompt = `You are a senior plant pathologist with 20+ years of field experience diagnosing crop diseases in Madhya Pradesh, India. You advise small farmers, so a wrong diagnosis causes real harm. Be conservative: if you are not confident, say so instead of guessing.

STRICT DIAGNOSTIC PROTOCOL — follow in order:

STEP 1 — IMAGE QUALITY CHECK
Reject the image (return detected:false) if ANY of these are true:
- Image is blurry, dark, or too far away to see leaf surface texture
- Image is not a plant/leaf (e.g. soil only, hand, sky, random object)
- Leaf is healthy with no visible symptoms (no spots, no discoloration, no lesions, no pests)
- Image shows a crop clearly different from what the user selected

STEP 2 — CROP IDENTITY CHECK
Confirm the leaf shape, venation, and growth habit match the selected crop. If it does not match, return detected:false with a message asking the farmer to verify the crop selection.

STEP 3 — SYMPTOM OBSERVATION (think step-by-step internally)
List what you actually SEE: lesion color, shape, size, distribution (margin / interveinal / scattered), presence of pustules / powder / mold, leaf curling, yellowing pattern, insect signs. Do NOT name a disease until you have grounded observations.

STEP 4 — DIFFERENTIAL DIAGNOSIS
Match the observed symptoms ONLY against this shortlist of diseases/pests known for this crop in Madhya Pradesh: {{CROP_DISEASE_LIST}}
- If symptoms strongly match exactly one entry, report it with confidence 75-95.
- If symptoms match 2-3 candidates, pick the most likely and set confidence 55-70, mention the alternatives in causeEn.
- If symptoms do NOT clearly match anything on the shortlist, return detected:false with a message telling the farmer to consult a local KVK extension officer.
- Never invent diseases not on the shortlist. Never report a disease from a different crop.

STEP 5 — CONFIDENCE CALIBRATION
- 90-100: textbook symptoms, multiple confirming signs, clean image
- 70-89: classic symptoms but image or signs imperfect
- 55-69: plausible but ambiguous
- <55: do not report — return detected:false instead

OUTPUT — Return ONLY valid JSON, no prose, no markdown fences:
{
  "detected": true,
  "diseaseNameHi": "रोग का नाम",
  "diseaseNameEn": "Disease Name (scientific name in parentheses)",
  "confidence": 85,
  "severity": "low" | "medium" | "high",
  "causeHi": "कारण और मुख्य लक्षण जो छवि में दिखे",
  "causeEn": "Cause + the exact visual symptoms you observed in the image",
  "preventionHi": ["रोकथाम 1", "रोकथाम 2", "रोकथाम 3"],
  "preventionEn": ["Prevention 1", "Prevention 2", "Prevention 3"],
  "organicTreatmentHi": ["जैविक उपचार 1", "जैविक उपचार 2"],
  "organicTreatmentEn": ["Organic treatment 1", "Organic treatment 2"],
  "chemicalTreatmentHi": [{"name": "दवाई", "dosage": "मात्रा प्रति लीटर", "interval": "अंतराल"}],
  "chemicalTreatmentEn": [{"name": "Chemical (ICAR/CIB&RC approved)", "dosage": "g or ml per litre", "interval": "Spray interval in days"}]
}

If detected:false:
{ "detected": false, "message": "Specific reason — bad image / healthy leaf / crop mismatch / symptoms unclear. Ask the farmer to retake photo in daylight with leaf filling the frame, or consult nearest KVK." }

RULES:
- Only ICAR / CIB&RC approved pesticides. Dosage in g/L or ml/L.
- Always list organic / IPM options first.
- causeEn must reference the actual visible symptoms — this proves you looked at the image.`;

// Generic error messages to prevent information leakage
const GENERIC_ERROR = 'Service temporarily unavailable. Please try again later.';
const ANALYSIS_ERROR = 'Unable to analyze image. Please try again.';
const RATE_LIMIT_ERROR = 'Too many requests. Please wait before trying again.';

// Models used in the consensus engine — 3 independent AIs vote on the diagnosis
const CONSENSUS_MODELS = [
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'openai/gpt-5-mini',
];

// Normalize a disease name for comparison: lowercase, strip scientific-name parentheses,
// strip punctuation, collapse whitespace, and drop generic filler words.
function normalizeDiseaseName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(disease|damage|infestation|virus|blight|the|and|of)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Two normalized names "match" if one contains the other or they share the same
// leading token (e.g. "yellow rust" ~ "yellow rust puccinia striiformis").
function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aTokens = a.split(' ').filter(Boolean);
  const bTokens = b.split(' ').filter(Boolean);
  if (aTokens.length === 0 || bTokens.length === 0) return false;
  // Require at least 2 shared tokens for a fuzzy match
  const shared = aTokens.filter((t) => bTokens.includes(t));
  return shared.length >= 2;
}

async function callModel(
  model: string,
  systemPromptFilled: string,
  userPrompt: string,
  images: string[],
  apiKey: string,
): Promise<any | null> {
  try {
    const imageBlocks = images.map((url) => ({ type: 'image_url', image_url: { url } }));
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPromptFilled },
          { role: 'user', content: [{ type: 'text', text: userPrompt }, ...imageBlocks] },
        ],
        max_tokens: 2500,
      }),
    });
    if (!res.ok) {
      console.error(`Model ${model} failed with status ${res.status}`);
      return { __error: res.status };
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
    try {
      return JSON.parse(jsonStr);
    } catch {
      console.error(`Model ${model} returned non-JSON`);
      return null;
    }
  } catch (e) {
    console.error(`Model ${model} threw`, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  cleanupRateLimitMap();
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({ error: RATE_LIMIT_ERROR }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateLimitResult.retryAfter || 60) },
    });
  }

  try {
    const body = await req.json();
    const { cropName, cropNameHi } = body;
    const images: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : (body.imageBase64 ? [body.imageBase64] : []);

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validImagePattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
    for (const img of images) {
      if (typeof img !== 'string' || !validImagePattern.test(img)) {
        return new Response(JSON.stringify({ error: 'Invalid image format' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (img.length > MAX_IMAGE_SIZE) {
        return new Response(JSON.stringify({ error: 'Image too large. Maximum size is 10MB per image.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cropKey = getCropKey(cropName || '');
    const shortlist = cropKey
      ? CROP_DISEASES[cropKey].map((d, i) => `${i + 1}. ${d}`).join('\n')
      : 'No specific shortlist — use general MP crop disease knowledge but stay conservative.';
    const systemPromptFilled = systemPrompt.replace('{{CROP_DISEASE_LIST}}', '\n' + shortlist);

    const userPrompt = `Selected crop: ${cropName} (${cropNameHi}). Location: Madhya Pradesh, India.

The farmer has provided ${images.length} photo(s) of the SAME plant from different angles / distances. Consider ALL images together as one case — cross-check symptoms across them.

Follow the 5-step protocol. First confirm image quality and that the leaf actually matches "${cropName}". Then list visible symptoms in causeEn before naming any disease. Only choose from the shortlist provided in your instructions. Return ONLY the JSON object, no other text.`;

    console.log(`Consensus engine: querying ${CONSENSUS_MODELS.length} models with ${images.length} image(s)`);

    // Run all models in parallel
    const results = await Promise.all(
      CONSENSUS_MODELS.map((m) => callModel(m, systemPromptFilled, userPrompt, images, LOVABLE_API_KEY))
    );

    // If every call rate-limited / errored, surface that
    const allErrored = results.every((r) => r && r.__error);
    if (allErrored) {
      const anyRateLimit = results.some((r: any) => r?.__error === 429);
      return new Response(JSON.stringify({
        detected: false,
        error: anyRateLimit ? 'Service is busy. Please try again in a moment.' : ANALYSIS_ERROR,
      }), { status: anyRateLimit ? 429 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const valid = results.filter((r) => r && !r.__error) as any[];
    const total = valid.length;

    // Count "detected" votes and cluster by disease name
    const detectedVotes = valid.filter((r) => r?.detected === true);
    const notDetectedVotes = valid.filter((r) => r?.detected === false);

    // If majority say "no disease / bad image", ask for retake
    if (notDetectedVotes.length > detectedVotes.length) {
      const reason = notDetectedVotes[0]?.message ||
        'Images are unclear or symptoms not visible enough. Please retake 3 sharp daylight photos of the affected plant.';
      return new Response(JSON.stringify({
        detected: false,
        message: reason,
        consensus: { agree: notDetectedVotes.length, total, verdict: 'retake' },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Cluster detected votes by fuzzy disease-name match
    const clusters: { key: string; members: any[] }[] = [];
    for (const vote of detectedVotes) {
      const norm = normalizeDiseaseName(vote.diseaseNameEn || '');
      const found = clusters.find((c) => namesMatch(c.key, norm));
      if (found) found.members.push(vote);
      else clusters.push({ key: norm, members: [vote] });
    }
    clusters.sort((a, b) => b.members.length - a.members.length);
    const top = clusters[0];
    const topCount = top ? top.members.length : 0;

    console.log(`Consensus: ${topCount}/${total} models agree on top diagnosis`);

    // Need at least 2 agreeing models AND a strict majority. Otherwise → recapture.
    if (!top || topCount < 2 || topCount <= total / 2) {
      return new Response(JSON.stringify({
        detected: false,
        message: `AI models disagreed on the diagnosis (${topCount}/${total} agreed). Please recapture 3 clear photos of the affected plant from different angles in good daylight, so the AIs can reach a confident consensus.`,
        consensus: { agree: topCount, total, verdict: 'disagree' },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Consensus reached — pick the highest-confidence answer from the winning cluster
    const winner = top.members.reduce((best, cur) =>
      (cur.confidence || 0) > (best.confidence || 0) ? cur : best, top.members[0]);

    // Boost confidence if all models agreed
    const agreementBoost = topCount === total ? 10 : topCount >= total - 1 ? 5 : 0;
    const boostedConfidence = Math.min(99, Math.round((winner.confidence || 70) + agreementBoost));

    const finalResult = {
      ...winner,
      confidence: boostedConfidence,
      consensus: { agree: topCount, total, verdict: 'agree' },
    };

    // Low-confidence guard after consensus
    if (typeof finalResult.confidence === 'number' && finalResult.confidence < 55) {
      return new Response(JSON.stringify({
        detected: false,
        message: `Confidence too low (${finalResult.confidence}%) even after consensus. Please retake 3 clearer photos.`,
        consensus: { agree: topCount, total, verdict: 'low-confidence' },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in detect-disease function', error);
    return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

