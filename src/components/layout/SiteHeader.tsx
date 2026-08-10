import { site } from "@/data/site";

export function SiteHeader() {
  return (
    <header className="site-header" data-site-header>
      <a
        className="site-header__name"
        href="#home"
        aria-label="Abdullah, home"
        data-scroll-nav="home"
        data-cursor="navigation"
      >
        {site.name}
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#selected-work" data-scroll-nav="work" data-cursor="navigation">Work</a>
        <a href="#services" data-scroll-nav="services" data-cursor="navigation">Services</a>
        <a href="#about" data-scroll-nav="info" data-cursor="navigation">Info</a>
        {site.whatsappUrl ? (
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="whatsapp"
            data-cursor-label="Open ↗"
          >
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </nav>
    </header>
  );
}