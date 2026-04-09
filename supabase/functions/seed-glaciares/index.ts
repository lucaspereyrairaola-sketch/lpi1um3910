import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const JOURNALIST_ID = "19cbf4d2-281b-4451-aa9b-324c6cad3ba7";

  const perspectives = [
    {
      id: "economica",
      label: "Económica",
      icon: "📈",
      tone: "Analítico",
      content: [
        "Los proyectos mineros en zonas glaciares y periglaciales representan inversiones potenciales de más de $20.000 millones en divisas para Argentina, un recurso crítico en el contexto de escasez de reservas del Banco Central.",
        "El litio y el oro de las regiones cordilleranas son codiciados por mercados globales: la transición energética mundial disparó la demanda de litio un 300% en cinco años, transformando el subsuelo andino en activo estratégico.",
        "Sin embargo, economistas ambientales advierten que el costo de largo plazo es incalculable: los glaciares regulan el ciclo hídrico de cuencas que irrigan millones de hectáreas agrícolas. Destruir ese capital natural es hipotecar el futuro productivo del país.",
      ],
    },
    {
      id: "politica",
      label: "Política",
      icon: "🏛️",
      tone: "Contextual",
      content: [
        "La presión para modificar la Ley de Glaciares proviene de gobernadores de provincias mineras como San Juan y Mendoza, que ven en la norma un freno a inversiones que necesitan para financiar sus presupuestos provinciales.",
        "El gobierno de Milei enfrenta una tensión interna: su agenda desreguladora choca con la Ley de Glaciares, que goza de amplio consenso social y respaldo judicial tras dos vetos presidenciales históricos antes de su sanción definitiva.",
        "La Corte Suprema de Justicia deberá resolver amparos presentados por comunidades indígenas y organizaciones ambientalistas que bloquean judicialmente cualquier modificación que debilite la protección actual de los glaciares.",
      ],
    },
    {
      id: "social",
      label: "Social",
      icon: "👥",
      tone: "Humano",
      content: [
        "Para los agricultores de Mendoza y San Juan, los glaciares no son un concepto abstracto: son el origen del agua que llega a sus acequias, riega sus viñedos y sostiene una economía agrícola centenaria que emplea a miles de familias.",
        "Las comunidades huarpe y diaguita calchaquí llevan décadas resistiendo la expansión minera en sus territorios ancestrales. Para ellos, los glaciares son seres vivos: su destrucción es también la destrucción de su identidad cultural.",
        "En Mendoza capital, el movimiento 'Agua vale más que el oro' movilizó más de 300.000 personas en marchas que convirtieron la defensa del agua en causa transversal a toda la sociedad.",
      ],
    },
    {
      id: "internacional",
      label: "Internacional",
      icon: "🌍",
      tone: "Geopolítico",
      content: [
        "Argentina forma parte del Triángulo del Litio junto a Chile y Bolivia, concentrando más del 60% de las reservas mundiales del mineral clave para las baterías de vehículos eléctricos. La presión extractiva sobre los Andes tiene origen en la demanda de EE.UU., China y Europa.",
        "El Acuerdo de Escazú, ratificado por Argentina en 2021, obliga al país a garantizar la participación de comunidades en decisiones ambientales, compromisos que entran en tensión directa con la modificación de la Ley de Glaciares.",
        "Chile y Perú observan el debate argentino con atención: la jurisprudencia que se genere puede convertirse en precedente regional para la protección o explotación de glaciares bajo presión minera similar.",
      ],
    },
    {
      id: "cultural",
      label: "Cultural",
      icon: "🎭",
      tone: "Reflexivo",
      content: [
        "El glaciar Perito Moreno es uno de los símbolos más reconocibles de Argentina en el mundo. La discusión sobre los glaciares toca algo profundo en la identidad nacional: ¿qué tipo de país somos y qué queremos dejarle a las generaciones que vienen?",
        "La defensa del agua y los glaciares se convirtió en el primer movimiento ambientalista masivo de Argentina, históricamente subordinada la cuestión ambiental a la urgencia económica. Es un cambio cultural generacional que la política todavía no refleja.",
        "Hay una paradoja simbólica poderosa: Argentina debate destruir glaciares para financiar la transición energética global. El país que sacrifica su agua para que el mundo tenga baterías limpias condensa todas las contradicciones del desarrollo en el siglo XXI.",
      ],
    },
  ];

  // Check if article already exists
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("title", "Ley de Glaciares en Argentina: tensión entre minería y protección ambiental")
    .single();

  if (existing) {
    return new Response(
      JSON.stringify({ message: "Article already exists", id: existing.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data, error } = await supabase.from("articles").insert({
    journalist_id: JOURNALIST_ID,
    title: "Ley de Glaciares en Argentina: tensión entre minería y protección ambiental",
    body: "La Ley de Glaciares (26.639), sancionada en 2010, vuelve al centro del debate político y judicial en Argentina. El gobierno nacional analiza modificaciones que permitirían actividades mineras en zonas de permafrost y periglaciales, actualmente protegidas por la norma. Organizaciones ambientalistas y comunidades de Mendoza, San Juan y Jujuy salieron a las calles en defensa de los glaciares, considerados reservas estratégicas de agua dulce para el país. La tensión entre el modelo extractivista que busca divisas y la protección de ecosistemas frágiles define uno de los debates más urgentes de la agenda ambiental argentina.",
    tags: ["ambiente", "política", "economía", "argentina"],
    access_level: "free",
    published: true,
    published_at: new Date().toISOString(),
    perspectives,
  }).select("id").single();

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ message: "Article created successfully", id: data.id }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
