export type Tag = "Política" | "Economía" | "Social" | "Global" | "Tech";

export interface Perspective {
  id: string;
  label: string;
  icon: string;
  tone: string;
  content: string[];
  keyArguments: string[];
}

export interface BiasAnalysis {
  framingDifferences: string[];
  wordChoiceBias: string[];
  omittedElements: string[];
}

export interface Journalist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  specialization: string;
  articlesCount: number;
}

export interface NewsEvent {
  id: string;
  title: string;
  neutralSummary: string;
  date: string;
  readTime: number;
  tags: Tag[];
  perspectives: Perspective[];
  biasAnalysis: BiasAnalysis;
  journalists: Journalist[];
}

export const mockEvents: NewsEvent[] = [
  {
    id: "labor-reform-senate",
    title: "Reforma Laboral Aprobada en el Senado",
    neutralSummary: "El Senado aprobó un paquete integral de reforma laboral con 58-42 votos, introduciendo cambios en protecciones laborales, regulación de la economía gig y derechos de negociación colectiva.",
    date: "2026-02-22",
    readTime: 5,
    tags: ["Política", "Economía", "Social"],
    perspectives: [
      {
        id: "economic",
        label: "Económica",
        icon: "📊",
        tone: "Analítico",
        content: [
          "Se proyecta que la reforma laboral impactará a aproximadamente 45 millones de trabajadores en diversos sectores. Economistas de instituciones importantes han ofrecido evaluaciones variadas sobre los posibles efectos en el PIB, con estimaciones que van desde un impulso del 0,3% hasta una reducción del 0,8% según los detalles de implementación.",
          "Los grupos empresariales argumentan que la reforma reduce la carga regulatoria y podría fomentar la contratación, particularmente en el sector de pequeñas y medianas empresas. La Cámara de Comercio estima la creación potencial de 200.000 nuevos puestos en los primeros dos años.",
          "Sin embargo, economistas laborales señalan que reformas similares en otros países han llevado a mayor precariedad y estancamiento salarial. El equilibrio entre flexibilidad y seguridad sigue siendo la tensión económica central.",
          "Los mercados financieros respondieron con optimismo cauteloso, con el S&P 500 subiendo un 0,4% el día de la votación. Los impactos sectoriales fueron más pronunciados, con empresas de personal viendo ganancias del 3-5%."
        ],
        keyArguments: [
          "Las estimaciones de impacto en el PIB varían significativamente",
          "El sector PYME podría beneficiarse más de la reducción regulatoria",
          "Los precedentes históricos muestran resultados mixtos en salarios",
          "Los mercados señalan optimismo cauteloso"
        ]
      },
      {
        id: "political",
        label: "Política",
        icon: "🏛️",
        tone: "Estratégico",
        content: [
          "La votación 58-42 reveló fracturas en ambos partidos. Seis senadores cruzaron líneas partidarias, reflejando el complejo cálculo político ante las elecciones intermedias. La reforma fue presentada como un logro bipartidista, aunque los críticos argumentan que los compromisos debilitaron sus disposiciones centrales.",
          "Para la administración, esto representa una victoria legislativa significativa y el cumplimiento de promesas de campaña. Los analistas políticos señalan que podría energizar la base mientras potencialmente aliena a votantes indecisos preocupados por las protecciones laborales.",
          "La oposición ha señalado planes para impugnar disposiciones específicas a través de canales judiciales, preparando el escenario para una batalla legal prolongada que podría extenderse más allá de la sesión legislativa actual.",
          "La implementación a nivel estatal variará significativamente, creando un mosaico de entornos regulatorios que podría convertirse en un tema importante en próximas elecciones."
        ],
        keyArguments: [
          "Votos cruzados bipartidistas señalan complejidad política",
          "La administración reclama una victoria legislativa clave",
          "Se esperan desafíos legales de la oposición",
          "La implementación estatal crea campos de batalla políticos"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Centrado en las personas",
        content: [
          "Para los aproximadamente 15 millones de trabajadores de la economía gig, esta reforma introduce el primer marco federal de beneficios y protecciones. Las organizaciones comunitarias han expresado tanto alivio como preocupación — alivio por el reconocimiento, preocupación por las disposiciones específicas.",
          "Los trabajadores en empleo tradicional podrían ver cambios en los cálculos de horas extra, provisiones de licencia familiar y procedimientos de negociación colectiva. Los líderes sindicales han expresado apoyo moderado mientras destacan brechas en la cobertura.",
          "Se espera que el impacto de la reforma en comunidades marginadas sea desproporcionado. Las organizaciones de derechos civiles han señalado que los sectores más afectados — hospitalidad, agricultura, trabajo doméstico — emplean predominantemente a trabajadores minoritarios.",
          "Las encuestas de opinión pública muestran que el país está casi dividido por igual, con un 48% apoyando y un 44% oponiéndose a la reforma. El 8% restante está indeciso, sugiriendo que la batalla de comunicación está lejos de terminar."
        ],
        keyArguments: [
          "Primer marco federal para trabajadores gig",
          "Impacto desproporcionado en comunidades marginadas",
          "La respuesta sindical ha sido moderada",
          "La opinión pública está casi dividida por igual"
        ]
      },
      {
        id: "market",
        label: "Mercado",
        icon: "📈",
        tone: "Financiero",
        content: [
          "Los mercados de renta variable mostraron reacciones sectoriales. Las empresas tecnológicas con grandes fuerzas de contratistas vieron caídas iniciales del 1-2% antes de recuperarse. Los empleadores tradicionales en retail y hospitalidad mostraron ganancias modestas ante expectativas de cumplimiento simplificado.",
          "Los mercados de bonos se mantuvieron relativamente estables, sugiriendo que los inversores institucionales ven la reforma como neutral para los fundamentos económicos más amplios. El rendimiento a 10 años se movió menos de 2 puntos base en el día.",
          "Los inversores de capital de riesgo están observando de cerca cómo la reforma afecta los costos laborales de las startups. Las empresas en etapa temprana que dependen mucho de trabajadores contratistas podrían necesitar ajustar sus cálculos de burn rate.",
          "Los inversores internacionales están monitoreando la reforma en busca de señales sobre la dirección regulatoria más amplia, con implicaciones para las decisiones de inversión extranjera directa en los próximos trimestres."
        ],
        keyArguments: [
          "El sector tecnológico cayó inicialmente por preocupaciones sobre contratistas",
          "Los mercados de bonos señalan neutralidad económica",
          "El ecosistema startup podría enfrentar costos laborales ajustados",
          "Las implicaciones de IED están siendo monitoreadas globalmente"
        ]
      },
      {
        id: "international",
        label: "Internacional",
        icon: "🌍",
        tone: "Comparativo",
        content: [
          "La reforma posiciona al país más cerca de los modelos laborales europeos mientras mantiene elementos distintivamente americanos. Los funcionarios de la UE han notado la convergencia con interés, particularmente respecto a las disposiciones de la economía gig que reflejan directivas recientes de la UE.",
          "Las organizaciones laborales internacionales, incluyendo la OIT, han ofrecido elogios cautelosos mientras señalan que la reforma no alcanza los estándares internacionales en varias áreas clave, particularmente respecto a la indexación del salario mínimo y la licencia parental.",
          "Los socios comerciales están evaluando los posibles impactos en la competitividad. Algunos analistas sugieren que la reforma podría nivelar el campo de juego con países que ya tienen protecciones laborales más fuertes, potencialmente reduciendo el incentivo para la deslocalización.",
          "La reforma podría influir en la próxima legislación laboral en Canadá, México y el Reino Unido, donde debates similares están en curso. Señala un posible cambio en el consenso global sobre protecciones laborales."
        ],
        keyArguments: [
          "Se nota convergencia con modelos laborales europeos",
          "No alcanza algunos estándares internacionales",
          "Podría impactar los incentivos de deslocalización",
          "Puede influir en la legislación de naciones aliadas"
        ]
      },
      {
        id: "ideological",
        label: "Ideológica",
        icon: "⚖️",
        tone: "Contrastante",
        content: [
          "Los defensores del libre mercado enmarcan la reforma como una modernización necesaria que liberará el dinamismo económico. Enfatizan las disposiciones de flexibilidad y argumentan que reducir las regulaciones laborales rígidas beneficiará a los trabajadores a través de mayor oportunidad y crecimiento del empleo.",
          "Las voces progresistas contraargumentan que la reforma representa un debilitamiento de protecciones laborales ganadas con esfuerzo. Señalan patrones históricos donde la desregulación ha llevado a mayor desigualdad y argumentan que las disposiciones de flexibilidad benefician principalmente a los empleadores a expensas de los trabajadores.",
          "Los analistas centristas notan que la reforma contiene elementos que ambos lados pueden reclamar como victorias, sugiriendo que representa el tipo de compromiso pragmático necesario en un ambiente político polarizado. La pregunta sigue siendo si tales compromisos producen política significativa o simplemente diluyen visiones contrapuestas.",
          "Las perspectivas libertarias dan la bienvenida a la reducción de mandatos gubernamentales mientras critican las disposiciones regulatorias restantes. Los comentaristas socialistas argumentan que la reforma no va lo suficientemente lejos en abordar los desequilibrios fundamentales de poder entre capital y trabajo."
        ],
        keyArguments: [
          "Pro-mercado: La modernización permite el dinamismo económico",
          "Progresista: Debilita protecciones laborales esenciales",
          "Centrista: Compromiso pragmático con resultados mixtos",
          "Radicales: O demasiada o muy poca regulación"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Medios pro-reforma enmarcan como 'modernización'; medios críticos enmarcan como 'desregulación'",
        "Medios empresariales enfatizan potencial de creación de empleo; medios laborales enfatizan erosión de protecciones",
        "Medios internacionales enmarcan como convergencia con estándares globales; medios nacionales enmarcan como solución única"
      ],
      wordChoiceBias: [
        "'Flexibilidad' vs 'Precariedad' al describir garantías de empleo reducidas",
        "'Reforma' vs 'Reestructuración' sugiriendo diferentes escalas de cambio",
        "'Bipartidista' vs 'Compromiso' con diferentes juicios de valor"
      ],
      omittedElements: [
        "La cobertura pro-reforma a menudo omite el impacto en comunidades marginadas",
        "La cobertura crítica a menudo omite los beneficios potenciales para trabajadores gig que buscan flexibilidad",
        "La mayoría de la cobertura subreporta los desafíos de los mecanismos de aplicación"
      ]
    },
    journalists: [
      {
        id: "j1",
        name: "Elena Vasquez",
        avatar: "EV",
        bio: "Corresponsal económica senior con 15 años cubriendo política laboral y dinámica de mercados.",
        specialization: "Economía Laboral",
        articlesCount: 342
      },
      {
        id: "j2",
        name: "Marcus Chen",
        avatar: "MC",
        bio: "Analista político enfocado en estrategia legislativa y dinámicas bipartidistas.",
        specialization: "Estrategia Política",
        articlesCount: 218
      }
    ]
  },
  {
    id: "ai-regulation-framework",
    title: "Se Propone Marco Global de Regulación de IA",
    neutralSummary: "Una coalición de 27 naciones propuso el primer marco internacional vinculante para la gobernanza de la IA, cubriendo sistemas autónomos, derechos de datos y requisitos de transparencia algorítmica.",
    date: "2026-02-21",
    readTime: 7,
    tags: ["Tech", "Global", "Política"],
    perspectives: [
      {
        id: "economic",
        label: "Económica",
        icon: "📊",
        tone: "Analítico",
        content: [
          "El marco propuesto podría remodelar la industria global de IA de $800 mil millones. Los costos de cumplimiento se estiman en 3-8% de los ingresos para las principales empresas tecnológicas, con empresas más pequeñas enfrentando potencialmente cargas proporcionalmente mayores.",
          "Líderes de la industria han advertido que regulaciones excesivamente prescriptivas podrían impulsar la innovación hacia naciones no signatarias, creando arbitraje regulatorio. Sin embargo, los defensores de la estandarización argumentan que las reglas unificadas reducen el costo de operar en múltiples jurisdicciones.",
          "Las disposiciones de gobernanza de datos del marco podrían impactar significativamente los modelos de negocio basados en la recopilación de datos a gran escala. Las empresas que dependen de datos conductuales podrían necesitar reestructurar fundamentalmente sus enfoques.",
          "Se espera que la inversión en seguridad y cumplimiento de IA aumente, creando un nuevo subsector que se estima alcanzará los $50 mil millones para 2028."
        ],
        keyArguments: [
          "Costos de cumplimiento estimados en 3-8% de ingresos",
          "Riesgo de migración de innovación a naciones no signatarias",
          "Modelos de negocio dependientes de datos enfrentan reestructuración",
          "Se espera un boom en el sector de seguridad de IA"
        ]
      },
      {
        id: "political",
        label: "Política",
        icon: "🏛️",
        tone: "Estratégico",
        content: [
          "El marco representa un momento raro de consenso multilateral, aunque las ausencias notables de la lista de signatarios — incluyendo dos de los mayores desarrolladores de IA del mundo — plantean preguntas sobre su efectividad práctica.",
          "La política interna en varios países signatarios podría complicar la ratificación. Los grupos de lobby de la industria tecnológica ya han comenzado a movilizar campañas de oposición en cuerpos legislativos clave.",
          "El marco establece un nuevo organismo internacional para la gobernanza de IA, planteando preocupaciones de soberanía entre algunas naciones cautelosas de ceder autoridad regulatoria a instituciones multinacionales.",
          "Las elecciones en tres naciones signatarias importantes en los próximos 18 meses podrían cambiar significativamente las dinámicas políticas, potencialmente socavando los compromisos asumidos por los gobiernos actuales."
        ],
        keyArguments: [
          "Las ausencias notables debilitan el alcance del marco",
          "La ratificación enfrenta obstáculos políticos internos",
          "El nuevo organismo de gobernanza plantea preocupaciones de soberanía",
          "Las próximas elecciones pueden cambiar los compromisos"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Centrado en las personas",
        content: [
          "Las organizaciones de la sociedad civil han dado una amplia bienvenida a las disposiciones del marco sobre transparencia algorítmica, argumentando que representan protecciones esenciales contra la discriminación automatizada y el exceso de vigilancia.",
          "Los trabajadores en industrias afectadas por la IA ven señales mixtas. Aunque el marco incluye disposiciones para la transición laboral, los críticos argumentan que los plazos son insuficientes para una reconversión y adaptación significativas.",
          "Los defensores de derechos digitales notan que las disposiciones de gobernanza de datos del marco podrían establecer un nuevo estándar global para la protección de datos personales, superando marcos existentes como el RGPD.",
          "Las instituciones educativas enfrentan un mandato para incorporar la alfabetización en IA en los currículos, planteando tanto oportunidades como preocupaciones de recursos en diferentes naciones y contextos económicos."
        ],
        keyArguments: [
          "Las disposiciones de transparencia protegen contra la discriminación automatizada",
          "Los plazos de transición laboral pueden ser insuficientes",
          "Potencial nuevo estándar global para protección de datos",
          "Mandato de alfabetización en IA en la educación"
        ]
      },
      {
        id: "market",
        label: "Mercado",
        icon: "📈",
        tone: "Financiero",
        content: [
          "Las acciones tecnológicas experimentaron volatilidad tras el anuncio, con el compuesto NASDAQ cayendo un 1,2% antes de recuperarse parcialmente. Las empresas con fuerte infraestructura de cumplimiento vieron un rendimiento relativo superior.",
          "El marco crea ventajas competitivas potenciales para empresas que ya han invertido en prácticas éticas de IA y algoritmos transparentes. Los inversores enfocados en ESG pueden aumentar las asignaciones a estas empresas.",
          "La inversión de capital de riesgo en startups de IA podría desplazarse hacia soluciones preparadas para el cumplimiento. Se espera que los procesos de due diligence incluyan cada vez más evaluaciones de riesgo regulatorio.",
          "Los mercados de divisas en las naciones signatarias mostraron estabilidad, sugiriendo confianza en la gestión económica de la transición regulatoria."
        ],
        keyArguments: [
          "El NASDAQ vio una caída inicial del 1,2%",
          "Los inversores tempranos en cumplimiento pueden ganar ventaja",
          "El due diligence de VC se desplaza para incluir riesgo regulatorio",
          "La estabilidad cambiaria señala confianza económica"
        ]
      },
      {
        id: "international",
        label: "Internacional",
        icon: "🌍",
        tone: "Comparativo",
        content: [
          "El marco se basa en la Ley de IA de la UE mientras incorpora perspectivas del Sur Global, representando un enfoque más inclusivo de gobernanza tecnológica que acuerdos internacionales anteriores.",
          "Las naciones no signatarias enfrentan una decisión estratégica: unirse a un marco moldeado por otros o desarrollar enfoques alternativos que arriesgan la fragmentación del ecosistema global de IA.",
          "El enfoque del marco sobre aplicaciones militares de IA sigue siendo deliberadamente vago, reflejando tensiones no resueltas entre intereses de seguridad nacional y los principios de regulación internacional.",
          "Los países en desarrollo han asegurado disposiciones para transferencia de tecnología y desarrollo de capacidades, aunque los mecanismos de implementación siguen siendo subdesarrollados."
        ],
        keyArguments: [
          "Más inclusivo que esfuerzos previos de gobernanza tecnológica",
          "Los no signatarios enfrentan riesgos de fragmentación",
          "Las aplicaciones militares de IA deliberadamente no abordadas",
          "Las disposiciones de transferencia tecnológica necesitan detalles de implementación"
        ]
      },
      {
        id: "ideological",
        label: "Ideológica",
        icon: "⚖️",
        tone: "Contrastante",
        content: [
          "Los optimistas tecnológicos argumentan que el marco arriesga sofocar el potencial transformador de la IA. Enfatizan que la regulación prematura de una tecnología en rápida evolución podría fijar los enfoques actuales y prevenir avances beneficiosos.",
          "Los escépticos tecnológicos dan la bienvenida al marco como un reconocimiento tardío de que el desarrollo de IA sin barreras plantea riesgos existenciales. Argumentan que la autorregulación ha fallado demostrablemente y que las reglas internacionales vinculantes son esenciales.",
          "Las perspectivas orientadas al mercado critican el enfoque de arriba hacia abajo del marco, argumentando que las dinámicas competitivas del mercado y los marcos de responsabilidad identificarían y abordarían los riesgos de la IA de manera más eficiente que las regulaciones prescriptivas.",
          "Los defensores de la justicia social notan que el marco no aborda adecuadamente la concentración de poder en el desarrollo de IA, argumentando que la gobernanza centrada en estándares técnicos omite la pregunta fundamental de quién se beneficia del avance de la IA."
        ],
        keyArguments: [
          "Optimistas: La regulación prematura sofoca la innovación beneficiosa",
          "Escépticos: La autorregulación ha fallado, las reglas vinculantes son esenciales",
          "Visión de mercado: La competencia es mejor que la prescripción",
          "Visión de justicia: La concentración de poder insuficientemente abordada"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Medios tecnológicos enmarcan como 'carga regulatoria'; medios de interés público enmarcan como 'salvaguardas esenciales'",
        "Medios occidentales enfatizan impacto en innovación; medios del Sur Global enfatizan acceso y equidad",
        "Medios de la industria se enfocan en costos de cumplimiento; cobertura académica se enfoca en beneficios sociales"
      ],
      wordChoiceBias: [
        "'Gobernanza' vs 'Control' implicando diferentes niveles de intervención",
        "'Favorable a la innovación' vs 'Capturado por la industria' describiendo las mismas disposiciones",
        "'Vinculante' vs 'Restrictivo' con diferente peso normativo"
      ],
      omittedElements: [
        "La cobertura de la industria a menudo omite los beneficios de protección al consumidor",
        "La cobertura política a menudo omite los desafíos de implementación en países en desarrollo",
        "La mayoría de la cobertura subreporta las limitaciones del marco sobre IA militar"
      ]
    },
    journalists: [
      {
        id: "j3",
        name: "Priya Sharma",
        avatar: "PS",
        bio: "Corresponsal de política tecnológica cubriendo la intersección de IA, gobernanza y sociedad.",
        specialization: "Política de IA",
        articlesCount: 156
      }
    ]
  },
  {
    id: "climate-investment-surge",
    title: "Anuncian Inversión Climática Récord de $4,2 Billones",
    neutralSummary: "Una coalición de fondos soberanos, fondos de pensiones e inversores privados anunció la mayor inversión climática coordinada de la historia, dirigida a energía renovable, captura de carbono e infraestructura de adaptación climática.",
    date: "2026-02-20",
    readTime: 6,
    tags: ["Economía", "Global", "Social"],
    perspectives: [
      {
        id: "economic",
        label: "Económica",
        icon: "📊",
        tone: "Analítico",
        content: [
          "El compromiso de $4,2 billones representa aproximadamente el 4% del PIB global asignado durante una década. Los economistas notan que esta escala de inversión coordinada no tiene precedentes fuera de la movilización en tiempos de guerra.",
          "Las proyecciones de retorno varían significativamente por sector. Se espera que las inversiones en energía renovable rindan 8-12% de retorno anual, mientras que las tecnologías de captura de carbono tienen perfiles de riesgo más altos con retornos proyectados del 4-7%.",
          "La inversión podría crear un estimado de 15 millones de nuevos empleos globalmente, aunque el desplazamiento en industrias de combustibles fósiles podría afectar a 3-5 millones de trabajadores. El impacto neto en el empleo depende en gran medida de la efectividad de los programas de transición.",
          "Existen preocupaciones inflacionarias, particularmente en los sectores de construcción y materias primas. Se proyecta que la demanda de minerales críticos como litio, cobalto y tierras raras aumente 300-500% durante el período de inversión."
        ],
        keyArguments: [
          "4% del PIB global durante una década — escala sin precedentes",
          "Perfiles de retorno variados entre sectores de inversión",
          "Empleo neto positivo si la transición se gestiona bien",
          "Presión inflacionaria significativa en materiales críticos"
        ]
      },
      {
        id: "political",
        label: "Política",
        icon: "🏛️",
        tone: "Estratégico",
        content: [
          "El anuncio estratégicamente evita los canales gubernamentales tradicionales, permitiendo a los fondos soberanos comprometer capital sin aprobación legislativa en la mayoría de jurisdicciones.",
          "Los líderes políticos en economías dependientes de combustibles fósiles enfrentan presión de ambos lados — constituyentes ambientales demandando acción más rápida y trabajadores del sector energético temiendo el desplazamiento.",
          "La estructura de la coalición crea nuevas dinámicas de poder en las negociaciones climáticas, con instituciones financieras potencialmente ejerciendo más influencia que algunos gobiernos nacionales.",
          "Partidos de oposición en varios países han enmarcado la inversión como un exceso de élites financieras no electas, preparando el escenario para contra-narrativas populistas."
        ],
        keyArguments: [
          "Evita procesos legislativos a través de canales financieros",
          "Crea presión sobre políticos dependientes de combustibles fósiles",
          "Cambia las dinámicas de poder en la gobernanza climática",
          "Emergiendo narrativa de reacción populista"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Centrado en las personas",
        content: [
          "Las comunidades más vulnerables al cambio climático — poblaciones costeras, trabajadores agrícolas, grupos indígenas — podrían beneficiarse de las inversiones en infraestructura de adaptación, aunque la distribución equitativa sigue siendo incierta.",
          "El impacto de la transición en los trabajadores de industrias intensivas en carbono plantea preocupaciones de justicia. Los precedentes históricos sugieren que los trabajadores desplazados en industrias en declive enfrentan desempleo prolongado y disrupción social.",
          "Las organizaciones de justicia ambiental señalan que la distribución geográfica de la inversión favorece a las naciones desarrolladas, potencialmente exacerbando las desigualdades globales en resiliencia climática.",
          "Los beneficios de salud pública por la reducción del uso de combustibles fósiles se estiman en $1,2 billones en costos de atención médica evitados durante el período de inversión."
        ],
        keyArguments: [
          "Las comunidades vulnerables pueden beneficiarse del gasto en adaptación",
          "Preocupaciones por desplazamiento laboral en regiones intensivas en carbono",
          "Las preguntas de equidad geográfica siguen sin resolverse",
          "Se proyectan co-beneficios significativos de salud pública"
        ]
      },
      {
        id: "market",
        label: "Mercado",
        icon: "📈",
        tone: "Financiero",
        content: [
          "Las acciones de energía limpia subieron 5-8% con el anuncio. Los ETF de solar y eólica vieron flujos récord. Las acciones de combustibles fósiles cayeron 2-4%, con las empresas de carbón experimentando las caídas más pronunciadas.",
          "Se espera que los mercados de bonos verdes se expandan dramáticamente para acomodar el flujo de inversión. La emisión actual de bonos verdes de $500 mil millones anuales podría necesitar triplicarse.",
          "Las compañías de seguros están reevaluando los modelos de riesgo climático a la luz de la mayor inversión en adaptación, potencialmente reduciendo primas en áreas destinadas a mejoras de infraestructura.",
          "El anuncio desencadenó una reevaluación de los riesgos de activos varados en carteras de combustibles fósiles, con varios grandes fondos de pensiones acelerando sus cronogramas de desinversión."
        ],
        keyArguments: [
          "Las acciones de energía limpia subieron 5-8%",
          "Se requiere expansión del mercado de bonos verdes",
          "Los modelos de riesgo de seguros están siendo reevaluados",
          "Desinversión acelerada de combustibles fósiles"
        ]
      },
      {
        id: "international",
        label: "Internacional",
        icon: "🌍",
        tone: "Comparativo",
        content: [
          "La coalición abarca 34 países en seis continentes, representando la alianza financiera más amplia para la acción climática hasta la fecha. Los participantes notables incluyen fondos de naciones productoras de petróleo, señalando un giro estratégico.",
          "Se ha prometido a las naciones en desarrollo el 40% de la asignación total, aunque los términos de inversión — préstamos versus donaciones — siguen siendo contenciosos en negociaciones en curso.",
          "La escala de inversión eclipsa los fondos climáticos multilaterales existentes, potencialmente volviendo menos relevantes a instituciones como el Fondo Verde del Clima en el panorama en evolución.",
          "Las implicaciones geopolíticas incluyen menor dependencia de naciones exportadoras de combustibles fósiles y posibles cambios en los patrones de comercio energético global."
        ],
        keyArguments: [
          "La unión de naciones petroleras señala un cambio estratégico",
          "El 40% de asignación para naciones en desarrollo bajo negociación",
          "Puede volver menos relevantes los fondos climáticos existentes",
          "Podría remodelar la geopolítica energética global"
        ]
      },
      {
        id: "ideological",
        label: "Ideológica",
        icon: "⚖️",
        tone: "Contrastante",
        content: [
          "Los ambientalistas de mercado celebran la inversión como prueba de que el capitalismo puede impulsar soluciones climáticas. Argumentan que los enfoques basados en el mercado darán resultados más rápido y eficientemente que las alternativas lideradas por gobiernos.",
          "Los defensores de la justicia climática expresan preocupación por que la financiarización de la acción climática prioriza los retornos sobre el impacto, potencialmente dirigiendo recursos a proyectos rentables en naciones ricas en lugar de necesidades urgentes en comunidades vulnerables.",
          "Los críticos conservadores argumentan que la escala de inversión coordinada distorsiona los mercados, desplaza la inversión privada orgánica y representa una forma de planificación central disfrazada de actividad de mercado.",
          "Los defensores del decrecimiento cuestionan si las soluciones impulsadas por inversión pueden abordar una crisis enraizada en el sobreconsumo, argumentando que las soluciones tecnológicas perpetúan el paradigma de crecimiento que causa el cambio climático."
        ],
        keyArguments: [
          "Visión de mercado: El capitalismo resolviendo la crisis climática",
          "Visión de justicia: La financiarización prioriza retornos sobre equidad",
          "Conservador: Distorsión de mercado y planificación encubierta",
          "Decrecimiento: La tecnología no puede arreglar un problema de consumo"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Medios financieros enmarcan como 'oportunidad histórica'; medios ambientales enmarcan como 'mínimo largamente atrasado'",
        "Medios empresariales enfatizan retornos de inversión; medios de justicia enfatizan brechas de equidad",
        "Medios occidentales celebran la escala; medios del Sur Global cuestionan la distribución"
      ],
      wordChoiceBias: [
        "'Inversión' vs 'Financiarización' implicando diferentes relaciones con el beneficio",
        "'Transición' vs 'Desplazamiento' describiendo impactos en trabajadores de combustibles fósiles",
        "'Histórico' vs 'Insuficiente' enmarcando la escala del compromiso"
      ],
      omittedElements: [
        "La cobertura financiera a menudo omite preocupaciones de equidad y distribución",
        "La cobertura ambiental a menudo omite desafíos legítimos de transición económica",
        "La mayoría de la cobertura subreporta los mecanismos de gobernanza y rendición de cuentas"
      ]
    },
    journalists: [
      {
        id: "j4",
        name: "Amara Okonkwo",
        avatar: "AO",
        bio: "Periodista de finanzas climáticas con experiencia en desarrollo internacional y economía ambiental.",
        specialization: "Finanzas Climáticas",
        articlesCount: 203
      },
      {
        id: "j5",
        name: "David Larsson",
        avatar: "DL",
        bio: "Reportero de política ambiental cubriendo la intersección de mercados, energía y sostenibilidad.",
        specialization: "Mercados Energéticos",
        articlesCount: 178
      }
    ]
  },
  {
    id: "digital-currency-launch",
    title: "Moneda Digital de Banco Central se Lanza en 3 Grandes Economías",
    neutralSummary: "Tres de las economías más grandes del mundo lanzaron simultáneamente monedas digitales de bancos centrales (CBDC), marcando el cambio más significativo en infraestructura monetaria en décadas y planteando preguntas sobre privacidad, inclusión financiera y soberanía monetaria.",
    date: "2026-02-19",
    readTime: 8,
    tags: ["Economía", "Tech", "Global"],
    perspectives: [
      {
        id: "economic",
        label: "Económica",
        icon: "📊",
        tone: "Analítico",
        content: [
          "Los lanzamientos simultáneos de CBDC representan un esfuerzo coordinado para remodelar la infraestructura monetaria global. Combinadas, las tres economías representan el 45% del PIB global, convirtiendo esto en un cambio sistémico en lugar de un experimento.",
          "Los intermediarios bancarios tradicionales enfrentan una potencial desintermediación ya que las CBDC ofrecen cuentas directas del banco central a los ciudadanos. Las bases de depósitos de los bancos podrían reducirse en un 15-25%, alterando fundamentalmente sus modelos de negocio.",
          "Se espera que los costos de pagos transfronterizos disminuyan un 60-80%, potencialmente desbloqueando un valor económico significativo para el comercio internacional y las remesas.",
          "Se espera que la transmisión de política monetaria sea más directa y efectiva, con los bancos centrales obteniendo visibilidad en tiempo real de la actividad económica y la capacidad de implementar estímulos dirigidos."
        ],
        keyArguments: [
          "El 45% del PIB global ahora opera con CBDC",
          "El riesgo de desintermediación bancaria es significativo",
          "Los costos transfronterizos podrían caer 60-80%",
          "Transmisión de política monetaria más directa"
        ]
      },
      {
        id: "political",
        label: "Política",
        icon: "🏛️",
        tone: "Estratégico",
        content: [
          "El lanzamiento coordinado es visto como una respuesta geopolítica a la creciente influencia de las criptomonedas descentralizadas y las monedas digitales privadas de empresas tecnológicas.",
          "Los defensores de la privacidad han dado la alarma sobre las capacidades de vigilancia inherentes en los sistemas CBDC, donde cada transacción puede ser potencialmente monitoreada por autoridades gubernamentales.",
          "La oposición política en los tres países ha enmarcado las CBDC como herramientas de control financiero, resonando con sectores libertarios preocupados por el exceso gubernamental.",
          "Los lanzamientos pueden acelerar el desarrollo de CBDC en otras naciones, creando presión sobre economías rezagadas para participar o arriesgarse a ser excluidas de la nueva infraestructura monetaria."
        ],
        keyArguments: [
          "Respuesta geopolítica a cripto y big tech",
          "Las capacidades de vigilancia plantean preocupaciones de privacidad",
          "La oposición enmarca como herramientas de control financiero",
          "Presión sobre economías no participantes"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Centrado en las personas",
        content: [
          "La inclusión financiera es una justificación principal, con un estimado de 1.400 millones de adultos sin bancarizar potencialmente ganando acceso a servicios financieros digitales a través de la infraestructura CBDC.",
          "Los requisitos de alfabetización digital crean una nueva barrera, potencialmente excluyendo a poblaciones mayores y tecnológicamente marginadas del sistema financiero.",
          "La distribución de asistencia social podría ser más eficiente y dirigida a través de características programables de CBDC, aunque esto plantea preocupaciones sobre el control gubernamental sobre el comportamiento de gasto.",
          "La banca comunitaria y las instituciones financieras locales enfrentan desafíos existenciales ya que las CBDC reducen la necesidad de intermediación tradicional en áreas desatendidas."
        ],
        keyArguments: [
          "1.400 millones de no bancarizados podrían ganar acceso",
          "La alfabetización digital crea nuevos riesgos de exclusión",
          "El dinero programable habilita pero también controla",
          "El modelo de banca comunitaria amenazado"
        ]
      },
      {
        id: "market",
        label: "Mercado",
        icon: "📈",
        tone: "Financiero",
        content: [
          "Las acciones bancarias en los países lanzadores cayeron 3-7% por preocupaciones sobre fuga de depósitos y disrupción del modelo de negocio. Las acciones fintech mostraron rendimiento mixto según el potencial de integración con CBDC.",
          "Los mercados de criptomonedas experimentaron volatilidad inusual, con Bitcoin cayendo un 8% antes de recuperarse a una pérdida del 2%. Las stablecoins vieron las mayores salidas a medida que las alternativas CBDC estuvieron disponibles.",
          "Las empresas de procesamiento de pagos enfrentan disrupción ya que los rieles CBDC podrían reemplazar las redes de tarjetas existentes para transacciones domésticas, amenazando modelos de negocio basados en comisiones.",
          "Los mercados de bonos gubernamentales mostraron un ligero fortalecimiento ya que se espera que las CBDC mejoren la efectividad de la política monetaria y la estabilidad económica."
        ],
        keyArguments: [
          "Las acciones bancarias cayeron 3-7% por temores de disrupción",
          "Los mercados cripto vieron volatilidad significativa",
          "Los procesadores de pagos enfrentan amenaza existencial",
          "Los mercados de bonos se fortalecieron ligeramente"
        ]
      },
      {
        id: "international",
        label: "Internacional",
        icon: "🌍",
        tone: "Comparativo",
        content: [
          "El lanzamiento de tres economías crea un estándar de facto de CBDC que otras naciones podrían verse presionadas a adoptar, potencialmente limitando la soberanía monetaria de economías más pequeñas.",
          "La dominancia del dólar en el comercio internacional enfrenta su desafío más significativo ya que las CBDC facilitan la liquidación de comercio bilateral sin intermediación del USD.",
          "Organizaciones internacionales incluyendo el FMI y el BIS han ofrecido apoyo cauteloso mientras advierten sobre riesgos de fragmentación si los sistemas CBDC carecen de interoperabilidad.",
          "Las naciones en desarrollo enfrentan una elección estratégica entre adoptar plataformas CBDC dominantes o desarrollar sistemas independientes, con implicaciones significativas para la soberanía económica."
        ],
        keyArguments: [
          "El estándar de facto puede presionar a naciones más pequeñas",
          "La dominancia del USD en el comercio desafiada",
          "La interoperabilidad es esencial para evitar fragmentación",
          "Las naciones en desarrollo enfrentan un dilema de soberanía"
        ]
      },
      {
        id: "ideological",
        label: "Ideológica",
        icon: "⚖️",
        tone: "Contrastante",
        content: [
          "Los modernizadores ven las CBDC como una evolución inevitable y positiva del dinero, combinando la estabilidad del respaldo del banco central con la eficiencia de la tecnología digital.",
          "Los críticos libertarios ven las CBDC como la herramienta de vigilancia definitiva, permitiendo a los gobiernos monitorear, controlar y potencialmente congelar la actividad financiera de cualquier ciudadano a voluntad.",
          "Los defensores progresistas esperan que las CBDC puedan diseñarse para reducir la desigualdad financiera a través de características como tasas de interés negativas en grandes tenencias y distribución de renta básica universal.",
          "Los defensores cripto argumentan que las CBDC pierden el punto de la innovación de la moneda digital al centralizar el control en lugar de distribuirlo, llamándolas 'fiat digital' en lugar de innovación genuina."
        ],
        keyArguments: [
          "Modernizadores: Evolución natural del dinero",
          "Libertarios: Herramienta definitiva de vigilancia financiera",
          "Progresistas: Potencial para características que mejoren la igualdad",
          "Cripto: La centralización derrota el propósito"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Medios gubernamentales enmarcan como 'innovación financiera'; medios de privacidad enmarcan como 'infraestructura de vigilancia'",
        "Medios tecnológicos enfatizan ganancias de eficiencia; medios bancarios enfatizan riesgos de disrupción",
        "Medios de naciones desarrolladas se enfocan en modernización; medios de naciones en desarrollo se enfocan en soberanía"
      ],
      wordChoiceBias: [
        "'Moneda digital' vs 'Moneda de vigilancia' con implicaciones vastamente diferentes",
        "'Inclusión financiera' vs 'Digitalización forzada' enmarcando el mismo proceso diferentemente",
        "'Innovación' vs 'Control' describiendo características idénticas de CBDC"
      ],
      omittedElements: [
        "La cobertura gubernamental subreporta riesgos de privacidad y vigilancia",
        "La cobertura de privacidad a menudo omite los genuinos beneficios de inclusión financiera",
        "La mayoría de la cobertura subreporta las vulnerabilidades técnicas y riesgos de ciberseguridad"
      ]
    },
    journalists: [
      {
        id: "j6",
        name: "Yuki Tanaka",
        avatar: "YT",
        bio: "Corresponsal de tecnología financiera especializada en monedas digitales y política monetaria.",
        specialization: "Finanzas Digitales",
        articlesCount: 267
      }
    ]
  }
];

export const tagColors: Record<Tag, string> = {
  "Política": "tag-politics",
  "Economía": "tag-economy",
  Social: "tag-social",
  Global: "tag-global",
  Tech: "tag-tech",
};
