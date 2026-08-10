import { about, site } from "@/data/site";

export function AboutSection() {
  return (
    <section id="about" className="about-section home-section" aria-labelledby="about-title">
      <div className="section-heading section-heading--light">
        <p>{about.kicker}</p>
        <p>Independent / Full-stack / Motion-minded</p>
      </div>
      <div className="about-section__grid">
        <h2 id="about-title">{about.title}</h2>
        <div>
          <p>{about.body}</p>
          {site.whatsappUrl ? (
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="whatsapp"
              data-cursor-label="Open ↗"
            >
              {about.ctaLabel} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}