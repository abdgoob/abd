import type { ProcessStep, ServiceItem, SiteConfig } from "./types";

export const site: SiteConfig = {
  name: "Abdullah",
  whatsappUrl: "https://wa.me/923342239574",
  // TODO: Add real values only when supplied by the owner.
  email: null,
  linkedinUrl: null,
};

export const positioning = {
  primary:
    "I build premium e-commerce and AI-powered websites for agencies and small businesses — frontend to backend.",
  supporting:
    "E-commerce, business and AI-powered websites delivered in weeks — with fast communication and obsessive attention to detail.",
};

export const services: readonly ServiceItem[] = [
  {
    index: "01",
    title: "E-commerce",
    description:
      "Premium digital storefronts combining strong branding, product discovery and smooth purchasing experiences.",
    ctaLabel: "Discuss your store",
  },
  {
    index: "02",
    title: "AI-powered websites",
    description:
      "Modern websites and digital products that combine premium frontend experiences with practical AI functionality.",
    ctaLabel: "Discuss your AI project",
  },
  {
    index: "03",
    title: "Business websites",
    description:
      "High-quality business websites designed around credibility, communication and lead generation.",
    ctaLabel: "Discuss your website",
  },
  {
    index: "04",
    title: "Landing pages",
    description:
      "Focused, polished landing experiences designed for campaigns, launches and offers.",
    ctaLabel: "Build a landing page",
  },
  {
    index: "05",
    title: "Custom web experiences",
    description:
      "Interactive websites combining frontend design, motion and backend functionality.",
    ctaLabel: "Discuss your idea",
  },
];

export const processSteps: readonly ProcessStep[] = [
  {
    index: "01",
    title: "Understand",
    body: "We talk through what you're building, who it's for and what the website needs to accomplish.",
  },
  {
    index: "02",
    title: "Build & show",
    body: "I build quickly and share working previews throughout the project instead of disappearing for weeks.",
  },
  {
    index: "03",
    title: "Refine",
    body: "We review details together. Small decisions are discussed instead of guessed.",
  },
  {
    index: "04",
    title: "Launch",
    body: "I finish the frontend, backend and responsive experience and prepare everything for production.",
  },
];

export const about = {
  kicker: "About",
  title: "Small-team speed. Studio-level care.",
  body:
    "I'm Abdullah, an independent creative developer working across frontend, backend and motion. I help agencies and small businesses turn sharp ideas into expressive, reliable web experiences — with direct communication from first conversation to launch.",
  ctaLabel: "Tell me what you're building",
};

export const contact = {
  kicker: "Have a project in mind?",
  title: "Let's make it impossible to ignore.",
  body:
    "Share what you're building, what needs to change and where you want the website to take the business. I'll reply directly on WhatsApp.",
  ctaLabel: "Start a project",
};