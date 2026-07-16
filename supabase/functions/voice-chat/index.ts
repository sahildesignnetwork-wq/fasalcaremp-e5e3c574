import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Simple in-memory rate limit (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQ = 20;

function getIP(req: Request) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || req.headers.get('x-real-ip') || 'unknown';
}

function checkLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now > rec.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true };
  }
  if (rec.count >= MAX_REQ) return { allowed: false, retryAfter: Math.ceil((rec.resetTime - now) / 1000) };
  rec.count++;
  return { allowed: true };
}

const GENERIC_ERROR = 'Service temporarily unavailable. Please try again later.';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Rate limit
  const ip = getIP(req);
  const rl = checkLimit(ip);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait before trying again.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter || 60) },
    });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { messages, language } = body as { messages?: unknown; language?: unknown };

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return new Response(JSON.stringify({ error: 'Invalid messages: must be array of 1-20 items' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const cleanedMessages: { role: string; content: string }[] = [];
    for (const m of messages as any[]) {
      if (!m || typeof m !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid message entry' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const role = m.role;
      const content = m.content;
      if (role !== 'user' && role !== 'assistant') {
        return new Response(JSON.stringify({ error: 'Invalid message role' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (typeof content !== 'string' || content.length === 0 || content.length > 1000) {
        return new Response(JSON.stringify({ error: 'Message content must be 1-1000 characters' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      cleanedMessages.push({ role, content });
    }
    const lang = language === 'hi' ? 'hi' : 'en';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isHindi = lang === 'hi';
    const system = isHindi
      ? `आप "Fasal Care" ऐप के सहायक हैं — IEHE भोपाल, कृषि विभाग द्वारा बनाया गया। आप किसानों की मदद करते हैं: फसल रोग, खेती के तरीके, सरकारी योजनाएँ, मौसम, बाजार भाव, और ऐप का उपयोग।

ऐप की सुविधाएँ:
- रोग पहचान (कैमरा से पत्ती की फोटो खींचें)
- फसल मार्गदर्शिका (Package of Practices)
- ताज़ा कृषि समाचार
- हिंदी/अंग्रेजी भाषा

नियम: हमेशा हिंदी में जवाब दें। संक्षिप्त (2-4 वाक्य), सरल भाषा, बोलने योग्य (कोई markdown नहीं, कोई bullet नहीं)। यदि उपयोगकर्ता नेविगेट करना चाहे तो बताएँ कि "होम पर स्कैन/समाचार/गाइड बटन दबाएँ"।`
      : `You are the assistant for "Fasal Care" app — built by Department of Agriculture, IEHE Bhopal. Help farmers with crop diseases, farming practices, government schemes, weather, market prices, and app usage.

App features:
- Disease detection (camera + leaf photo)
- Crop guide (Package of Practices)
- Latest agri news
- Hindi/English language

Rules: Always reply in English. Keep it concise (2-4 sentences), simple, speakable (no markdown, no bullets). If user wants to navigate, tell them to "tap Scan/News/Guide on the home screen".`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: system }, ...cleanedMessages],
        max_tokens: 400,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('voice-chat upstream error', resp.status, txt);
      const status = resp.status === 429 ? 429 : 503;
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('voice-chat exception', e);
    return new Response(JSON.stringify({ error: GENERIC_ERROR }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
