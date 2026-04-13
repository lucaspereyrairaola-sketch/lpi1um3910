import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Fuentes RSS de medios argentinos ─────────────────────────────────────────
const RSS_SOURCES = [
  {
    name: "Infobae",
    id: "infobae",
    url: "https://www.infobae.com/arc/outboundfeeds/rss/",
    baseTags: ["Argentina"],
  },
  {
    name: "La Nación",
    id: "lanacion",
    url: "https://www.lanacion.com.ar/arc/outboundfeeds/rss/",
    baseTags: ["Argentina"],
  },
  {
    name: "Página 12",
    id: "pagina12",
    url: "https://www.pagina12.com.ar/arc/outboundfeeds/rss/portada",
    baseTags: ["Argentina"],
  },
  {
    name: "Perfil",
    id: "perfil",
    url: "https://www.perfil.com/feed",
    baseTags: ["Argentina"],
  },
  {
    name: "Ámbito",
    id: "ambito",
    url: "https://www.ambito.com/rss/pages/home.xml",
    baseTags: ["Argentina", "Economía"],
  },
  {
    name: "El Cronista",
    id: "cronista",
    url: "https://www.cronista.com/rss/feed.xml",
    baseTags: ["Argentina", "Economía"],
  },
];

// ─── RSS Parser ────────────────────────────────────────────────────────────────
interface RssItem {
  title: string;
  url: string;
  description: string;
  pubDate: string;
}

function extractTag(xml: string, tag: string): string {
  // Handles CDATA, namespaced tags, and regular tags
  const escaped = tag.replace(":", "\\:");
  const re = new RegExp(
    `<${escaped}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${escaped}>`,
    "i"
  );
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function extractLinkAtom(xml: string): string {
  // For Atom <link href="..." />
  const m = xml.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/i)
    || xml.match(/<link[^>]+href="([^"]+)"[^>]*\/>/i);
  return m ? m[1] : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRSS(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = stripHtml(extractTag(block, "title"));
    const link =
      extractTag(block, "link") ||
      extractTag(block, "guid") ||
      extractLinkAtom(block);
    const description = stripHtml(extractTag(block, "description") || extractTag(block, "summary"));
    const pubDate =
      extractTag(block, "pubDate") ||
      extractTag(block, "dc:date") ||
      extractTag(block, "published") ||
      "";

    if (title && link && link.startsWith("http")) {
      items.push({ title, url: link.trim(), description: description.slice(0, 400), pubDate });
    }
  }

  return items;
}

// ─── Extractor de texto del artículo ──────────────────────────────────────────
async function fetchArticleText(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MIDIA-NewsBot/1.0; +https://lpi1um3910.lovable.app/about)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.5",
      },
      signal: AbortSignal.timeout(9000),
    });

    if (!resp.ok) return "";

    const html = await resp.text();

    // Eliminar partes no-contenido
    const cleaned = html
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Buscar contenedor principal del artículo
    const bodyPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*(?:article-body|nota-content|article-text|post-content|entry-content|story-body|article__body|content-body|cuerpo-nota|article-detail)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*(?:article-body|nota-content|content|main-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];

    let bodyHtml = "";
    for (const pattern of bodyPatterns) {
      const found = cleaned.match(pattern);
      if (found && found[1].length > 300) {
        bodyHtml = found[1];
        break;
      }
    }

    // Fallback: usar todo el HTML limpio
    if (!bodyHtml) bodyHtml = cleaned;

    // Extraer párrafos de texto (más preciso que strip genérico)
    const paragraphs: string[] = [];
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pm: RegExpExecArray | null;
    while ((pm = pRe.exec(bodyHtml)) !== null) {
      const text = stripHtml(pm[1]);
      if (text.length > 40) paragraphs.push(text);
    }

    const result = paragraphs.length > 0 ? paragraphs.join(" ") : stripHtml(bodyHtml);

    // Máximo 6000 caracteres para no saturar el prompt
    return result.slice(0, 6000);
  } catch (e) {
    console.error(`fetchArticleText(${url}) error:`, e);
    return "";
  }
}

// ─── Detección de temas ────────────────────────────────────────────────────────
function detectTags(title: string, body: string, baseTags: string[]): string[] {
  const text = `${title} ${body}`.toLowerCase();
  const tags = new Set(baseTags);

  if (/econom|inflaci|dólar|dolar|peso\b|finanzas|bolsa|merval|banco central|presupuesto|deuda|fmi|indec|anses|tarifas|subsidio/.test(text))
    tags.add("Economía");
  if (/polític|gobierno|milei|kirchner|congreso|diputad|senado|elecciones|partido|ministro|decreto|veto|ley\b/.test(text))
    tags.add("Política");
  if (/salud|hospital|médico|medicina|enfermedad|pandemia|vacuna|clínica|tratamiento/.test(text))
    tags.add("Salud");
  if (/tecnolog|inteligencia artificial|\bia\b|startup|digital|software|app\b|internet|ciberseguridad/.test(text))
    tags.add("Tecnología");
  if (/ambiente|glaciares|clima|climático|contaminación|ecolog|biodiversidad|energía renovable|solar|eólica|forestal/.test(text))
    tags.add("Ambiente");
  if (/deporte|fútbol|futbol|messi|river|boca|mundial|tenis|básquet|rugby|atletismo/.test(text))
    tags.add("Deportes");
  if (/cultura|arte|cine|música|teatro|literatura|exhibición|festival|libro|escritor/.test(text))
    tags.add("Cultura");
  if (/seguridad|crimen|narco|policía|justicia|judicial|delito|robo|homicidio/.test(text))
    tags.add("Seguridad");
  if (/internacional|eeuu|estados unidos|europa|china|brasil|chile|onu|otan|geopolítica|conflicto/.test(text))
    tags.add("Internacional");
  if (/ciencia|investigación|descubrimiento|estudio|universidad|conicet|nasa/.test(text))
    tags.add("Ciencia");

  return [...tags];
}

// ─── Main ──────────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Parámetros opcionales
  let maxPerSource = 3;
  let dryRun = false;
  let sourceFilter: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    if (body.maxPerSource) maxPerSource = Math.min(body.maxPerSource, 10);
    if (body.dryRun === true) dryRun = true;
    if (body.source) sourceFilter = body.source;
  } catch { /* ignorar */ }

  const results: Record<string, unknown>[] = [];
  const errors: Record<string, unknown>[] = [];

  const sources = sourceFilter
    ? RSS_SOURCES.filter((s) => s.id === sourceFilter)
    : RSS_SOURCES;

  for (const source of sources) {
    console.log(`\n📡 Fetching RSS: ${source.name} (${source.url})`);

    let xml = "";
    try {
      const rssResp = await fetch(source.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MIDIA-NewsBot/1.0)",
          Accept: "application/rss+xml,application/xml,text/xml,*/*",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!rssResp.ok) {
        errors.push({ source: source.id, error: `RSS status ${rssResp.status}` });
        continue;
      }
      xml = await rssResp.text();
    } catch (e) {
      errors.push({ source: source.id, error: `RSS fetch failed: ${e}` });
      continue;
    }

    const items = parseRSS(xml).slice(0, maxPerSource);
    console.log(`  → ${items.length} items encontrados`);

    for (const item of items) {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from("news_feed")
        .select("id, status")
        .eq("source_url", item.url)
        .maybeSingle();

      if (existing) {
        console.log(`  ⏭  Ya existe: ${item.title.slice(0, 60)}`);
        continue;
      }

      if (dryRun) {
        results.push({ source: source.id, title: item.title, url: item.url, status: "dry-run" });
        continue;
      }

      // Obtener texto completo
      console.log(`  🌐 Extrayendo: ${item.title.slice(0, 60)}`);
      const bodyText = await fetchArticleText(item.url);
      const finalBody = bodyText.length > 100 ? bodyText : item.description;

      if (!finalBody || finalBody.length < 50) {
        errors.push({ source: source.id, title: item.title, error: "body muy corto" });
        continue;
      }

      const tags = detectTags(item.title, finalBody, source.baseTags);
      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

      // Insertar registro pendiente
      const { data: record, error: insertErr } = await supabase
        .from("news_feed")
        .insert({
          title: item.title,
          summary: item.description,
          body: finalBody,
          source_url: item.url,
          source_name: source.name,
          source_id: source.id,
          tags,
          published_at: publishedAt,
          status: "processing",
        })
        .select()
        .single();

      if (insertErr || !record) {
        errors.push({ source: source.id, title: item.title, error: insertErr?.message ?? "insert failed" });
        continue;
      }

      // Llamar a generate-perspectives
      let perspectives: unknown = null;
      try {
        const perspResp = await fetch(`${supabaseUrl}/functions/v1/generate-perspectives`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
          body: JSON.stringify({ title: item.title, body: finalBody }),
          signal: AbortSignal.timeout(60000),
        });

        if (perspResp.ok) {
          const parsed = await perspResp.json();
          perspectives = parsed.perspectives ?? null;
        } else {
          const errText = await perspResp.text();
          console.error(`  ❌ Perspectives error ${perspResp.status}: ${errText}`);
          await supabase
            .from("news_feed")
            .update({ status: "error", error_msg: `perspectives: ${perspResp.status}` })
            .eq("id", record.id);
          errors.push({ source: source.id, title: item.title, error: `perspectives: ${perspResp.status}` });
          continue;
        }
      } catch (e) {
        const msg = String(e);
        console.error(`  ❌ Perspectives exception: ${msg}`);
        await supabase
          .from("news_feed")
          .update({ status: "error", error_msg: msg })
          .eq("id", record.id);
        errors.push({ source: source.id, title: item.title, error: msg });
        continue;
      }

      // Guardar perspectivas
      await supabase
        .from("news_feed")
        .update({ perspectives, status: "done" })
        .eq("id", record.id);

      console.log(`  ✅ Listo: ${item.title.slice(0, 60)}`);
      results.push({
        id: record.id,
        source: source.id,
        title: item.title,
        url: item.url,
        tags,
        status: "done",
      });
    }
  }

  return new Response(
    JSON.stringify({ processed: results.length, error_count: errors.length, results, errors: errors }),
    { headers: { ...CORS, "Content-Type": "application/json" } }
  );
});
