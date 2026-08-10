import { contact, site } from "@/data/site";

export function ContactSection() {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <p className="contact-section__kicker">{contact.kicker}</p>
      <h2 id="contact-title">{contact.title}</h2>
      <div className="contact-section__footer">
        <p>{contact.body}</p>
        {site.whatsappUrl ? (
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="whatsapp"
            data-cursor-label="Open ↗"
          >
            {contact.ctaLabel} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
      {site.email || site.linkedinUrl ? (
        <div className="contact-section__secondary">
          {site.email ? <a href={`mailto:${site.email}`}>Email</a> : null}
          {site.linkedinUrl ? (
            <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}