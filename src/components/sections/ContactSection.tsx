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
            className="cursor-target"
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.ctaLabel} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
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
