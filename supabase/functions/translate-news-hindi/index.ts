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

    // Fetch articles missing Hindi translations
    const { data: articles, error } = await supabase
      .from("agri_news")
      .select("id, title, summary, content")
      .is("title_hi", null)
      .limit(20);

    if (error) throw error;
    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No articles need translation" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a professional Hindi translator specializing in Indian agriculture.
Translate the following news articles from English to Hindi. Return ONLY a valid JSON array.

Each object in the input array has: id, title, summary, content.
Return an array of objects with: id, title_hi, summary_hi, content_hi.

Rules:
- Use simple, clear Hindi that Indian farmers can understand
- Keep numbers and proper nouns as-is
- Be concise and accurate

Articles to translate:
${JSON.stringify(articles)}

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
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let responseContent = aiData.choices?.[0]?.message?.content || "";
    responseContent = responseContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const translations = JSON.parse(responseContent);

    if (!Array.isArray(translations)) {
      throw new Error("Invalid translation response format");
    }

    // Update each article with Hindi translations
    let updated = 0;
    for (const t of translations) {
      const { error: updateError } = await supabase
        .from("agri_news")
        .update({
          title_hi: t.title_hi || null,
          summary_hi: t.summary_hi || null,
          content_hi: t.content_hi || null,
        })
        .eq("id", t.id);

      if (!updateError) updated++;
    }

    return new Response(
      JSON.stringify({ success: true, translated: updated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Translation error:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
