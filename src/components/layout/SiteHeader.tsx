import { site } from "@/data/site";

export function SiteHeader() {
  return (
    <header className="site-header" data-site-header>
      <a
        className="site-header__name cursor-target"
        href="#home"
        aria-label="Abdullah, home"
        data-scroll-nav="home"
      >
        {site.name}
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="cursor-target" href="#selected-work" data-scroll-nav="work">Work</a>
        <a className="cursor-target" href="#services" data-scroll-nav="services">Services</a>
        <a className="cursor-target" href="#about" data-scroll-nav="info">Info</a>
        <a
          href={site.calendlyUrl}
          className="site-nav__cta site-nav__cta--calendly cursor-target"
          target="_blank"
          rel="noopener noreferrer"
          data-nav-action="calendly"
        >
          Book a call <span aria-hidden="true">↗</span>
        </a>
        {site.whatsappUrl ? (
          <a
            href={site.whatsappUrl}
            className="site-nav__cta site-nav__cta--whatsapp cursor-target"
            target="_blank"
            rel="noopener noreferrer"
            data-nav-action="whatsapp"
          >
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </nav>
    </header>
  );
}
