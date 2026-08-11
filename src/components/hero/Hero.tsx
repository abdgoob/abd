import Image from "next/image";
import { positioning, site } from "@/data/site";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { RevealText } from "@/components/motion/RevealText";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title" data-hero>
      <HeroVisual />
      <div className="hero__eyebrow" data-hero-eyebrow>
        <span>Independent creative development</span>
        <span>Frontend → Backend</span>
      </div>
      <h1 id="hero-title" className="hero__title" data-hero-title>
        <RevealText text="Hi, I'm" className="hero__title-intro" />
        <RevealText text="Abdullah" className="hero__title-name" />
      </h1>
      <div className="hero__avatar" aria-hidden="true">
        <div data-hero-avatar-depth>
          <div data-hero-avatar-reveal>
            <div data-hero-avatar-idle>
              <div data-hero-avatar-parallax>
                <Image
                  src="/media/hero/abdullah-avatar.webp"
                  alt=""
                  width={636}
                  height={1604}
                  preload
                  sizes="(max-width: 767px) 52vw, (max-width: 1023px) 42vw, 24vw"
                  draggable={false}
                  data-hero-avatar-image
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero__footer" data-hero-footer>
        <p>{positioning.primary}</p>
        <div className="hero__actions">
          {site.whatsappUrl ? (
            <a
              href={site.whatsappUrl}
              className="cursor-target"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp me <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          <a className="cursor-target" href="#selected-work">
            View selected work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <span className="hero__scroll-cue" aria-hidden="true" data-hero-scroll-cue>
        Scroll to explore
      </span>
    </section>
  );
}
