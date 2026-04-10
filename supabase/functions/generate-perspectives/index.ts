import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── ArgentinaDatos: fetch real-time economic context ─────────────────────────
interface ArgentinaContext {
  inflacionMensual: number | null;
  inflacionAnual: number | null;
  dolarOficial: number | null;
  dolarBlue: number | null;
  dolarMep: number | null;
}

async function fetchArgentinaContext(): Promise<ArgentinaContext> {
  const base = "https://api.argentinadatos.com/v1";
  const ctx: ArgentinaContext = {
    inflacionMensual: null,
    inflacionAnual: null,
    dolarOficial: null,
    dolarBlue: null,
    dolarMep: null,
  };

  try {
    const [inflMensual, inflAnual, dolares] = await Promise.allSettled([
      fetch(`${base}/finanzas/indices/inflacion`).then((r) => r.json()),
      fetch(`${base}/finanzas/indices/inflacionInteranual`).then((r) => r.json()),
      fetch(`${base}/cotizaciones/dolares`).then((r) => r.json()),
    ]);

    if (inflMensual.status === "fulfilled" && Array.isArray(inflMensual.value)) {
      const last = inflMensual.value[inflMensual.value.length - 1];
      ctx.inflacionMensual = last?.valor ?? null;
    }

    if (inflAnual.status === "fulfilled" && Array.isArray(inflAnual.value)) {
      const last = inflAnual.value[inflAnual.value.length - 1];
      ctx.inflacionAnual = last?.valor ?? null;
    }

    if (dolares.status === "fulfilled" && Array.isArray(dolares.value)) {
      // Group by most recent date
      const sorted = [...dolares.value].sort(
        (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      const latest: Record<string, any> = {};
      for (const d of sorted) {
        if (!latest[d.casa]) latest[d.casa] = d;
      }
      ctx.dolarOficial = latest["oficial"]?.venta ?? null;
      ctx.dolarBlue = latest["blue"]?.venta ?? null;
      ctx.dolarMep = latest["mep"]?.venta ?? null;
    }
  } catch (e) {
    console.error("ArgentinaDatos fetch error:", e);
  }

  return ctx;
}

function buildContextBlock(ctx: ArgentinaContext): string {
  const lines: string[] = [];
  if (ctx.inflacionMensual !== null)
    lines.push(`- Inflación mensual (último dato): ${ctx.inflacionMensual}%`);
  if (ctx.inflacionAnual !== null)
    lines.push(`- Inflación interanual (último dato): ${ctx.inflacionAnual}%`);
  if (ctx.dolarOficial !== null)
    lines.push(`- Dólar oficial: $${ctx.dolarOficial}`);
  if (ctx.dolarBlue !== null)
    lines.push(`- Dólar blue: $${ctx.dolarBlue}`);
  if (ctx.dolarMep !== null)
    lines.push(`- Dólar MEP: $${ctx.dolarMep}`);
  if (lines.length === 0) return "";
  return `\n\n📊 DATOS ECONÓMICOS REALES DE ARGENTINA (incorporalos cuando sean relevantes):\n${lines.join("\n")}`;
}

// ─── Detect if article is Argentina-related ────────────────────────────────────
function isArgentinaRelated(title: string, body: string): boolean {
  const text = (title + " " + body).toLowerCase();
  const keywords = [
    "argentina", "argentino", "argentina", "bcra", "banco central", "peso",
    "inflación", "inflacion", "dólar", "dolar", "milei", "kirchner", "merval",
    "indec", "anses", "fmi", "deuda", "bonos", "mendoza", "buenos aires",
    "córdoba", "rosario", "patagonia", "glaciares",
  ];
  return keywords.some((kw) => text.includes(kw));
}

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un analista de medios senior especializado en América Latina. Tu tarea es tomar un artículo periodístico y generar EXACTAMENTE 5 perspectivas profundas y diferenciadas sobre el mismo hecho.

Cada perspectiva debe:
- Tener 3 párrafos densos (3-4 oraciones cada uno)
- Incluir referencias a contexto específico de LATAM cuando sea relevante (instituciones, actores, historia reciente)
- Si se proveen datos económicos reales al final del prompt, INCORPORARLOS en la perspectiva Económica con precisión
- Mantener un tono claramente diferenciado según el ángulo
- Revelar aspectos que las otras perspectivas no enfatizan
- Ir más allá de la superficie: causas estructurales, actores con intereses, impactos de largo plazo

Devuelve ÚNICAMENTE un JSON válido con esta estructura (sin texto adicional, sin markdown):
{
  "perspectives": [
    {
      "id": "economica",
      "label": "Económica",
      "icon": "📈",
      "tone": "Analítico",
      "content": ["párrafo 1 de 3-4 oraciones", "párrafo 2", "párrafo 3"],
      "keyArguments": ["argumento concreto con dato o actor específico", "argumento 2", "argumento 3"]
    },
    {
      "id": "politica",
      "label": "Política",
      "icon": "🏛️",
      "tone": "Contextual",
      "content": ["párrafo 1", "párrafo 2", "párrafo 3"],
      "keyArguments": ["argumento 1", "argumento 2", "argumento 3"]
    },
    {
      "id": "social",
      "label": "Social",
      "icon": "👥",
      "tone": "Humano",
      "content": ["párrafo 1", "párrafo 2", "párrafo 3"],
      "keyArguments": ["argumento 1", "argumento 2", "argumento 3"]
    },
    {
      "id": "internacional",
      "label": "Internacional",
      "icon": "🌍",
      "tone": "Geopolítico",
      "content": ["párrafo 1", "párrafo 2", "párrafo 3"],
      "keyArguments": ["argumento 1", "argumento 2", "argumento 3"]
    },
    {
      "id": "cultural",
      "label": "Cultural",
      "icon": "🎭",
      "tone": "Reflexivo",
      "content": ["párrafo 1", "párrafo 2", "párrafo 3"],
      "keyArguments": ["argumento 1", "argumento 2", "argumento 3"]
    }
  ]
}

Reglas estrictas:
- Cada perspectiva analiza el MISMO hecho desde un ángulo radicalmente diferente
- Los keyArguments deben ser afirmaciones concretas, no genéricas (máximo 12 palabras)
- Todo en español neutro latinoamericano
- NO inventes hechos que no estén en el artículo, pero SÍ podés agregar contexto histórico real
- La perspectiva Económica DEBE incluir los datos reales provistos (inflación, tipo de cambio) si son relevantes
- La perspectiva Internacional debe conectar con dinámicas regionales o globales
- La perspectiva Cultural debe reflexionar sobre identidad, valores o narrativas colectivas`;

// ─── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { title, body } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title y body son requeridos" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Fetch Argentina economic context if article is related
    let contextBlock = "";
    if (isArgentinaRelated(title, body)) {
      const ctx = await fetchArgentinaContext();
      contextBlock = buildContextBlock(ctx);
      console.log("Argentina context fetched:", JSON.stringify(ctx));
    }

    const userMessage = `Título: ${title}\n\nArtículo:\n${body}${contextBlock}\n\nGenerá 5 perspectivas profundas y diferenciadas sobre esta noticia, con contexto específico de América Latina.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_perspectives",
              description: "Return the 5 perspectives analysis as structured JSON",
              parameters: {
                type: "object",
                properties: {
                  perspectives: {
                    type: "array",
                    minItems: 5,
                    maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        icon: { type: "string" },
                        tone: { type: "string" },
                        content: { type: "array", minItems: 3, items: { type: "string" } },
                        keyArguments: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
                      },
                      required: ["id", "label", "icon", "tone", "content", "keyArguments"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["perspectives"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_perspectives" } },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI gateway error:", response.status, err);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes, intenta de nuevo en unos momentos." }), {
          status: 429, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Agrega fondos en Settings → Cloud & AI balance." }), {
          status: 402, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${err}`);
    }

    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid response from AI");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-perspectives error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
