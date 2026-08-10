import { Hero } from "@/components/hero/Hero";
import { SelectedWork } from "@/components/work/SelectedWork";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <SelectedWork items={projects} whatsappUrl={site.whatsappUrl} />
      <ServicesSection />
      <ProcessSection />
      <AboutSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}