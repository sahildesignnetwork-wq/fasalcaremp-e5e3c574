import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Periodic cleanup of rate limit map
  cleanupRateLimitMap();

  // Check rate limit
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP);
  
  if (!rateLimitResult.allowed) {
    console.error(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: RATE_LIMIT_ERROR }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter || 60)
        } 
      }
    );
  }

  try {
    console.log('Disease detection request received');

    const { imageBase64, cropName, cropNameHi } = await req.json();
    
    // Validate image input
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate image format (must be a data URL or base64 string)
    if (typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check image size
    if (imageBase64.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Image too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate base64 data URL format
    const validImagePattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
    if (!validImagePattern.test(imageBase64)) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format. Supported formats: JPEG, PNG, GIF, WebP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate crop name inputs
    if (cropName && typeof cropName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid crop name format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cropNameHi && typeof cropNameHi !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid crop name format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: GENERIC_ERROR }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing image for crop: ${cropName}`);

    const cropKey = getCropKey(cropName);
    const shortlist = cropKey
      ? CROP_DISEASES[cropKey].map((d, i) => `${i + 1}. ${d}`).join('\n')
      : 'No specific shortlist — use general MP crop disease knowledge but stay conservative.';
    const systemPromptFilled = systemPrompt.replace('{{CROP_DISEASE_LIST}}', '\n' + shortlist);

    const userPrompt = `Selected crop: ${cropName} (${cropNameHi}). Location: Madhya Pradesh, India.

Follow the 5-step protocol. First confirm image quality and that the leaf actually matches "${cropName}". Then list visible symptoms in causeEn before naming any disease. Only choose from the shortlist provided in your instructions. Return ONLY the JSON object, no other text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPromptFilled },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('AI API rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('AI API payment required');
        return new Response(
          JSON.stringify({ error: GENERIC_ERROR }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('AI API error:', response.status);
      return new Response(
        JSON.stringify({ error: ANALYSIS_ERROR }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ detected: false, message: ANALYSIS_ERROR }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI analysis completed successfully');

    // Parse the JSON response from AI
    let analysisResult;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON');
      // Return a fallback response
      return new Response(
        JSON.stringify({ 
          detected: false, 
          message: 'Unable to process analysis. Please try with a clearer image.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete:', analysisResult.detected ? 'Disease detected' : 'No disease detected');

    // Low-confidence guard: don't show shaky diagnoses to farmers
    if (analysisResult?.detected && typeof analysisResult.confidence === 'number' && analysisResult.confidence < 55) {
      console.log(`Suppressing low-confidence result (${analysisResult.confidence})`);
      analysisResult = {
        detected: false,
        message: `Symptoms are not clear enough for a confident diagnosis (${analysisResult.confidence}% match). Please retake the photo in daylight with the affected leaf filling the frame, or consult your nearest KVK extension officer.`,
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in detect-disease function');
    return new Response(
      JSON.stringify({ error: GENERIC_ERROR }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
