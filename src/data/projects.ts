import type { Project } from "./types";

const cravMedia = [
  {
    src: "/media/crav/crav-hero.webp",
    alt: "CRAV Burgers home experience with oversized red editorial typography",
    width: 1600,
    height: 1000,
    label: "Hero experience",
  },
  {
    src: "/media/crav/crav-editorial.webp",
    alt: "CRAV editorial brand section combining bold type and restaurant imagery",
    width: 1600,
    height: 1000,
    label: "Brand interactions",
  },
  {
    src: "/media/crav/crav-menu.webp",
    alt: "CRAV burger menu and product browsing interface",
    width: 1600,
    height: 1000,
    label: "Menu discovery",
  },
  {
    src: "/media/crav/crav-ordering.webp",
    alt: "CRAV ordering and cart interface",
    width: 1600,
    height: 1000,
    label: "Ordering flow",
  },
  {
    src: "/media/crav/crav-ingredients.webp",
    alt: "CRAV ingredient storytelling section",
    width: 1600,
    height: 1000,
    label: "Ingredient story",
  },
  {
    src: "/media/crav/crav-mobile.webp",
    alt: "CRAV responsive experience shown on a mobile viewport",
    width: 900,
    height: 1400,
    label: "Responsive experience",
  },
] as const;

const vortexCover = {
  src: "/media/vortex/vortex-hero.webp",
  alt: "VORTEX Gym hero experience featuring its structural iron dumbbell",
  width: 1600,
  height: 1000,
  label: "Hero experience",
} as const;

const zensMedia = [
  {
    src: "/media/zens-den/zens-hero.webp",
    alt: "Black and gold cinematic burger composition created as Zen's Den editorial artwork",
    width: 1536,
    height: 1024,
    label: "Cinematic direction",
    note: "Original editorial artwork created for this portfolio.",
  },
  {
    src: "/media/zens-den/zens-menu.webp",
    alt: "Premium dark restaurant menu atmosphere created as Zen's Den editorial artwork",
    width: 1536,
    height: 1024,
    label: "Menu atmosphere",
    note: "Original editorial artwork created for this portfolio.",
  },
  {
    src: "/media/zens-den/zens-assembly.webp",
    alt: "Deconstructed burger assembly in black and gold created as Zen's Den editorial artwork",
    width: 1536,
    height: 1024,
    label: "Assembly sequence",
    note: "Original editorial artwork created for this portfolio.",
  },
  {
    src: "/media/zens-den/zens-reservation.webp",
    alt: "Cinematic restaurant table setting created as Zen's Den editorial artwork",
    width: 1536,
    height: 1024,
    label: "Restaurant atmosphere",
    note: "Original editorial artwork created for this portfolio.",
  },
] as const;

const northCoCover = {
  src: "/media/north-co/north-co-hero.webp",
  alt: "Original editorial still life of premium apparel, leather and sculptural packaging",
  width: 1536,
  height: 1024,
  label: "Storefront direction",
  note: "Original artwork created for this portfolio.",
} as const;

const novaCover = {
  src: "/media/nova-ai/nova-ai-hero.webp",
  alt: "Original luminous violet data form suspended in a deep cobalt environment",
  width: 1536,
  height: 1024,
  label: "Product intelligence",
  note: "Original artwork created for this portfolio.",
} as const;

const archformCover = {
  src: "/media/archform/archform-hero.webp",
  alt: "Original contemporary stone and glass residence in soft coastal daylight",
  width: 1536,
  height: 1024,
  label: "Architecture showcase",
  note: "Original fictional architecture artwork created for this portfolio.",
} as const;

const formaCover = {
  src: "/media/forma-studio/forma-studio-hero.webp",
  alt: "Original red, cream and black mixed-media editorial composition",
  width: 1536,
  height: 1024,
  label: "Creative direction",
  note: "Original artwork created for this portfolio.",
} as const;

const northstarCover = {
  src: "/media/northstar/northstar-hero.webp",
  alt: "Original navy, off-white and cobalt editorial business still life",
  width: 1536,
  height: 1024,
  label: "Business system",
  note: "Original artwork created for this portfolio.",
} as const;

export const projects = [
  {
    slug: "crav",
    title: ["CRAV", "BURGERS"],
    compactTitle: "CRAV BURGERS",
    category: "E-commerce / Restaurant",
    role: "Design & Development",
    shortDescription:
      "A motion-led restaurant commerce experience combining bold art direction, product discovery and an interactive ordering flow.",
    longDescription:
      "CRAV turns a bold restaurant identity into a practical commerce journey. Oversized typography and food storytelling lead into expressive menu discovery, product detail and a responsive ordering flow.",
    liveUrl: "https://www.cravburgers.shop/",
    contactLabel: "Want a website like this?",
    cover: cravMedia[0],
    media: cravMedia,
    capabilities: [
      "Strong visual direction",
      "E-commerce experience",
      "Product discovery",
      "Menu browsing",
      "Interactive ordering",
      "Branded storytelling",
      "Responsive design",
      "Creative frontend development",
    ],
    palette: { background: "#f3dfc8", foreground: "#ee2217", accent: "#ffc719" },
  },
  {
    slug: "vortex",
    title: ["VOR", "TEX"],
    compactTitle: "VORTEX",
    category: "GYM / FITNESS EXPERIENCE",
    role: "Design & Development",
    shortDescription:
      "A bold fitness website built around strong visual hierarchy, immersive motion, clear membership positioning, and a high-energy digital experience designed to make the gym feel as powerful online as it does in person.",
    longDescription:
      "A bold fitness website built around strong visual hierarchy, immersive motion, clear membership positioning, and a high-energy digital experience designed to make the gym feel as powerful online as it does in person.",
    liveUrl: "https://gym-vortex.vercel.app/",
    contactLabel: "Want something like this?",
    cover: vortexCover,
    media: [vortexCover],
    capabilities: [
      "Strong visual hierarchy",
      "Immersive motion",
      "Clear membership positioning",
      "High-energy art direction",
      "Fitness-focused experience",
      "Conversion-focused calls to action",
      "Responsive design",
    ],
    palette: { background: "#f6f6f1", foreground: "#050505", accent: "#666660" },
  },
  {
    slug: "zens-den",
    title: ["ZEN'S", "DEN"],
    compactTitle: "ZEN'S DEN",
    category: "Restaurant / Interactive Experience",
    role: "Design & Development",
    shortDescription:
      "A cinematic restaurant website built around immersive menu exploration, interactive storytelling and a premium black-and-gold visual identity.",
    longDescription:
      "Zen's Den is shaped as a cinematic restaurant journey: a focused menu, atmospheric storytelling and a scroll-driven burger presentation that stays deliberate and usable on every screen.",
    liveUrl: null,
    contactLabel: "Build something like this",
    cover: zensMedia[0],
    media: zensMedia,
    capabilities: [
      "Cinematic visual direction",
      "Immersive menu",
      "Scroll-driven interactions",
      "Responsive design",
      "Restaurant UX",
      "Reservation-focused experience",
      "Strong visual branding",
    ],
    palette: { background: "#17140f", foreground: "#d9d0ba", accent: "#9f8250" },
  },
  {
    slug: "north-co",
    title: ["NORTH &", "CO."],
    compactTitle: "NORTH & CO.",
    category: "Premium E-commerce Store",
    role: "E-commerce Direction / Interaction",
    shortDescription:
      "A refined e-commerce experience focused on editorial product presentation, effortless discovery and a premium shopping journey.",
    longDescription:
      "North & Co. demonstrates how a fashion and lifestyle storefront can feel editorial without losing clarity. The system balances quiet product imagery, collection-led browsing and purposeful commerce interactions.",
    liveUrl: null,
    contactLabel: "Build an e-commerce experience",
    cover: northCoCover,
    media: [northCoCover],
    capabilities: [
      "Fashion and lifestyle storefront",
      "Collection browsing",
      "Product-detail interactions",
      "Cart experience",
      "Brand storytelling",
      "Responsive e-commerce",
      "Motion design",
    ],
    palette: { background: "#efe9dc", foreground: "#201d19", accent: "#8a4b2c" },
  },
  {
    slug: "nova-ai",
    title: ["NOVA", "AI"],
    compactTitle: "NOVA AI",
    category: "AI-Powered SaaS Website",
    role: "Product Story / Interface Direction",
    shortDescription:
      "A modern AI product experience combining interactive demonstrations, clear product communication and a polished SaaS interface.",
    longDescription:
      "Nova AI demonstrates a premium SaaS story without relying on jargon or invented metrics. Product value unfolds through an interactive demonstration, focused feature narratives and a clear onboarding path.",
    liveUrl: null,
    contactLabel: "Build an AI website",
    cover: novaCover,
    media: [novaCover],
    capabilities: [
      "AI product landing experience",
      "Interactive product demonstration",
      "Dashboard UI direction",
      "Onboarding flow",
      "Feature storytelling",
      "Smooth interface transitions",
      "Responsive SaaS design",
    ],
    palette: { background: "#090b2c", foreground: "#ecebff", accent: "#8d62ff" },
  },
  {
    slug: "archform",
    title: ["ARCH", "FORM"],
    compactTitle: "ARCHFORM",
    category: "Architecture / Real Estate",
    role: "Editorial System / Development",
    shortDescription:
      "An immersive property and architecture experience built around large-scale imagery, refined typography and effortless project discovery.",
    longDescription:
      "Archform demonstrates an image-first property experience where architecture stays central. A measured editorial grid supports immersive galleries, focused project details and a direct inquiry journey.",
    liveUrl: null,
    contactLabel: "Build a property website",
    cover: archformCover,
    media: [archformCover],
    capabilities: [
      "Property showcase",
      "Architecture projects",
      "Immersive gallery",
      "Property details",
      "Inquiry experience",
      "Editorial typography",
      "Premium responsive design",
    ],
    palette: { background: "#d8d0c1", foreground: "#24221e", accent: "#687775" },
  },
  {
    slug: "forma-studio",
    title: ["FORMA", "STUDIO"],
    compactTitle: "FORMA STUDIO",
    category: "Creative Agency Website",
    role: "Art Direction / Development",
    shortDescription:
      "A bold editorial agency experience designed around project storytelling, creative credibility and high-quality lead generation.",
    longDescription:
      "Forma Studio demonstrates an expressive agency site that lets the work carry the story. Layered art direction, kinetic typography and clear case-study rhythms lead naturally into project inquiries.",
    liveUrl: null,
    contactLabel: "Build an agency website",
    cover: formaCover,
    media: [formaCover],
    capabilities: [
      "Creative positioning",
      "Agency work showcase",
      "Case-study presentation",
      "Editorial typography",
      "Motion-driven interactions",
      "Lead-generation flow",
    ],
    palette: { background: "#f2eadc", foreground: "#17130f", accent: "#e1271d" },
  },
  {
    slug: "northstar",
    title: ["NORTH", "STAR"],
    compactTitle: "NORTHSTAR",
    category: "Business / Professional Services",
    role: "Positioning / Web Experience",
    shortDescription:
      "A polished professional-services website focused on credibility, clear service communication and converting visitors into conversations.",
    longDescription:
      "Northstar demonstrates a structured business website where positioning is immediate and every section earns its place. Calm visual authority supports service clarity, proof-oriented content and a direct inquiry path.",
    liveUrl: null,
    contactLabel: "Build a business website",
    cover: northstarCover,
    media: [northstarCover],
    capabilities: [
      "Service presentation",
      "Strong positioning",
      "Business credibility",
      "Case-study-style content",
      "Inquiry experience",
      "Responsive design",
      "Lead-generation UX",
    ],
    palette: { background: "#0b1d34", foreground: "#f0ede5", accent: "#376de3" },
  },
] as const satisfies readonly Project[];
