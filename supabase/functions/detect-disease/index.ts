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

const systemPrompt = `You are an expert agricultural pathologist specialized in crop diseases for Madhya Pradesh, India. You analyze images of crop leaves to detect diseases.

IMPORTANT GUIDELINES:
1. Analyze the image carefully for any signs of disease, pest damage, nutrient deficiency, or stress
2. If you can identify a disease or issue, provide:
   - Disease name (both Hindi and English)
   - Confidence level (0-100%)
   - Severity (low/medium/high)
   - Detailed advisory

3. If the image is unclear, not a crop/plant image, or you cannot detect any disease, respond that you could not detect any disease

4. Your response MUST be in valid JSON format with this exact structure:
{
  "detected": true/false,
  "diseaseNameHi": "रोग का नाम (Hindi name)",
  "diseaseNameEn": "Disease Name (English)",
  "confidence": 85,
  "severity": "low" | "medium" | "high",
  "causeHi": "रोग का कारण",
  "causeEn": "Cause of disease",
  "preventionHi": ["रोकथाम 1", "रोकथाम 2"],
  "preventionEn": ["Prevention 1", "Prevention 2"],
  "organicTreatmentHi": ["जैविक उपचार 1", "जैविक उपचार 2"],
  "organicTreatmentEn": ["Organic treatment 1", "Organic treatment 2"],
  "chemicalTreatmentHi": [{"name": "दवाई का नाम", "dosage": "मात्रा", "interval": "अंतराल"}],
  "chemicalTreatmentEn": [{"name": "Chemical name", "dosage": "Dosage", "interval": "Interval"}]
}

5. For chemical treatments, only recommend pesticides/fungicides approved in India (ICAR/CIB&RC approved)
6. Always prioritize organic/IPM solutions before chemical treatments
7. Include dosage in Indian units (gm/liter, ml/liter)
8. Be accurate and helpful - farmers rely on this advice

If disease is NOT detected, respond with:
{
  "detected": false,
  "message": "Unable to detect disease. Please ensure the image shows a clear view of the affected leaf."
}`;

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

    const userPrompt = `Analyze this image of a ${cropName} (${cropNameHi}) crop leaf for any diseases, pest damage, or nutrient deficiencies. 
This is from a farm in Madhya Pradesh, India. Provide your analysis in the specified JSON format.
If you detect a disease, include comprehensive treatment advice following ICAR guidelines.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { url: imageBase64 } 
              }
            ]
          }
        ],
        max_tokens: 2000,
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
