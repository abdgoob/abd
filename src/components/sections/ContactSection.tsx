import { contact, site } from "@/data/site";

export function ContactSection() {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <p className="contact-section__kicker">{contact.kicker}</p>
      <h2 id="contact-title">{contact.title}</h2>
      <div className="contact-section__footer">
        <p>{contact.body}</p>
        <nav className="contact-section__actions" aria-label="Contact options">
          <a
            href={site.calendlyUrl}
            className="contact-section__action contact-section__action--primary cursor-target"
            target="_blank"
            rel="noopener noreferrer"
            data-contact-action="calendly"
          >
            <span className="contact-section__action-label">{contact.primaryCtaLabel}</span>
            <span className="contact-section__action-arrow" aria-hidden="true">↗</span>
          </a>
          {site.whatsappUrl ? (
            <a
              href={site.whatsappUrl}
              className="contact-section__action contact-section__action--secondary cursor-target"
              target="_blank"
              rel="noopener noreferrer"
              data-contact-action="whatsapp"
            >
              <span className="contact-section__action-label">{contact.secondaryCtaLabel}</span>
              <span className="contact-section__action-arrow" aria-hidden="true">↗</span>
            </a>
          ) : null}
        </nav>
      </div>
      {site.email || site.linkedinUrl ? (
        <div className="contact-section__secondary">
          {site.email ? <a className="cursor-target" href={`mailto:${site.email}`}>Email</a> : null}
          {site.linkedinUrl ? (
            <a className="cursor-target" href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
