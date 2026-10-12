// Cached proxy for the GDELT DOC 2.0 API (free, no key).
// Vercel runs this file as a serverless function at /api/gdelt.
// The site calls it instead of GDELT directly, so every visitor shares one
// cached answer per query for 10 minutes and GDELT's 1-request-per-5-seconds
// limit is never hit by your visitors.

const GDELT = "https://api.gdeltproject.org/api/v2/doc/doc";
const ALLOWED = ["query", "mode", "timespan", "maxrecords", "sort", "format"];
const MODES = ["timelinevol", "artlist"];

const send = (res, status, body, cache) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", cache || "no-store");
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

module.exports = async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = new URLSearchParams();
  for (const k of ALLOWED) {
    const v = url.searchParams.get(k);
    if (v) p.set(k, v.slice(0, 200));
  }
  const mode = (p.get("mode") || "").toLowerCase();
  if (!p.get("query")) return send(res, 400, { error: "query is required" });
  if (!MODES.includes(mode)) return send(res, 400, { error: "mode must be timelinevol or artlist" });
  p.set("format", "json");

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(GDELT + "?" + p.toString(), { headers: { "user-agent": "breaking-wire/1.0" } });
      const text = (await r.text()).trim();
      if (text.startsWith("{") || text.startsWith("[")) {
        return send(res, 200, text, "public, s-maxage=600, stale-while-revalidate=1800");
      }
      if (/limit requests/i.test(text)) {
        if (attempt === 0) { await new Promise(ok => setTimeout(ok, 5500)); continue; }
        return send(res, 429, { error: "GDELT is busy, try again in a few seconds" });
      }
      return send(res, 502, { error: text.slice(0, 200) || "Empty reply from GDELT" });
    } catch (e) {
      if (attempt === 0) continue;
      return send(res, 502, { error: "Could not reach GDELT" });
    }
  }
};
