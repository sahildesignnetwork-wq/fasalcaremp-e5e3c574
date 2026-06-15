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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "DATA_GOV_IN_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const district = url.searchParams.get("district") || "";
    const commodity = url.searchParams.get("commodity") || "";
    const market = url.searchParams.get("market") || "";
    const state = url.searchParams.get("state") || "Madhya Pradesh";
    const limit = url.searchParams.get("limit") || "50";

    const params = new URLSearchParams({
      "api-key": API_KEY,
      format: "json",
      limit,
      offset: "0",
    });
    params.append("filters[state]", state);
    if (district) params.append("filters[district]", district);
    if (commodity) params.append("filters[commodity]", commodity);
    if (market) params.append("filters[market]", market);

    const resp = await fetch(`${BASE}?${params.toString()}`);
    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: "upstream_error", status: resp.status, detail: text.slice(0, 500) }), {
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
    return new Response(JSON.stringify({ error: e?.message || "unknown_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
