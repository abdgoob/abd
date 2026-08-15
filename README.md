# Creative Developer Portfolio

Abdullah's single-page editorial portfolio, built with Next.js 16.3, React 19, GSAP, Lenis, and Tailwind CSS 4.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production check:

```bash
npm run build
npm run start
```

## Quality checks

```bash
npm run lint
npm run build
npm run test:e2e
```

The Playwright suite runs against a production server in desktop Chromium, mobile Chromium, and desktop WebKit. It covers the eight-project order, inline expansion, hash/history navigation, external links, keyboard and inert states, reduced motion, hero fallbacks, failed priority media, responsive overflow, cursor continuity, and a sustained scroll/resize stress pass.

## Content and architecture

- Typed content and contact configuration live in `src/data/`.
- `/` is the complete experience: Hero → Selected Work → What I Build → How I Work → About → Contact.
- All eight case studies expand inside the homepage. There are no internal project routes or duplicate semantic reel links.
- Header navigation uses `#selected-work`, `#services`, and `#about`; `#contact` is also directly addressable.
- CRAV and VORTEX expose separate live-site actions that open their respective websites in protected new tabs.
- One Lenis instance is connected to GSAP's ticker. The custom cursor and hover media use refs/GSAP setters rather than frame-by-frame React state.
- Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is used automatically for production metadata. `NEXT_PUBLIC_SITE_URL` remains an optional canonical-origin override.

## Media provenance

- `public/media/crav/` contains local optimized captures of the authorized CRAV site; no remote project media is loaded at runtime.
- `public/media/zens-den/` contains original, text-free Zen's Den editorial artwork created for the portfolio.
- `public/media/north-co/`, `nova-ai/`, `archform/`, `forma-studio/`, and `northstar/` contain original, text-free portfolio artwork generated for their respective visual systems. They do not depict client results, testimonials, analytics, awards, or real product dashboards.

## Contact configuration

`src/data/site.ts` contains Abdullah's supplied WhatsApp URL, `https://wa.me/923342239574`. Primary inquiry actions open that conversation in a protected new tab. Email and LinkedIn remain null and are omitted rather than replaced with placeholders.
