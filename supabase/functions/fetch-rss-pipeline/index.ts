import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Fuentes RSS ───────────────────────────────────────────────────────────────
const RSS_SOURCES = [
  { name: "Infobae",      id: "infobae",  url: "https://www.infobae.com/arc/outboundfeeds/rss/",              baseTags: ["Argentina"] },
  { name: "La Nación",    id: "lanacion",  url: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/",          baseTags: ["Argentina"] },
  { name: "Página 12",    id: "pagina12",  url: "https://www.pagina12.com.ar/arc/outboundfeeds/rss/portada",   baseTags: ["Argentina"] },
  { name: "Perfil",       id: "perfil",    url: "https://www.perfil.com/feed",                                 baseTags: ["Argentina"] },
  { name: "Ámbito",       id: "ambito",    url: "https://www.ambito.com/rss/pages/home.xml",                   baseTags: ["Argentina", "Economía"] },
  { name: "El Cronista",  id: "cronista",  url: "https://www.cronista.com/rss/feed.xml",                       baseTags: ["Argentina", "Economía"] },
];

// ─── RSS Parser ────────────────────────────────────────────────────────────────
interface RssItem { title: string; url: string; description: string; pubDate: string }

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag.replace(":", "\\:")}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag.replace(":", "\\:")}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ")
    .replace(/\s+/g, " ").trim();
}

function parseRSS(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const re = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const title = stripHtml(extractTag(block, "title"));
    const link  = extractTag(block, "link") || extractTag(block, "guid");
    const desc  = stripHtml(extractTag(block, "description") || extractTag(block, "summary"));
    const date  = extractTag(block, "pubDate") || extractTag(block, "dc:date") || "";
    if (title && link && link.startsWith("http"))
      items.push({ title, url: link.trim(), description: desc.slice(0,400), pubDate: date });
  }
  return items;
}

// ─── Extractor de texto del artículo ──────────────────────────────────────────
async function fetchArticleText(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MIDIA-NewsBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-AR,es;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return "";
    const html = await resp.text();
    const cleaned = html
      .replace(/<head[\s\S]*?<\/head>/gi,"").replace(/<script[\s\S]*?<\/script>/gi,"")
      .replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<nav[\s\S]*?<\/nav>/gi,"")
      .replace(/<header[\s\S]*?<\/header>/gi,"").replace(/<footer[\s\S]*?<\/footer>/gi,"")
      .replace(/<aside[\s\S]*?<\/aside>/gi,"").replace(/<!--[\s\S]*?-->/g,"");

    const patterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*(?:article-body|nota-content|article-text|post-content|entry-content|story-body|article__body|content-body|cuerpo-nota)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];
    let bodyHtml = "";
    for (const p of patterns) { const f = cleaned.match(p); if (f && f[1].length > 300) { bodyHtml = f[1]; break; } }
    if (!bodyHtml) bodyHtml = cleaned;

    const paragraphs: string[] = [];
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pm: RegExpExecArray | null;
    while ((pm = pRe.exec(bodyHtml)) !== null) {
      const t = stripHtml(pm[1]);
      if (t.length > 40) paragraphs.push(t);
    }
    const result = paragraphs.length > 0 ? paragraphs.join(" ") : stripHtml(bodyHtml);
    return result.slice(0, 6000);
  } catch { return ""; }
}

// ─── Detección de temas ────────────────────────────────────────────────────────
function detectTags(title: string, body: string, baseTags: string[]): string[] {
  const t = `${title} ${body}`.toLowerCase();
  const tags = new Set(baseTags);
  if (/econom|inflaci|dólar|dolar|peso\b|finanzas|bolsa|merval|banco central|deuda|fmi|indec|tarifas|exportacion|importacion/.test(t)) tags.add("Economía");
  if (/polític|gobierno|milei|kirchner|congreso|diputad|senado|elecciones|partido|ministro|decreto|veto|reforma/.test(t)) tags.add("Política");
  if (/salud|hospital|médico|medicina|enfermedad|pandemia|vacuna|neurolog|psicolog|psiquiat|terapia|dormir|sueño|cerebro|cognitiv|mental|bienestar|nutricion|dieta|ejercicio|clínica|tratamiento|diagnóstico|síntoma/.test(t)) tags.add("Salud");
  if (/tecnolog|inteligencia artificial|startup|ciberseguridad|software|blockchain|criptomoneda|robotica|automatizacion/.test(t)) tags.add("Tecnología");
  if (/ambiente|glaciares|cambio climático|calentamiento|contaminación|ecolog|biodiversidad|energía renovable|solar|eólica|forestal|sequía|inundacion/.test(t)) tags.add("Ambiente");
  if (/deporte|fútbol|futbol|messi|river|boca|mundial|tenis|básquet|rugby|atletismo|racing|independiente|san lorenzo/.test(t)) tags.add("Deportes");
  if (/cultura|arte|cine|música|teatro|literatura|festival|libro|escritor|exhibición|museo/.test(t)) tags.add("Cultura");
  if (/seguridad|crimen|narco|policía|justicia|judicial|delito|robo|homicidio|femicidio/.test(t)) tags.add("Seguridad");
  if (/internacional|eeuu|estados unidos|europa|china|brasil|chile|onu|otan|geopolítica|trump|guerra|conflicto/.test(t)) tags.add("Internacional");
  if (/ciencia|investigación científica|descubrimiento|universidad|conicet|nasa|estudio científico/.test(t)) tags.add("Ciencia");
  return [...tags];
}

// ─── Generar perspectivas en background (no bloquea la respuesta HTTP) ────────
async function generatePerspectivesBackground(
  supabaseUrl: string,
  serviceKey: string,
  recordId: string,
  title: string,
  body: string,
  supabase: ReturnType<typeof createClient>
) {
  try {
    console.log(`[bg] Generando perspectivas: ${title.slice(0, 55)}`);
    const resp = await fetch(`${supabaseUrl}/functions/v1/generate-perspectives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ title, body }),
      signal: AbortSignal.timeout(90000),
    });
    if (resp.ok) {
      const { perspectives } = await resp.json();
      await supabase.from("news_feed").update({ perspectives, status: "done" }).eq("id", recordId);
      console.log(`[bg] ✅ Done: ${title.slice(0, 55)}`);
    } else {
      const err = await resp.text();
      await supabase.from("news_feed").update({ status: "error", error_msg: `AI ${resp.status}: ${err.slice(0,200)}` }).eq("id", recordId);
    }
  } catch (e) {
    await supabase.from("news_feed").update({ status: "error", error_msg: String(e).slice(0,200) }).eq("id", recordId);
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase    = createClient(supabaseUrl, serviceKey);

  let maxPerSource = 2;
  let dryRun = false;
  let sourceFilter: string | null = null;

  try {
    const b = await req.json().catch(() => ({}));
    if (b.maxPerSource) maxPerSource = Math.min(Number(b.maxPerSource), 10);
    if (b.dryRun === true) dryRun = true;
    if (b.source) sourceFilter = b.source;
  } catch { /* ignorar */ }

  const results: Record<string, unknown>[] = [];
  const errors:  Record<string, unknown>[] = [];
  const bgTasks: Promise<void>[] = [];

  const sources = sourceFilter ? RSS_SOURCES.filter(s => s.id === sourceFilter) : RSS_SOURCES;

  for (const source of sources) {
    console.log(`📡 ${source.name}`);
    let xml = "";
    try {
      const r = await fetch(source.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MIDIA-NewsBot/1.0)", Accept: "application/rss+xml,application/xml,text/xml,*/*" },
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) { errors.push({ source: source.id, error: `RSS ${r.status}` }); continue; }
      xml = await r.text();
    } catch (e) { errors.push({ source: source.id, error: `RSS fetch: ${e}` }); continue; }

    const items = parseRSS(xml).slice(0, maxPerSource);
    console.log(`  → ${items.length} items`);

    for (const item of items) {
      const { data: existing } = await supabase.from("news_feed").select("id").eq("source_url", item.url).maybeSingle();
      if (existing) { console.log(`  ⏭ existe`); continue; }

      if (dryRun) { results.push({ source: source.id, title: item.title, status: "dry-run" }); continue; }

      const bodyText  = await fetchArticleText(item.url);
      const finalBody = bodyText.length > 100 ? bodyText : item.description;
      if (!finalBody || finalBody.length < 50) { errors.push({ source: source.id, title: item.title, error: "body corto" }); continue; }

      const tags        = detectTags(item.title, finalBody, source.baseTags);
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

      const { data: record, error: insertErr } = await supabase
        .from("news_feed")
        .insert({ title: item.title, summary: item.description, body: finalBody, source_url: item.url, source_name: source.name, source_id: source.id, tags, published_at: publishedAt, status: "pending" })
        .select("id").single();

      if (insertErr || !record) { errors.push({ source: source.id, title: item.title, error: insertErr?.message ?? "insert failed" }); continue; }

      // Encolar IA en background — la HTTP response sale inmediatamente
      bgTasks.push(generatePerspectivesBackground(supabaseUrl, serviceKey, record.id, item.title, finalBody, supabase));
      results.push({ id: record.id, source: source.id, title: item.title, tags, status: "queued" });
      console.log(`  📥 Guardado: ${item.title.slice(0, 50)}`);
    }
  }

  // Registrar background tasks para que el runtime las complete tras responder
  if (bgTasks.length > 0) {
    (globalThis as any).EdgeRuntime?.waitUntil(Promise.allSettled(bgTasks));
  }

  return new Response(
    JSON.stringify({ processed: results.length, errors: errors.length, queued_ai: bgTasks.length, results, errors }),
    { headers: { ...CORS, "Content-Type": "application/json" } }
  );
});
