import { processSteps, site } from "@/data/site";

export function ProcessSection() {
  return (
    <section id="process" className="process-section home-section" aria-labelledby="process-title">
      <div className="section-heading">
        <p>How I work</p>
        <p>Clear, direct, collaborative</p>
      </div>
      <div className="home-section__intro">
        <h2 id="process-title">A simple process. No disappearing act.</h2>
        <p>
          You see the work while it is being shaped, understand each decision and always
          know what comes next.
        </p>
      </div>
      <ol className="process-list">
        {processSteps.map((step) => (
          <li className="process-row" key={step.index} data-process-item>
            <span>{step.index}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      {site.whatsappUrl ? (
        <a
          className="section-cta cursor-target"
          href={site.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Start a project <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </section>
  );
}
