export type Tag = "Politics" | "Economy" | "Social" | "Global" | "Tech";

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
    title: "Labor Reform Approved in Senate",
    neutralSummary: "The Senate approved a comprehensive labor reform package with 58-42 votes, introducing changes to worker protections, gig economy regulations, and collective bargaining rights.",
    date: "2026-02-22",
    readTime: 5,
    tags: ["Politics", "Economy", "Social"],
    perspectives: [
      {
        id: "economic",
        label: "Economic",
        icon: "📊",
        tone: "Analytical",
        content: [
          "The labor reform is projected to impact approximately 45 million workers across various sectors. Economists from major institutions have offered varied assessments of the potential GDP effects, with estimates ranging from a 0.3% boost to a 0.8% reduction depending on implementation specifics.",
          "Business groups argue the reform reduces regulatory burden and could encourage hiring, particularly in the small and medium enterprise sector. The Chamber of Commerce estimates potential creation of 200,000 new positions within the first two years.",
          "However, labor economists point out that similar reforms in other countries have led to increased precarity and wage stagnation. The balance between flexibility and security remains the central economic tension.",
          "Financial markets responded with cautious optimism, with the S&P 500 rising 0.4% on the day of the vote. Sector-specific impacts were more pronounced, with staffing companies seeing gains of 3-5%."
        ],
        keyArguments: [
          "GDP impact estimates vary significantly",
          "SME sector may benefit most from reduced regulation",
          "Historical precedents show mixed results on wages",
          "Markets signaling cautious optimism"
        ]
      },
      {
        id: "political",
        label: "Political",
        icon: "🏛️",
        tone: "Strategic",
        content: [
          "The 58-42 vote revealed fractures within both parties. Six senators crossed party lines, reflecting the complex political calculus ahead of midterm elections. The reform was positioned as a bipartisan achievement, though critics argue the compromises weakened its core provisions.",
          "For the administration, this represents a significant legislative victory and a fulfillment of campaign promises. Political analysts note it could energize the base while potentially alienating swing voters concerned about worker protections.",
          "The opposition has signaled plans to challenge specific provisions through judicial channels, setting the stage for a prolonged legal battle that could extend well beyond the current legislative session.",
          "State-level implementation will vary significantly, creating a patchwork of regulatory environments that could become a major issue in upcoming gubernatorial races."
        ],
        keyArguments: [
          "Bipartisan crossover votes signal political complexity",
          "Administration claims key legislative victory",
          "Legal challenges expected from opposition",
          "State-level implementation creates political battlegrounds"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Human-centered",
        content: [
          "For the estimated 15 million gig economy workers, this reform introduces the first federal framework for benefits and protections. Community organizations have noted both relief and concern — relief at recognition, concern at the specific provisions.",
          "Workers in traditional employment may see changes to overtime calculations, family leave provisions, and collective bargaining procedures. Union leaders have expressed measured support while highlighting gaps in coverage.",
          "The reform's impact on marginalized communities is expected to be disproportionate. Civil rights organizations have pointed out that sectors most affected — hospitality, agriculture, domestic work — employ predominantly minority workers.",
          "Public opinion polls show the country is nearly evenly split, with 48% supporting and 44% opposing the reform. The remaining 8% are undecided, suggesting the messaging battle is far from over."
        ],
        keyArguments: [
          "First federal framework for gig workers",
          "Disproportionate impact on marginalized communities",
          "Union response has been measured",
          "Public opinion nearly evenly split"
        ]
      },
      {
        id: "market",
        label: "Market",
        icon: "📈",
        tone: "Financial",
        content: [
          "Equity markets showed sector-specific reactions. Tech companies with large contractor workforces saw initial dips of 1-2% before recovering. Traditional employers in retail and hospitality showed modest gains on expectations of simplified compliance.",
          "Bond markets remained relatively stable, suggesting institutional investors view the reform as neutral for broader economic fundamentals. The 10-year yield moved less than 2 basis points on the day.",
          "Venture capital investors are closely watching how the reform affects startup labor costs. Early-stage companies that rely heavily on contract workers may need to adjust their burn rate calculations.",
          "International investors are monitoring the reform for signals about the broader regulatory direction, with implications for foreign direct investment decisions in the coming quarters."
        ],
        keyArguments: [
          "Tech sector initially dipped on contractor concerns",
          "Bond markets signaling economic neutrality",
          "Startup ecosystem may face adjusted labor costs",
          "FDI implications being monitored globally"
        ]
      },
      {
        id: "international",
        label: "International",
        icon: "🌍",
        tone: "Comparative",
        content: [
          "The reform positions the country closer to European labor models while maintaining distinctly American elements. EU officials have noted the convergence with interest, particularly regarding gig economy provisions that mirror recent EU directives.",
          "International labor organizations, including the ILO, have offered cautious praise while noting the reform falls short of international standards in several key areas, particularly regarding minimum wage indexing and parental leave.",
          "Trading partners are assessing potential impacts on competitiveness. Some analysts suggest the reform could level the playing field with countries that already have stronger labor protections, potentially reducing the incentive for offshoring.",
          "The reform may influence upcoming labor legislation in Canada, Mexico, and the UK, where similar debates are underway. It signals a potential shift in the global consensus on worker protections."
        ],
        keyArguments: [
          "Convergence with European labor models noted",
          "Falls short of some international standards",
          "Could impact offshoring incentives",
          "May influence legislation in allied nations"
        ]
      },
      {
        id: "ideological",
        label: "Ideological",
        icon: "⚖️",
        tone: "Contrasting",
        content: [
          "Pro-market advocates frame the reform as a necessary modernization that will unleash economic dynamism. They emphasize the flexibility provisions and argue that reducing rigid labor regulations will benefit workers through increased opportunity and employment growth.",
          "Progressive voices counter that the reform represents a weakening of hard-won worker protections. They point to historical patterns where deregulation has led to increased inequality and argue that the flexibility provisions primarily benefit employers at workers' expense.",
          "Centrist analysts note that the reform contains elements that both sides can claim as victories, suggesting it represents the kind of pragmatic compromise necessary in a polarized political environment. The question remains whether such compromises produce meaningful policy or merely dilute competing visions.",
          "Libertarian perspectives welcome the reduction in government mandates while criticizing remaining regulatory provisions. Socialist commentators argue the reform doesn't go far enough in addressing fundamental power imbalances between capital and labor."
        ],
        keyArguments: [
          "Pro-market: Modernization enables economic dynamism",
          "Progressive: Weakens essential worker protections",
          "Centrist: Pragmatic compromise with mixed results",
          "Radical views: Either too much or too little regulation"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Pro-reform outlets frame as 'modernization'; critical outlets frame as 'deregulation'",
        "Business media emphasizes job creation potential; labor media emphasizes protection erosion",
        "International media frames as convergence with global standards; domestic media frames as uniquely American solution"
      ],
      wordChoiceBias: [
        "'Flexibility' vs 'Precarity' when describing reduced employment guarantees",
        "'Reform' vs 'Overhaul' suggesting different scales of change",
        "'Bipartisan' vs 'Compromise' carrying different value judgments"
      ],
      omittedElements: [
        "Pro-reform coverage often omits impact on marginalized communities",
        "Critical coverage often omits potential benefits for gig workers seeking flexibility",
        "Most coverage underreports the enforcement mechanism challenges"
      ]
    },
    journalists: [
      {
        id: "j1",
        name: "Elena Vasquez",
        avatar: "EV",
        bio: "Senior economic correspondent with 15 years covering labor policy and market dynamics.",
        specialization: "Labor Economics",
        articlesCount: 342
      },
      {
        id: "j2",
        name: "Marcus Chen",
        avatar: "MC",
        bio: "Political analyst focusing on legislative strategy and bipartisan dynamics.",
        specialization: "Political Strategy",
        articlesCount: 218
      }
    ]
  },
  {
    id: "ai-regulation-framework",
    title: "Global AI Regulation Framework Proposed",
    neutralSummary: "A coalition of 27 nations proposed the first binding international framework for AI governance, covering autonomous systems, data rights, and algorithmic transparency requirements.",
    date: "2026-02-21",
    readTime: 7,
    tags: ["Tech", "Global", "Politics"],
    perspectives: [
      {
        id: "economic",
        label: "Economic",
        icon: "📊",
        tone: "Analytical",
        content: [
          "The proposed framework could reshape the $800 billion global AI industry. Compliance costs are estimated at 3-8% of revenue for major tech companies, with smaller firms potentially facing proportionally higher burdens.",
          "Industry leaders have warned that overly prescriptive regulations could drive innovation to non-signatory nations, creating regulatory arbitrage. However, standardization advocates argue unified rules reduce the cost of operating across multiple jurisdictions.",
          "The framework's data governance provisions could significantly impact business models built on large-scale data collection. Companies relying on behavioral data may need to fundamentally restructure their approaches.",
          "Investment in AI safety and compliance technology is expected to surge, creating a new sub-sector estimated to reach $50 billion by 2028."
        ],
        keyArguments: [
          "Compliance costs estimated at 3-8% of revenue",
          "Risk of innovation migration to non-signatory nations",
          "Data-dependent business models face restructuring",
          "AI safety sector expected to boom"
        ]
      },
      {
        id: "political",
        label: "Political",
        icon: "🏛️",
        tone: "Strategic",
        content: [
          "The framework represents a rare moment of multilateral consensus, though notable absences from the signatory list — including two of the world's largest AI developers — raise questions about its practical effectiveness.",
          "Domestic politics in several signatory nations may complicate ratification. Tech industry lobbying groups have already begun mobilizing opposition campaigns in key legislative bodies.",
          "The framework establishes a new international body for AI governance, raising sovereignty concerns among some nations wary of ceding regulatory authority to multinational institutions.",
          "Elections in three major signatory nations in the next 18 months could shift political dynamics significantly, potentially undermining commitments made by current governments."
        ],
        keyArguments: [
          "Notable absences weaken framework's reach",
          "Ratification faces domestic political hurdles",
          "New governance body raises sovereignty concerns",
          "Upcoming elections may shift commitments"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Human-centered",
        content: [
          "Civil society organizations have broadly welcomed the framework's provisions on algorithmic transparency, arguing they represent essential protections against automated discrimination and surveillance overreach.",
          "Workers in AI-affected industries see mixed signals. While the framework includes provisions for workforce transition, critics argue the timelines are insufficient for meaningful retraining and adaptation.",
          "Digital rights advocates note the framework's data governance provisions could establish a new global standard for personal data protection, going beyond existing frameworks like GDPR.",
          "Educational institutions face a mandate to incorporate AI literacy into curricula, raising both opportunity and resource concerns across different nations and economic contexts."
        ],
        keyArguments: [
          "Transparency provisions protect against automated discrimination",
          "Workforce transition timelines may be insufficient",
          "Potential new global standard for data protection",
          "AI literacy mandate in education"
        ]
      },
      {
        id: "market",
        label: "Market",
        icon: "📈",
        tone: "Financial",
        content: [
          "Tech stocks experienced volatility following the announcement, with the NASDAQ composite falling 1.2% before partially recovering. Companies with strong compliance infrastructure saw relative outperformance.",
          "The framework creates potential competitive advantages for companies that have already invested in ethical AI practices and transparent algorithms. ESG-focused investors may increase allocations to these firms.",
          "Venture capital investment in AI startups may shift toward compliance-ready solutions. Due diligence processes are expected to increasingly include regulatory risk assessments.",
          "Currency markets in signatory nations showed stability, suggesting confidence in the economic management of the regulatory transition."
        ],
        keyArguments: [
          "NASDAQ saw initial 1.2% decline",
          "Early compliance investors may gain advantage",
          "VC due diligence shifting to include regulatory risk",
          "Currency stability signals economic confidence"
        ]
      },
      {
        id: "international",
        label: "International",
        icon: "🌍",
        tone: "Comparative",
        content: [
          "The framework builds on the EU's AI Act while incorporating perspectives from the Global South, representing a more inclusive approach to technology governance than previous international agreements.",
          "Non-signatory nations face a strategic decision: join a framework shaped by others or develop alternative approaches that risk fragmentation of the global AI ecosystem.",
          "The framework's approach to military AI applications remains deliberately vague, reflecting unresolved tensions between national security interests and the principles of international regulation.",
          "Developing nations have secured provisions for technology transfer and capacity building, though implementation mechanisms remain underdeveloped."
        ],
        keyArguments: [
          "More inclusive than previous tech governance efforts",
          "Non-signatories face fragmentation risks",
          "Military AI applications deliberately unaddressed",
          "Technology transfer provisions need implementation details"
        ]
      },
      {
        id: "ideological",
        label: "Ideological",
        icon: "⚖️",
        tone: "Contrasting",
        content: [
          "Tech optimists argue the framework risks stifling the transformative potential of AI. They emphasize that premature regulation of a rapidly evolving technology could lock in current approaches and prevent beneficial breakthroughs.",
          "Tech skeptics welcome the framework as overdue recognition that AI development without guardrails poses existential risks. They argue self-regulation has demonstrably failed and binding international rules are essential.",
          "Market-oriented perspectives criticize the framework's top-down approach, arguing that competitive market dynamics and liability frameworks would more efficiently identify and address AI risks than prescriptive regulations.",
          "Social justice advocates note the framework doesn't adequately address power concentration in AI development, arguing that governance focused on technical standards misses the fundamental question of who benefits from AI advancement."
        ],
        keyArguments: [
          "Optimists: Premature regulation stifles beneficial innovation",
          "Skeptics: Self-regulation has failed, binding rules essential",
          "Market view: Competition better than prescription",
          "Justice view: Power concentration insufficiently addressed"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Tech media frames as 'regulatory burden'; public interest media frames as 'essential safeguards'",
        "Western media emphasizes innovation impact; Global South media emphasizes access and equity",
        "Industry outlets focus on compliance costs; academic coverage focuses on societal benefits"
      ],
      wordChoiceBias: [
        "'Governance' vs 'Control' implying different levels of intervention",
        "'Innovation-friendly' vs 'Industry-captured' describing the same provisions",
        "'Binding' vs 'Restrictive' carrying different normative weight"
      ],
      omittedElements: [
        "Industry coverage often omits consumer protection benefits",
        "Policy coverage often omits implementation challenges in developing nations",
        "Most coverage underreports the framework's limitations on military AI"
      ]
    },
    journalists: [
      {
        id: "j3",
        name: "Priya Sharma",
        avatar: "PS",
        bio: "Technology policy correspondent covering the intersection of AI, governance, and society.",
        specialization: "AI Policy",
        articlesCount: 156
      }
    ]
  },
  {
    id: "climate-investment-surge",
    title: "Record $4.2 Trillion Climate Investment Announced",
    neutralSummary: "A coalition of sovereign wealth funds, pension funds, and private investors announced the largest coordinated climate investment in history, targeting renewable energy, carbon capture, and climate adaptation infrastructure.",
    date: "2026-02-20",
    readTime: 6,
    tags: ["Economy", "Global", "Social"],
    perspectives: [
      {
        id: "economic",
        label: "Economic",
        icon: "📊",
        tone: "Analytical",
        content: [
          "The $4.2 trillion commitment represents approximately 4% of global GDP allocated over a decade. Economists note this scale of coordinated investment is unprecedented outside of wartime mobilization.",
          "Return projections vary significantly by sector. Renewable energy investments are expected to yield 8-12% annual returns, while carbon capture technologies carry higher risk profiles with 4-7% projected returns.",
          "The investment could create an estimated 15 million new jobs globally, though displacement in fossil fuel industries could affect 3-5 million workers. The net employment impact depends heavily on transition program effectiveness.",
          "Inflationary concerns exist, particularly in construction and raw materials sectors. Demand for critical minerals like lithium, cobalt, and rare earth elements is projected to increase 300-500% over the investment period."
        ],
        keyArguments: [
          "4% of global GDP over a decade — unprecedented scale",
          "Varied return profiles across investment sectors",
          "Net positive employment if transition managed well",
          "Significant inflationary pressure on critical materials"
        ]
      },
      {
        id: "political",
        label: "Political",
        icon: "🏛️",
        tone: "Strategic",
        content: [
          "The announcement strategically bypasses traditional government channels, allowing sovereign wealth funds to commit capital without legislative approval in most jurisdictions.",
          "Political leaders in fossil fuel-dependent economies face pressure from both sides — environmental constituencies demanding faster action and energy sector workers fearing displacement.",
          "The coalition's structure creates new power dynamics in climate negotiations, with financial institutions potentially wielding more influence than some national governments.",
          "Opposition parties in several countries have framed the investment as an overreach by unelected financial elites, setting the stage for populist counter-narratives."
        ],
        keyArguments: [
          "Bypasses legislative processes through financial channels",
          "Creates pressure on fossil fuel-dependent politicians",
          "Shifts power dynamics in climate governance",
          "Populist backlash narrative emerging"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Human-centered",
        content: [
          "Communities most vulnerable to climate change — coastal populations, agricultural workers, indigenous groups — stand to benefit from the adaptation infrastructure investments, though equitable distribution remains uncertain.",
          "The transition's impact on workers in carbon-intensive industries raises justice concerns. Historical precedents suggest displaced workers in declining industries face prolonged unemployment and social disruption.",
          "Environmental justice organizations note the investment's geographic distribution favors developed nations, potentially exacerbating global inequalities in climate resilience.",
          "Public health benefits from reduced fossil fuel use are estimated at $1.2 trillion in avoided healthcare costs over the investment period."
        ],
        keyArguments: [
          "Vulnerable communities may benefit from adaptation spending",
          "Worker displacement concerns in carbon-intensive regions",
          "Geographic equity questions remain unresolved",
          "Significant public health co-benefits projected"
        ]
      },
      {
        id: "market",
        label: "Market",
        icon: "📈",
        tone: "Financial",
        content: [
          "Clean energy stocks surged 5-8% on the announcement. Solar and wind ETFs saw record inflows. Fossil fuel stocks declined 2-4%, with coal companies experiencing the sharpest drops.",
          "Green bond markets are expected to expand dramatically to accommodate the investment flow. Current green bond issuance of $500 billion annually may need to triple.",
          "Insurance companies are reassessing climate risk models in light of the increased adaptation investment, potentially reducing premiums in areas targeted for infrastructure upgrades.",
          "The announcement triggered a reassessment of stranded asset risks in fossil fuel portfolios, with several major pension funds accelerating their divestment timelines."
        ],
        keyArguments: [
          "Clean energy stocks surged 5-8%",
          "Green bond market expansion required",
          "Insurance risk models being reassessed",
          "Accelerated fossil fuel divestment"
        ]
      },
      {
        id: "international",
        label: "International",
        icon: "🌍",
        tone: "Comparative",
        content: [
          "The coalition spans 34 countries across six continents, representing the broadest financial alliance for climate action to date. Notable participants include funds from oil-producing nations, signaling a strategic pivot.",
          "Developing nations have been promised 40% of the total allocation, though the terms of investment — loans versus grants — remain contentious in ongoing negotiations.",
          "The investment scale dwarfs existing multilateral climate funds, potentially rendering institutions like the Green Climate Fund less relevant in the evolving landscape.",
          "Geopolitical implications include reduced dependence on fossil fuel-exporting nations and potential shifts in global energy trade patterns."
        ],
        keyArguments: [
          "Oil-producing nations joining signals strategic shift",
          "40% developing nation allocation under negotiation",
          "May render existing climate funds less relevant",
          "Could reshape global energy geopolitics"
        ]
      },
      {
        id: "ideological",
        label: "Ideological",
        icon: "⚖️",
        tone: "Contrasting",
        content: [
          "Market environmentalists celebrate the investment as proof that capitalism can drive climate solutions. They argue market-based approaches will deliver results faster and more efficiently than government-led alternatives.",
          "Climate justice advocates express concern that the financialization of climate action prioritizes returns over impact, potentially directing resources to profitable projects in wealthy nations rather than urgent needs in vulnerable communities.",
          "Conservative critics argue the scale of coordinated investment distorts markets, crowds out organic private investment, and represents a form of central planning disguised as market activity.",
          "Degrowth advocates question whether investment-driven solutions can address a crisis rooted in overconsumption, arguing that technological fixes perpetuate the growth paradigm causing climate change."
        ],
        keyArguments: [
          "Market view: Capitalism solving climate crisis",
          "Justice view: Financialization prioritizes returns over equity",
          "Conservative: Market distortion and disguised planning",
          "Degrowth: Technology cannot fix a consumption problem"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Financial media frames as 'historic opportunity'; environmental media frames as 'long overdue minimum'",
        "Business outlets emphasize investment returns; justice outlets emphasize equity gaps",
        "Western media celebrates scale; Global South media questions distribution"
      ],
      wordChoiceBias: [
        "'Investment' vs 'Financialization' implying different relationships to profit",
        "'Transition' vs 'Displacement' describing impacts on fossil fuel workers",
        "'Historic' vs 'Insufficient' framing the scale of commitment"
      ],
      omittedElements: [
        "Financial coverage often omits equity and distribution concerns",
        "Environmental coverage often omits legitimate economic transition challenges",
        "Most coverage underreports the governance and accountability mechanisms"
      ]
    },
    journalists: [
      {
        id: "j4",
        name: "Amara Okonkwo",
        avatar: "AO",
        bio: "Climate finance journalist with expertise in international development and environmental economics.",
        specialization: "Climate Finance",
        articlesCount: 203
      },
      {
        id: "j5",
        name: "David Larsson",
        avatar: "DL",
        bio: "Environmental policy reporter covering the intersection of markets, energy, and sustainability.",
        specialization: "Energy Markets",
        articlesCount: 178
      }
    ]
  },
  {
    id: "digital-currency-launch",
    title: "Central Bank Digital Currency Launches in 3 Major Economies",
    neutralSummary: "Three of the world's largest economies simultaneously launched central bank digital currencies (CBDCs), marking the most significant change to monetary infrastructure in decades and raising questions about privacy, financial inclusion, and monetary sovereignty.",
    date: "2026-02-19",
    readTime: 8,
    tags: ["Economy", "Tech", "Global"],
    perspectives: [
      {
        id: "economic",
        label: "Economic",
        icon: "📊",
        tone: "Analytical",
        content: [
          "The simultaneous CBDC launches represent a coordinated effort to reshape global monetary infrastructure. Combined, the three economies account for 45% of global GDP, making this a systemic shift rather than an experiment.",
          "Traditional banking intermediaries face potential disintermediation as CBDCs offer direct central bank accounts to citizens. Banks' deposit bases could shrink by 15-25%, fundamentally altering their business models.",
          "Cross-border payment costs are expected to decrease by 60-80%, potentially unlocking significant economic value for international trade and remittances.",
          "Monetary policy transmission is expected to become more direct and effective, with central banks gaining real-time visibility into economic activity and the ability to implement targeted stimulus."
        ],
        keyArguments: [
          "45% of global GDP now operating CBDCs",
          "Banking disintermediation risk significant",
          "Cross-border costs could drop 60-80%",
          "More direct monetary policy transmission"
        ]
      },
      {
        id: "political",
        label: "Political",
        icon: "🏛️",
        tone: "Strategic",
        content: [
          "The coordinated launch is seen as a geopolitical counter to the growing influence of decentralized cryptocurrencies and private digital currencies from tech companies.",
          "Privacy advocates have raised alarm about the surveillance capabilities inherent in CBDC systems, where every transaction can potentially be monitored by government authorities.",
          "Political opposition in all three countries has framed CBDCs as tools of financial control, resonating with libertarian constituencies concerned about government overreach.",
          "The launches may accelerate CBDC development in other nations, creating pressure on holdout economies to participate or risk being excluded from the new monetary infrastructure."
        ],
        keyArguments: [
          "Geopolitical response to crypto and big tech",
          "Surveillance capabilities raise privacy concerns",
          "Opposition framing as financial control tools",
          "Pressure on non-participating economies"
        ]
      },
      {
        id: "social",
        label: "Social",
        icon: "👥",
        tone: "Human-centered",
        content: [
          "Financial inclusion is a primary justification, with an estimated 1.4 billion unbanked adults potentially gaining access to digital financial services through CBDC infrastructure.",
          "Digital literacy requirements create a new barrier, potentially excluding elderly and technologically marginalized populations from the financial system.",
          "Social welfare distribution could become more efficient and targeted through programmable CBDC features, though this raises concerns about government control over spending behavior.",
          "Community banking and local financial institutions face existential challenges as CBDCs reduce the need for traditional intermediation in underserved areas."
        ],
        keyArguments: [
          "1.4 billion unbanked could gain access",
          "Digital literacy creates new exclusion risks",
          "Programmable money enables but also controls",
          "Community banking model threatened"
        ]
      },
      {
        id: "market",
        label: "Market",
        icon: "📈",
        tone: "Financial",
        content: [
          "Bank stocks in the launching countries fell 3-7% on concerns about deposit flight and business model disruption. Fintech stocks showed mixed performance depending on CBDC integration potential.",
          "Cryptocurrency markets experienced unusual volatility, with Bitcoin dropping 8% before recovering to a 2% loss. Stablecoins saw the largest outflows as CBDC alternatives became available.",
          "Payment processing companies face disruption as CBDC rails could replace existing card networks for domestic transactions, threatening fee-based business models.",
          "Government bond markets showed slight strengthening as CBDCs are expected to enhance monetary policy effectiveness and economic stability."
        ],
        keyArguments: [
          "Bank stocks fell 3-7% on disruption fears",
          "Crypto markets saw significant volatility",
          "Payment processors face existential threat",
          "Bond markets strengthened slightly"
        ]
      },
      {
        id: "international",
        label: "International",
        icon: "🌍",
        tone: "Comparative",
        content: [
          "The three-economy launch creates a de facto CBDC standard that other nations may be pressured to adopt, potentially limiting monetary sovereignty for smaller economies.",
          "Dollar dominance in international trade faces its most significant challenge as CBDCs facilitate bilateral trade settlement without USD intermediation.",
          "International organizations including the IMF and BIS have offered cautious support while warning about fragmentation risks if CBDC systems lack interoperability.",
          "Developing nations face a strategic choice between adopting dominant CBDC platforms or developing independent systems, with significant implications for economic sovereignty."
        ],
        keyArguments: [
          "De facto standard may pressure smaller nations",
          "USD dominance in trade challenged",
          "Interoperability essential to avoid fragmentation",
          "Developing nations face sovereignty dilemma"
        ]
      },
      {
        id: "ideological",
        label: "Ideological",
        icon: "⚖️",
        tone: "Contrasting",
        content: [
          "Modernizers view CBDCs as an inevitable and positive evolution of money, combining the stability of central bank backing with the efficiency of digital technology.",
          "Libertarian critics see CBDCs as the ultimate surveillance tool, enabling governments to monitor, control, and potentially freeze any citizen's financial activity at will.",
          "Progressive advocates hope CBDCs can be designed to reduce financial inequality through features like negative interest rates on large holdings and universal basic income distribution.",
          "Crypto advocates argue CBDCs miss the point of digital currency innovation by centralizing control rather than distributing it, calling them 'digital fiat' rather than genuine innovation."
        ],
        keyArguments: [
          "Modernizers: Natural evolution of money",
          "Libertarians: Ultimate financial surveillance tool",
          "Progressives: Potential for equality-enhancing features",
          "Crypto: Centralization defeats the purpose"
        ]
      }
    ],
    biasAnalysis: {
      framingDifferences: [
        "Government media frames as 'financial innovation'; privacy outlets frame as 'surveillance infrastructure'",
        "Tech media emphasizes efficiency gains; banking media emphasizes disruption risks",
        "Developed nation media focuses on modernization; developing nation media focuses on sovereignty"
      ],
      wordChoiceBias: [
        "'Digital currency' vs 'Surveillance coin' carrying vastly different implications",
        "'Financial inclusion' vs 'Forced digitization' framing the same process differently",
        "'Innovation' vs 'Control' describing identical CBDC features"
      ],
      omittedElements: [
        "Government coverage underreports privacy and surveillance risks",
        "Privacy coverage often omits genuine financial inclusion benefits",
        "Most coverage underreports the technical vulnerabilities and cybersecurity risks"
      ]
    },
    journalists: [
      {
        id: "j6",
        name: "Yuki Tanaka",
        avatar: "YT",
        bio: "Financial technology correspondent specializing in digital currencies and monetary policy.",
        specialization: "Digital Finance",
        articlesCount: 267
      }
    ]
  }
];

export const tagColors: Record<Tag, string> = {
  Politics: "tag-politics",
  Economy: "tag-economy",
  Social: "tag-social",
  Global: "tag-global",
  Tech: "tag-tech",
};
