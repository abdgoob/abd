import { services, site } from "@/data/site";

export function ServicesSection() {
  return (
    <section id="services" className="services-section home-section" aria-labelledby="services-title">
      <div className="section-heading section-heading--light">
        <p>What I build</p>
        <p>Focused services / Built end to end</p>
      </div>
      <div className="home-section__intro">
        <h2 id="services-title">Premium web experiences with the whole system considered.</h2>
        <p>
          Strategy, interface, motion and implementation stay connected, so the finished
          website feels intentional rather than assembled.
        </p>
      </div>
      <div className="service-list">
        {services.map((service) => (
          <article className="service-row" key={service.index} data-service-item>
            <span>{service.index}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {site.whatsappUrl ? (
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="whatsapp"
                data-cursor-label="Open ↗"
              >
                {service.ctaLabel} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}