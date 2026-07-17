import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Static list of crops supported by Fasal Care in Madhya Pradesh.
const CROPS = [
  { id: "soybean", nameEn: "Soybean", nameHi: "सोयाबीन", season: "kharif" },
  { id: "wheat", nameEn: "Wheat", nameHi: "गेहूं", season: "rabi" },
  { id: "rice", nameEn: "Rice", nameHi: "धान", season: "kharif" },
  { id: "maize", nameEn: "Maize", nameHi: "मक्का", season: "kharif" },
  { id: "cotton", nameEn: "Cotton", nameHi: "कपास", season: "kharif" },
  { id: "chickpea", nameEn: "Chickpea", nameHi: "चना", season: "rabi" },
  { id: "pigeonpea", nameEn: "Pigeonpea", nameHi: "अरहर", season: "kharif" },
  { id: "mustard", nameEn: "Mustard", nameHi: "सरसों", season: "rabi" },
  { id: "tomato", nameEn: "Tomato", nameHi: "टमाटर", season: "horticulture" },
  { id: "potato", nameEn: "Potato", nameHi: "आलू", season: "rabi" },
  { id: "onion", nameEn: "Onion", nameHi: "प्याज", season: "horticulture" },
  { id: "garlic", nameEn: "Garlic", nameHi: "लहसुन", season: "horticulture" },
  { id: "sugarcane", nameEn: "Sugarcane", nameHi: "गन्ना", season: "kharif" },
  { id: "groundnut", nameEn: "Groundnut", nameHi: "मूंगफली", season: "kharif" },
];

export default defineTool({
  name: "list_crops",
  title: "List supported crops",
  description:
    "List all crops that Fasal Care supports for disease detection and advisories, optionally filtered by season.",
  inputSchema: {
    season: z
      .enum(["kharif", "rabi", "horticulture"])
      .optional()
      .describe("Optional season filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ season }) => {
    const items = season ? CROPS.filter((c) => c.season === season) : CROPS;
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { crops: items },
    };
  },
});
