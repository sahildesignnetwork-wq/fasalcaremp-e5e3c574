import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listAgriNews from "./tools/list-agri-news";
import getAgriNews from "./tools/get-agri-news";
import listCrops from "./tools/list-crops";
import whoami from "./tools/whoami";

// The OAuth issuer must be the direct Supabase host, not the .lovable.cloud proxy.
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time, keeping this entry import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fasal-care-mcp",
  title: "Fasal Care MCP",
  version: "0.1.0",
  instructions:
    "Tools for Fasal Care (फसल केयर), an AI crop-advisory app for Madhya Pradesh farmers. Use `list_agri_news` and `get_agri_news` to read agriculture news, `list_crops` to see supported crops, and `whoami` to check the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listAgriNews, getAgriNews, listCrops, whoami],
});
