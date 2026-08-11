import { site } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        {site.name}
        <span>Independent creative development</span>
      </p>
      <p>Project inquiries</p>
      <div className="site-footer__links">
        {site.email ? <a className="cursor-target" href={`mailto:${site.email}`}>Email</a> : null}
        {site.linkedinUrl ? (
          <a className="cursor-target" href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        ) : null}
        {site.whatsappUrl ? (
          <a
            href={site.whatsappUrl}
            className="cursor-target"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ↗
          </a>
        ) : null}
      </div>
      <p className="site-footer__year">© {new Date().getFullYear()}</p>
    </footer>
  );
}
