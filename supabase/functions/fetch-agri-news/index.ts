import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Verified working Unsplash agriculture photo IDs mapped by category
const CATEGORY_IMAGES: Record<string, string[]> = {
  "Government Scheme": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600",
  ],
  "Market Price": [
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600",
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
    "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600",
  ],
  "Weather": [
    "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600",
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600",
    "https://images.unsplash.com/photo-1504608524841-42584120d693?w=600",
  ],
  "Technology": [
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600",
  ],
  "Organic Farming": [
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600",
  ],
  "Pest Alert": [
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600",
  ],
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600",
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600",
];

const sourceMap: Record<string, string> = {
  "Government Scheme": "https://pmkisan.gov.in",
  "Market Price": "https://agmarknet.gov.in",
  "Weather": "https://mausam.imd.gov.in",
  "Technology": "https://icar.org.in",
  "Organic Farming": "https://mpkrishi.mp.gov.in",
  "Pest Alert": "https://ppqs.gov.in",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get existing titles to avoid duplicates
    const { data: existing } = await supabase
      .from("agri_news")
      .select("title")
      .order("published_at", { ascending: false })
      .limit(20);

    const existingTitles = (existing || []).map((n: any) => n.title).join("; ");

    const categories = Object.keys(sourceMap);

    const prompt = `You are an Indian agriculture news writer. Generate 3 NEW and UNIQUE agriculture news articles relevant to Madhya Pradesh farmers in India.

DO NOT repeat these existing titles: ${existingTitles}

Each article must be about a DIFFERENT category from: ${categories.join(", ")}

Return a JSON array with exactly 3 objects, each having:
- "title": English title (max 80 chars, concise and informative)
- "title_hi": Hindi title (max 80 chars, concise and informative)
- "summary": English summary (max 150 chars, one sentence overview)
- "summary_hi": Hindi summary (max 150 chars, one sentence overview)
- "content": English detailed content (200-350 chars, factual and useful for farmers)
- "content_hi": Hindi detailed content (200-350 chars, factual and useful for farmers)
- "category": one of the categories listed above (EXACT match required)
- "source_url": a plausible specific article URL on the relevant government website for this category. Use the base domains: Government Scheme->pmkisan.gov.in, Market Price->agmarknet.gov.in, Weather->mausam.imd.gov.in, Technology->icar.org.in, Organic Farming->mpkrishi.mp.gov.in, Pest Alert->ppqs.gov.in. Append a realistic article path like /news/article-slug-in-english. Example: "https://pmkisan.gov.in/news/pm-kisan-18th-installment-released-2026"

Return ONLY the JSON array, no markdown, no extra text.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85,
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Clean markdown wrapping if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const articles = JSON.parse(content);

    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error("Invalid AI response format");
    }

    const now = new Date();
    const rows = articles.map((a: any, i: number) => {
      const cat = a.category as string;
      const images = CATEGORY_IMAGES[cat] || DEFAULT_IMAGES;
      const image_url = images[Math.floor(Math.random() * images.length)];
      const source = sourceMap[cat] || "https://agricoop.nic.in";
      // Use AI-generated specific article URL if valid, otherwise fall back to base domain
      const aiSourceUrl = typeof a.source_url === "string" && a.source_url.startsWith("http") ? a.source_url : source;
      return {
        title: a.title,
        title_hi: a.title_hi || null,
        summary: a.summary || null,
        summary_hi: a.summary_hi || null,
        content: a.content,
        content_hi: a.content_hi || null,
        category: cat || null,
        source,
        source_url: aiSourceUrl,
        image_url,
        published_at: new Date(now.getTime() - i * 60000).toISOString(),
      };
    });

    const { error } = await supabase.from("agri_news").insert(rows);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, inserted: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error fetching news:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
