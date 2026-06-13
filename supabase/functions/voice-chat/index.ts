import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isHindi = language === 'hi';
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
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: txt }), {
        status: resp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content ?? '';
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
