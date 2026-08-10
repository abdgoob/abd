export type SiteConfig = {
  name: string;
  whatsappUrl: string | null;
  email: string | null;
  linkedinUrl: string | null;
};

export type ProjectSlug =
  | "crav"
  | "zens-den"
  | "north-co"
  | "nova-ai"
  | "archform"
  | "forma-studio"
  | "northstar";

export type ProjectMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  note?: string;
};

export type Project = {
  slug: ProjectSlug;
  title: readonly [string, string];
  compactTitle: string;
  category: string;
  role: string;
  shortDescription: string;
  longDescription: string;
  liveUrl: string | null;
  contactLabel: string;
  cover: ProjectMedia;
  media: readonly ProjectMedia[];
  capabilities: readonly string[];
  palette: {
    background: string;
    foreground: string;
    accent: string;
  };
};

export type ServiceItem = {
  index: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export type ProcessStep = {
  index: string;
  title: string;
  body: string;
};