import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const categories = [
      "Government Scheme",
      "Market Price",
      "Weather",
      "Technology",
      "Organic Farming",
      "Pest Alert",
    ];

    const prompt = `You are an Indian agriculture news generator. Generate 3 NEW and UNIQUE Hindi agriculture news articles relevant to Madhya Pradesh farmers. 

DO NOT repeat these existing titles: ${existingTitles}

Each article must be about a DIFFERENT category from: ${categories.join(", ")}

Return a JSON array with exactly 3 objects, each having:
- "title": Hindi title (max 80 chars)
- "summary": Hindi summary (max 150 chars)  
- "content": Hindi detailed content (200-400 chars)
- "category": one of the categories listed above
- "source": a realistic Indian agriculture news source name like "Krishi Vibhag MP", "PIB India", "IMD Bhopal", "ICAR", "Kisan Helpline", "Agriculture Ministry"
- "image_url": use an Unsplash image URL relevant to agriculture, format: https://images.unsplash.com/photo-{id}?w=600

Return ONLY the JSON array, no markdown or extra text.`;

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
          temperature: 0.9,
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
    const rows = articles.map((a: any, i: number) => ({
      title: a.title,
      summary: a.summary || null,
      content: a.content,
      category: a.category || null,
      source: a.source || null,
      image_url: a.image_url || null,
      published_at: new Date(now.getTime() - i * 60000).toISOString(),
    }));

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
