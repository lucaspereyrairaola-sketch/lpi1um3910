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
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY no configurada" }), {
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Título: ${title}\n\nArtículo:\n${body}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${err}`);
    }

    const claudeData = await response.json();
    const rawText = claudeData.content[0].text.trim();

    // Parsear JSON de la respuesta
    const parsed = JSON.parse(rawText);

    return new Response(JSON.stringify(parsed), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
