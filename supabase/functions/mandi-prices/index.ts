// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const API_KEY = Deno.env.get("DATA_GOV_IN_API_KEY");
// AGMARKNET daily mandi prices dataset
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Only allow the intended state to prevent bypass of geographic scope
const ALLOWED_STATE = "Madhya Pradesh";
const MAX_LIMIT = 100;
const MAX_PARAM_LEN = 60;
// Allow letters, digits, spaces, hyphens, parentheses, ampersands, apostrophes and dots
const SAFE_PARAM_RE = /^[A-Za-z0-9 .()&'\-]{0,60}$/;

function sanitizeParam(v: string | null): string {
  if (!v) return "";
  const trimmed = v.trim().slice(0, MAX_PARAM_LEN);
  return SAFE_PARAM_RE.test(trimmed) ? trimmed : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const district = sanitizeParam(url.searchParams.get("district"));
    const commodity = sanitizeParam(url.searchParams.get("commodity"));
    const market = sanitizeParam(url.searchParams.get("market"));

    // Cap limit and hard-code state
    const rawLimit = parseInt(url.searchParams.get("limit") || "50", 10);
    const limitNum = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : 50;
    const limit = String(limitNum);

    const params = new URLSearchParams({
      "api-key": API_KEY,
      format: "json",
      limit,
      offset: "0",
    });
    params.append("filters[state]", ALLOWED_STATE);
    if (district) params.append("filters[district]", district);
    if (commodity) params.append("filters[commodity]", commodity);
    if (market) params.append("filters[market]", market);

    const resp = await fetch(`${BASE}?${params.toString()}`);
    if (!resp.ok) {
      const text = await resp.text();
      console.error("mandi-prices upstream error", resp.status, text.slice(0, 500));
      return new Response(JSON.stringify({ error: "Upstream service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();

    // Normalize: data.records contains the rows
    const records = (data.records || []).map((r: any) => ({
      state: r.state,
      district: r.district,
      market: r.market,
      commodity: r.commodity,
      variety: r.variety,
      grade: r.grade,
      arrival_date: r.arrival_date,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
      modal_price: Number(r.modal_price) || 0,
    }));

    return new Response(
      JSON.stringify({
        total: data.total ?? records.length,
        count: records.length,
        records,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("mandi-prices exception", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
