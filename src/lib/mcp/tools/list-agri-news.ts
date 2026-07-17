import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_agri_news",
  title: "List agriculture news",
  description:
    "List the latest agriculture news articles for Madhya Pradesh farmers from the Fasal Care news feed. Returns title, summary, category, source, and publish date.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of articles to return (default 10, max 50)."),
    category: z
      .string()
      .optional()
      .describe("Optional case-insensitive category filter (e.g. 'Market Price', 'Weather')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, category }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("agri_news")
      .select("id,title,title_hi,summary,summary_hi,category,source,source_url,published_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit ?? 10);
    if (category) q = q.ilike("category", category);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
