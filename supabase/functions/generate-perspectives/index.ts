import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un analista de medios experto en LATAM. Tu tarea es tomar un artículo periodístico y generar EXACTAMENTE 3 perspectivas diferentes sobre el mismo hecho.

Devuelve ÚNICAMENTE un JSON válido con esta estructura (sin texto adicional, sin markdown):
{
  "perspectives": [
    {
      "id": "economica",
      "label": "Económica",
      "icon": "📊",
      "tone": "Analítico",
      "content": ["párrafo 1 de 2-3 oraciones", "párrafo 2 de 2-3 oraciones"],
      "keyArguments": ["argumento clave 1", "argumento clave 2", "argumento clave 3"]
    },
    {
      "id": "politica",
      "label": "Política",
      "icon": "🏛️",
      "tone": "Crítico",
      "content": ["párrafo 1 de 2-3 oraciones", "párrafo 2 de 2-3 oraciones"],
      "keyArguments": ["argumento clave 1", "argumento clave 2", "argumento clave 3"]
    },
    {
      "id": "social",
      "label": "Social",
      "icon": "👥",
      "tone": "Humanista",
      "content": ["párrafo 1 de 2-3 oraciones", "párrafo 2 de 2-3 oraciones"],
      "keyArguments": ["argumento clave 1", "argumento clave 2", "argumento clave 3"]
    }
  ]
}

Reglas:
- Cada perspectiva analiza el MISMO hecho desde un ángulo diferente
- El tono debe ser diferente en cada una (analítico, crítico, humanista)
- Los argumentos clave deben ser concisos (máximo 10 palabras cada uno)
- Todo en español, adaptado al contexto latinoamericano
- NO inventes hechos que no estén en el artículo`;

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
          { role: "user", content: `Título: ${title}\n\nArtículo:\n${body}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_perspectives",
              description: "Return the 3 perspectives analysis as structured JSON",
              parameters: {
                type: "object",
                properties: {
                  perspectives: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        icon: { type: "string" },
                        tone: { type: "string" },
                        content: { type: "array", items: { type: "string" } },
                        keyArguments: { type: "array", items: { type: "string" } },
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
