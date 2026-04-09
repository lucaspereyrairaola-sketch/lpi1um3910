import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un analista de medios senior especializado en América Latina. Tu tarea es tomar un artículo periodístico y generar EXACTAMENTE 5 perspectivas profundas y diferenciadas sobre el mismo hecho.

Cada perspectiva debe:
- Tener 3 párrafos densos (3-4 oraciones cada uno)
- Incluir referencias a contexto específico de LATAM cuando sea relevante (instituciones, actores, historia reciente)
- Citar datos concretos, magnitudes o comparaciones cuando el artículo los provea
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
      "content": ["párrafo 1 de 3-4 oraciones", "párrafo 2 de 3-4 oraciones", "párrafo 3 de 3-4 oraciones"],
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
- La perspectiva Económica debe mencionar impactos cuantitativos si los hay
- La perspectiva Internacional debe conectar con dinámicas regionales o globales
- La perspectiva Cultural debe reflexionar sobre identidad, valores o narrativas colectivas`;

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
          {
            role: "user",
            content: `Título: ${title}\n\nArtículo:\n${body}\n\nGenerá 5 perspectivas profundas y diferenciadas sobre esta noticia, con contexto específico de América Latina.`
          },
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
          status: 429,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Agrega fondos en Settings → Cloud & AI balance." }), {
          status: 402,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${err}`);
    }

    const data = await response.json();

    // Extract from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content directly
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
