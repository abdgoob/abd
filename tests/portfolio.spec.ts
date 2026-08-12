import { expect, test, type Locator, type Page } from "@playwright/test";

const projectSlugs = [
  "crav",
  "zens-den",
  "north-co",
  "nova-ai",
  "archform",
  "forma-studio",
  "northstar",
] as const;

const capabilityCounts: Record<(typeof projectSlugs)[number], number> = {
  crav: 8,
  "zens-den": 7,
  "north-co": 7,
  "nova-ai": 7,
  archform: 7,
  "forma-studio": 6,
  northstar: 7,
};

const whatsappUrl = "https://wa.me/923342239574";

async function waitForExperience(page: Page) {
  await expect(page.locator(".page-loader")).toBeHidden({ timeout: 9_000 });
  await expect(page.locator("body")).toHaveAttribute("data-experience-ready", "true");
}

async function expectSectionInViewport(page: Page, selector: string) {
  await expect
    .poll(() =>
      page.locator(selector).evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top < window.innerHeight * 0.35 && bounds.bottom > 0;
      }),
    )
    .toBe(true);
}

async function openProject(page: Page, slug: (typeof projectSlugs)[number]) {
  const button = page.locator(`[data-project-expand="${slug}"]`);
  await button.focus();
  await page.keyboard.press("Enter");
  const panel = page.locator(`[data-project-panel="${slug}"]`);
  await expect(panel).toHaveAttribute("data-expansion-state", "open");
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel).not.toHaveAttribute("inert", "");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  return panel;
}

async function expectExternal(link: Locator, href: string) {
  await expect(link).toHaveAttribute("href", href);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute("rel", /noreferrer/);
}

test("homepage is one ordered seven-project experience with honest contact UI", async ({ page }) => {
  await page.goto("/?webgl-off");
  await waitForExperience(page);

  await expect(page).toHaveTitle(/Abdullah.*Creative Developer/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Hi, I'm\s*Abdullah/i);

  const sectionOrder = await page.locator("main > section").evaluateAll((sections) =>
    sections.map((section) => section.id),
  );
  expect(sectionOrder).toEqual(["home", "selected-work", "services", "process", "about", "contact"]);

  const rows = page.locator("[data-project-index] > [data-project-row]");
  await expect(rows).toHaveCount(7);
  expect(await rows.evaluateAll((items) => items.map((item) => item.getAttribute("data-project-row")))).toEqual(projectSlugs);
  await expect(page.locator('[data-project-index] a[href^="/work/"]')).toHaveCount(0);
  await expect(page.locator("[data-project-expand]")).toHaveCount(7);

  const visibleCopy = await page.locator("body").innerText();
  expect(visibleCopy).not.toMatch(/concept project|demo project|fake project|mock project/i);
  expect(visibleCopy).not.toMatch(/testimonial|award|starting at/i);
  await expect(page.locator(".pricing-list")).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveCount(0);
  expect(await page.locator(`a[href="${whatsappUrl}"]`).count()).toBeGreaterThan(10);
});

test("first and last case studies expand inline without changing route", async ({ page }) => {
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  for (const slug of ["crav", "northstar"] as const) {
    const panel = await openProject(page, slug);
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(panel.locator("[data-project-capability]")).toHaveCount(capabilityCounts[slug]);
    await expect(panel.locator("img").first()).toBeVisible();
    await expect
      .poll(() => panel.locator("img").first().evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }

  await expect(page.locator('[data-project-panel="crav"]')).toHaveAttribute("data-expansion-state", "closed");
  await expect(page.locator('[data-project-panel="crav"]')).toHaveAttribute("inert", "");
});

test("all seven inline studies expose the requested capability systems", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  for (const slug of projectSlugs) {
    const panel = await openProject(page, slug);
    await expect(panel.locator("[data-project-capability]")).toHaveCount(capabilityCounts[slug]);
    await expect(
      panel.locator("[data-project-capability].cursor-target"),
    ).toHaveCount(capabilityCounts[slug]);
    await expect(page.locator("body")).toHaveAttribute("data-expanded-project", slug);
    await expect(page.locator('[data-expansion-state="open"]')).toHaveCount(1);
  }

  const finalButton = page.locator('[data-project-expand="northstar"]');
  await page.locator('[data-project-collapse="northstar"]').click();
  await expect(page.locator('[data-project-panel="northstar"]')).toHaveAttribute("data-expansion-state", "closed");
  await expect(finalButton).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-expanded-project", /.+/);
});

test("rapid project requests settle on the latest study", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  await page.locator('[data-project-expand="crav"]').click();
  await page.locator('[data-project-expand="nova-ai"]').click();
  await page.locator('[data-project-expand="forma-studio"]').click();
  await page.locator('[data-project-expand="northstar"]').click();

  await expect(page.locator('[data-project-panel="northstar"]')).toHaveAttribute("data-expansion-state", "open");
  await expect(page.locator("body")).toHaveAttribute("data-expanded-project", "northstar");
  await expect(page.locator('[data-expansion-state="open"]')).toHaveCount(1);
});

test("other cards and Halftone cover actions remain accessible while a project is open", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/#selected-work");
  await waitForExperience(page);
  await openProject(page, "zens-den");

  const siblingRows = page.locator('[data-project-row]:not([data-project-row="zens-den"])');
  await expect(siblingRows).toHaveCount(projectSlugs.length - 1);
  await expect(page.locator('[data-project-row="crav"]')).not.toHaveAttribute(
    "data-project-dimmed",
    "true",
  );
  await expect(
    page.locator('[data-project-row="crav"] .project-row__summary'),
  ).toHaveCSS("opacity", "1");

  for (const slug of projectSlugs) {
    const coverAction = page.locator(
      slug === "crav"
        ? `[data-project-card-live="${slug}"]`
        : `[data-project-card-expand="${slug}"]`,
    );
    await expect(coverAction).toBeVisible();
    await expect(coverAction.locator("[data-project-halftone]")).toBeVisible();
  }

  const nextCover = page.locator('[data-project-card-expand="north-co"]');
  await nextCover.evaluate((element) => {
    element.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(500);
  await nextCover.click();
  await expect(page.locator('[data-project-panel="zens-den"]')).toHaveAttribute(
    "data-expansion-state",
    "closed",
  );
  await expect(page.locator('[data-project-panel="north-co"]')).toHaveAttribute(
    "data-expansion-state",
    "open",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-expanded-project",
    "north-co",
  );
  await expect(nextCover).toHaveAttribute("aria-expanded", "true");
});

test("CRAV live site and every project contact CTA are external and exact", async ({ page }) => {
  await page.goto("/?webgl-off");
  await waitForExperience(page);

  await expectExternal(
    page.locator('[data-project-live="crav"]'),
    "https://www.cravburgers.shop/",
  );
  await expect(page.locator("[data-project-live]")).toHaveCount(1);
  await expectExternal(
    page.locator('[data-project-card-live="crav"]'),
    "https://www.cravburgers.shop/",
  );
  await expect(page.locator('[data-project-card-live="crav"]')).toContainText(
    "Visit cravburgers.shop",
  );
  await expect(page.locator("[data-project-card-live]")).toHaveCount(1);
  await expect(page.locator("[data-project-card-expand]")).toHaveCount(
    projectSlugs.length - 1,
  );
  for (const slug of projectSlugs.filter((slug) => slug !== "crav")) {
    const coverAction = page.locator(`[data-project-card-expand="${slug}"]`);
    await expect(coverAction).toContainText("Explore project");
    await expect(coverAction).toHaveAttribute(
      "aria-controls",
      `project-panel-${slug}`,
    );
  }

  for (const slug of projectSlugs) {
    const links = page.locator(`[data-project-contact="${slug}"]`);
    expect(await links.count()).toBeGreaterThanOrEqual(2);
    for (let index = 0; index < await links.count(); index += 1) {
      await expectExternal(links.nth(index), whatsappUrl);
    }
  }
});

test("hash navigation, direct contact, and browser history stay on the homepage", async ({ page }) => {
  await page.goto("/?webgl-off");
  await waitForExperience(page);

  await page.locator('[data-scroll-nav="work"]').click();
  await expect(page).toHaveURL(/#selected-work$/);
  await expectSectionInViewport(page, "#selected-work");

  await page.locator('[data-scroll-nav="services"]').click();
  await expect(page).toHaveURL(/#services$/);
  await expectSectionInViewport(page, "#services");

  await page.locator('[data-scroll-nav="info"]').click();
  await expect(page).toHaveURL(/#about$/);
  await expectSectionInViewport(page, "#about");

  await page.goBack();
  await expect(page).toHaveURL(/#services$/);
  await expectSectionInViewport(page, "#services");
  await page.goForward();
  await expect(page).toHaveURL(/#about$/);

  await page.goto("/?webgl-off#contact");
  await waitForExperience(page);
  await expectSectionInViewport(page, "#contact");
  expect(new URL(page.url()).pathname).toBe("/");
});

test("legacy project URLs return not found", async ({ page }) => {
  for (const route of ["/work/crav", "/work/zens-den"]) {
    const response = await page.request.get(route);
    expect(response.status()).toBe(404);
  }
});

test("collapsed details are isolated and keyboard controls restore focus", async ({ page }) => {
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  await expect(page.locator('[data-project-panel][aria-hidden="true"]')).toHaveCount(7);
  await expect(page.locator('[data-project-panel][inert]')).toHaveCount(7);
  await expect(page.locator(".work-list__visual-clone")).toHaveCount(0);

  const explore = page.locator('[data-project-expand="zens-den"]');
  await explore.focus();
  await expect(explore).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-project-panel="zens-den"]')).toHaveAttribute("data-expansion-state", "open");
  const close = page.locator('[data-project-collapse="zens-den"]');
  await close.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-project-panel="zens-den"]')).toHaveAttribute("data-expansion-state", "closed");
  await expect(explore).toBeFocused();
});

test("every project cover uses its own viewport-scoped halftone reveal", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/#selected-work");
  await waitForExperience(page);

  const media = page.locator("[data-project-halftone]");
  await expect(media).toHaveCount(projectSlugs.length);
  const sources = await media.locator("img").evaluateAll((images) =>
    images.map((image) => image.getAttribute("src") ?? ""),
  );
  expect(new Set(sources).size).toBe(projectSlugs.length);
  expect(sources.every((src) => !src.includes("picsum"))).toBe(true);

  const cover = page.locator('[data-project-row="zens-den"] [data-project-halftone]');
  await page.evaluate(() => {
    const row = document.querySelector<HTMLElement>('[data-project-row="zens-den"]');
    if (!row) return;
    const top = row.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.16));
  });
  await expect(cover).toHaveAttribute("data-halftone-state", "active");
  const canvas = cover.locator("canvas");
  await expect(canvas).toBeVisible();
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds) {
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.waitForTimeout(500);
    await expect(canvas).toBeVisible();
    await expect(page.locator("[data-target-cursor]")).toHaveAttribute(
      "data-target-state",
      "idle",
    );
    await expect(page.locator(".target-cursor-corner").first()).toHaveCSS(
      "border-color",
      "rgb(255, 255, 255)",
    );
    await page.evaluate(() => window.scrollBy(0, 24));
    await page.waitForTimeout(260);
    await expect(canvas).toBeVisible();
    await expect(page.locator("[data-target-cursor]")).toHaveAttribute(
      "data-target-state",
      "idle",
    );
  }

  await openProject(page, "zens-den");
  await expect(page.locator('[data-project-panel="zens-den"]')).toBeVisible();
});

test("CRAV halftone cover opens the live site from the image", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.context().route("https://www.cravburgers.shop/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>CRAV Burgers</title>",
    });
  });
  await page.goto("/#selected-work");
  await waitForExperience(page);

  const cover = page.locator('[data-project-row="crav"] [data-project-halftone]');
  await page.evaluate(() => {
    const row = document.querySelector<HTMLElement>('[data-project-row="crav"]')!;
    const top = row.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.16));
  });
  await expect(cover).toHaveAttribute("data-halftone-state", "active");

  const liveCover = page.locator('[data-project-card-live="crav"]');
  const canvas = liveCover.locator("canvas");
  await expect(liveCover).toBeVisible();
  await expect(canvas).toBeVisible();

  const popupPromise = page.context().waitForEvent("page");
  await canvas.click({ position: { x: 40, y: 40 } });
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await expect(popup).toHaveURL("https://www.cravburgers.shop/");
  await popup.close();
});

test("a non-CRAV HalftoneReveal cover opens its inline project", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/#selected-work");
  await waitForExperience(page);

  const slug = "zens-den";
  const row = page.locator(`[data-project-row="${slug}"]`);
  await row.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.16));
  });
  await page.waitForTimeout(500);

  const coverAction = page.locator(`[data-project-card-expand="${slug}"]`);
  const canvas = coverAction.locator("canvas");
  await expect(coverAction).toBeVisible();
  await expect(canvas).toBeVisible();
  await canvas.click({ position: { x: 40, y: 40 } });

  const panel = page.locator(`[data-project-panel="${slug}"]`);
  await expect(panel).toHaveAttribute("data-expansion-state", "open");
  await expect(page.locator("body")).toHaveAttribute(
    "data-expanded-project",
    slug,
  );
});

test("desktop projects form a scroll-driven sticky stack", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium");

  await page.goto("/");
  await waitForExperience(page);

  const index = page.locator("[data-project-index]");
  await expect(index).toHaveAttribute("data-scroll-driven", "stack");

  const firstRow = page.locator('[data-project-row="crav"]');
  await expect(firstRow).toHaveCSS("position", "sticky");
  await expect(firstRow.locator(".project-row__cover img")).toBeVisible();

  const summary = firstRow.locator(".project-row__summary");
  const initialTransform = await summary.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const rowTop = await firstRow.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );

  await page.evaluate((top) => {
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.88));
  }, rowTop);

  await expect
    .poll(() =>
      summary.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initialTransform);

  await page.evaluate((top) => {
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.2));
  }, rowTop);
  await expect(firstRow).toHaveAttribute("data-project-scroll-active", "true");
});

test("reduced motion keeps the hero static and inline work usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#selected-work");
  await waitForExperience(page);

  const visual = page.locator("[data-hero-visual]");
  await expect(visual).toHaveAttribute("data-hero-visual-state", /ready|fallback/);
  await expect(visual).toHaveAttribute("data-motion-profile", "static");
  await expect(visual).toHaveAttribute("data-roll-state", "static");
  await expect(visual).toHaveAttribute("data-pointer-state", "disabled");
  await expect(page.locator("[data-target-cursor]")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/target-cursor-active/);
  const reducedName = page.locator(".hero__title-name");
  await expect(reducedName).toHaveAttribute("data-color-reveal", "disabled");
  expect(
    await reducedName.evaluate(
      (element) => getComputedStyle(element, "::after").display,
    ),
  ).toBe("none");
  await expect(page.locator("canvas, .webgl-stage, [data-webgl-state]")).toHaveCount(
    0,
  );

  await expect(page.locator("[data-hero-cylinder], [data-hero-panel]")).toHaveCount(
    0,
  );
  await expect(page.locator("[data-hero-marquee-segment]")).toHaveCount(5);
  await expect(page.locator("[data-marquee-group]")).toHaveCount(2);

  const track = page.locator("[data-hero-marquee-track]");
  const firstTransform = await track.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.waitForTimeout(500);
  expect(
    await track.evaluate((element) => getComputedStyle(element).transform),
  ).toBe(firstTransform);

  await openProject(page, "nova-ai");
  await expect(page.locator('[data-project-panel="nova-ai"]')).toBeVisible();
});

test("readable hero, lightweight curved marquee, and motion adapt to pointer capability", async ({
  page,
}, testInfo) => {
  const mobile = testInfo.project.name === "mobile-chromium";

  await page.addInitScript(() => {
    const target = window as typeof window & { __heroPhases?: string[] };
    target.__heroPhases = [];
    window.addEventListener("portfolio:hero-intro-phase", ((event: CustomEvent) => {
      target.__heroPhases?.push(String(event.detail?.phase));
    }) as EventListener);
  });
  await page.goto("/");
  await waitForExperience(page);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Hi, I'm.*Abdullah/i,
    }),
  ).toHaveCount(1);
  const name = page.locator(".hero__title-name");
  await expect(name).toHaveAttribute("aria-label", "Abdullah");
  await expect(name.locator(".reveal-text__inner")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  expect(
    await page.evaluate(() => {
      const target = window as typeof window & { __heroPhases?: string[] };
      return target.__heroPhases;
    }),
  ).toEqual([
    "navigation",
    "screen",
    "title",
    "avatar",
    "rolling",
    "support",
    "complete",
  ]);

  const visual = page.locator("[data-hero-visual]");
  await expect(visual).toHaveAttribute("aria-hidden", "true");
  await expect(visual).toHaveAttribute("data-hero-visual-state", "ready");
  await expect(page.locator("canvas, .webgl-stage, [data-webgl-state]")).toHaveCount(
    0,
  );
  await expect(page.locator("[data-hero-cylinder], [data-hero-panel]")).toHaveCount(
    0,
  );

  const marquee = page.locator("[data-hero-marquee]");
  await expect(marquee).toBeVisible();
  const segments = marquee.locator("[data-hero-marquee-segment]");
  await expect(segments).toHaveCount(5);
  expect(
    await segments.evaluateAll((elements) =>
      elements.map((element) =>
        element.getAttribute("data-hero-marquee-segment"),
      ),
    ),
  ).toEqual(["far-left", "left", "center", "right", "far-right"]);

  const groups = marquee.locator("[data-marquee-group]");
  await expect(groups).toHaveCount(2);
  const groupCopy = await groups.allInnerTexts();
  expect(groupCopy[0].replace(/\s+/g, " ").trim()).toBe(
    groupCopy[1].replace(/\s+/g, " ").trim(),
  );
  expect(groupCopy[0]).toMatch(/CREATIVE DEVELOPMENT/i);
  expect(groupCopy[0]).toMatch(/E-COMMERCE/i);
  expect(groupCopy[0]).toMatch(/AI-POWERED WEBSITES/i);
  expect(groupCopy[0]).toMatch(/FRONTEND\s*→\s*BACKEND/i);

  const track = marquee.locator("[data-hero-marquee-track]");
  await expect(track).toHaveCSS("will-change", "transform");
  expect(
    await marquee.locator("*").evaluateAll((elements) =>
      elements
        .filter((element) =>
          getComputedStyle(element).willChange
            .split(",")
            .map((property) => property.trim())
            .includes("transform"),
        )
        .map((element) => element.getAttribute("data-hero-marquee-track")),
    ),
  ).toEqual(["true"]);

  const avatar = page.locator("[data-hero-avatar-image]");
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute("width", "636");
  await expect(avatar).toHaveAttribute("height", "1604");
  const avatarState = await avatar.evaluate((image: HTMLImageElement) => ({
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    objectFit: getComputedStyle(image).objectFit,
  }));
  expect(avatarState.complete).toBe(true);
  expect(avatarState.naturalWidth).toBeGreaterThan(0);
  expect(
    avatarState.naturalWidth / avatarState.naturalHeight,
  ).toBeCloseTo(636 / 1604, 2);
  expect(avatarState.objectFit).toBe("contain");

  const geometry = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]")!;
    const screen = document.querySelector<HTMLElement>(".hero-screen");
    const intro = document.querySelector<HTMLElement>(".hero__title-intro")!;
    const name = document.querySelector<HTMLElement>(".hero__title-name")!;
    const title = document.querySelector<HTMLElement>(".hero__title");
    const avatarRoot = document.querySelector<HTMLElement>(".hero__avatar");
    const support = document.querySelector<HTMLElement>(".hero__footer > p")!;
    const actions = document.querySelector<HTMLElement>(".hero__actions")!;
    const heroBounds = hero.getBoundingClientRect();
    const screenBounds = screen?.getBoundingClientRect();
    const introBounds = intro.getBoundingClientRect();
    const nameBounds = name.getBoundingClientRect();
    const avatarBounds = avatarRoot?.getBoundingClientRect();
    const supportBounds = support.getBoundingClientRect();
    const actionsBounds = actions.getBoundingClientRect();
    const intersectionArea = (a: DOMRect, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const nameArea = Math.max(nameBounds.width * nameBounds.height, 1);
    return {
      heroWidth: heroBounds.width,
      heroHeight: heroBounds.height,
      screen: Number(getComputedStyle(screen!).zIndex),
      title: Number(getComputedStyle(title!).zIndex),
      avatar: Number(getComputedStyle(avatarRoot!).zIndex),
      introWidth: introBounds.width,
      introFontSize: Number.parseFloat(getComputedStyle(intro).fontSize),
      nameWidth: nameBounds.width,
      nameFontSize: Number.parseFloat(getComputedStyle(name).fontSize),
      nameInsideHero:
        nameBounds.left >= heroBounds.left - 1 &&
        nameBounds.right <= heroBounds.right + 1 &&
        nameBounds.top >= heroBounds.top - 1 &&
        nameBounds.bottom <= heroBounds.bottom + 1,
      screenWidth: screenBounds?.width ?? 0,
      screenHeight: screenBounds?.height ?? 0,
      screenNameOverlapRatio: screenBounds
        ? intersectionArea(screenBounds, nameBounds) / nameArea
        : 1,
      avatarNameOverlapRatio: avatarBounds
        ? intersectionArea(avatarBounds, nameBounds) / nameArea
        : 1,
      supportAvatarOverlap: avatarBounds
        ? intersectionArea(supportBounds, avatarBounds)
        : 1,
      actionsAvatarOverlap: avatarBounds
        ? intersectionArea(actionsBounds, avatarBounds)
        : 1,
    };
  });
  expect(geometry.screen).toBeLessThan(geometry.title);
  expect(geometry.title).toBeLessThan(geometry.avatar);
  expect(geometry.nameInsideHero).toBe(true);
  expect(geometry.nameWidth).toBeGreaterThan(geometry.introWidth * 1.8);
  expect(geometry.nameFontSize).toBeGreaterThan(geometry.introFontSize * 1.5);
  expect(geometry.screenNameOverlapRatio).toBe(0);
  expect(geometry.avatarNameOverlapRatio).toBeLessThanOrEqual(0.15);
  expect(geometry.supportAvatarOverlap).toBe(0);
  expect(geometry.actionsAvatarOverlap).toBe(0);
  expect(geometry.screenHeight / geometry.heroHeight).toBeLessThan(0.26);

  if (!mobile) {
    expect(geometry.screenWidth).toBeGreaterThanOrEqual(
      geometry.heroWidth * 0.55 - 1,
    );
    expect(geometry.screenWidth).toBeLessThanOrEqual(
      geometry.heroWidth * 0.7 + 1,
    );
    expect(geometry.screenHeight).toBeGreaterThanOrEqual(107);
    expect(geometry.screenHeight).toBeLessThanOrEqual(145);
  }

  await expectExternal(
    page.getByRole("link", { name: /WhatsApp me/i }),
    whatsappUrl,
  );
  await expect(
    page.getByRole("link", { name: /View selected work/i }),
  ).toHaveAttribute("href", "#selected-work");

  if (mobile) {
    await expect(visual).toHaveAttribute("data-motion-profile", "mobile");
    await expect(visual).toHaveAttribute("data-pointer-state", "disabled");
    await expect(name).toHaveAttribute("data-color-reveal", "disabled");
    expect(
      await name.evaluate(
        (element) => getComputedStyle(element, "::after").display,
      ),
    ).toBe("none");
  } else {
    await expect(visual).toHaveAttribute("data-motion-profile", "desktop");
    await expect(name).toHaveAttribute("data-color-reveal", "idle");
    const revealStyle = await name.evaluate((element) => {
      const style = getComputedStyle(element);
      const pseudo = getComputedStyle(element, "::after");
      return {
        radius: Number.parseFloat(
          style.getPropertyValue("--hero-reveal-radius"),
        ),
        mask:
          pseudo.maskImage || pseudo.getPropertyValue("-webkit-mask-image"),
        background: pseudo.backgroundImage,
      };
    });
    expect(revealStyle.radius).toBeGreaterThanOrEqual(70);
    expect(revealStyle.radius).toBeLessThanOrEqual(110);
    expect(revealStyle.mask).toContain("radial-gradient");
    expect(revealStyle.background).toContain("linear-gradient");
  }

  await expect(visual).toHaveAttribute("data-roll-state", "running");
  const firstTransform = await track.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const firstSegmentTransforms = await segments.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).transform),
  );
  await page.waitForTimeout(700);
  expect(
    await track.evaluate((element) => getComputedStyle(element).transform),
  ).not.toBe(firstTransform);
  expect(
    await segments.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).transform),
    ),
  ).toEqual(firstSegmentTransforms);

  if (mobile) return;

  const heroBounds = await page.locator("[data-hero]").boundingBox();
  expect(heroBounds).not.toBeNull();
  if (heroBounds) {
    await page.mouse.move(
      heroBounds.x + heroBounds.width * 0.72,
      heroBounds.y + heroBounds.height * 0.44,
      { steps: 10 },
    );
  }
  await expect(visual).toHaveAttribute("data-pointer-state", "active");
  await expect(name).toHaveAttribute("data-color-reveal", "active");
  await expect
    .poll(() =>
      name.evaluate((element) =>
        Number.parseFloat(
          getComputedStyle(element).getPropertyValue(
            "--hero-reveal-opacity",
          ),
        ),
      ),
    )
    .toBeGreaterThan(0.9);
  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerleave"));
  });
  await expect(visual).toHaveAttribute("data-pointer-state", "settling");
  await expect(name).toHaveAttribute("data-color-reveal", "settling");
  await expect
    .poll(() => visual.getAttribute("data-pointer-state"))
    .toBe("idle");
  await expect(name).toHaveAttribute("data-color-reveal", "idle");
  await expect
    .poll(() =>
      name.evaluate((element) =>
        Number.parseFloat(
          getComputedStyle(element).getPropertyValue(
            "--hero-reveal-opacity",
          ),
        ),
      ),
    )
    .toBeLessThan(0.05);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(visual).toHaveAttribute("data-roll-state", "paused");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(visual).toHaveAttribute("data-roll-state", "running");
});

test("failed avatar media cannot trap the loader", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.route("**/*", async (route) => {
    if (route.request().url().includes("abdullah-avatar.webp")) {
      await route.abort();
    } else {
      await route.continue();
    }
  });
  await page.goto("/");
  await waitForExperience(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View selected work/i }),
  ).toBeVisible();
});
test("mobile keeps direct navigation, removes the cursor, and expands in place", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);
  await expect(page.locator("[data-target-cursor]")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/target-cursor-active/);
  await expect(page.locator('[data-scroll-nav="work"]')).toBeVisible();
  await expect(page.locator('[data-scroll-nav="services"]')).toBeVisible();
  await expect(page.locator('[data-scroll-nav="info"]')).toBeVisible();
  await expect(page.getByRole("link", { name: /WhatsApp/i }).first()).toBeVisible();
  await openProject(page, "north-co");
  await expect(page.locator('[data-project-panel="north-co"]')).toBeVisible();
});

test("coarse pointers keep all project covers as static original images", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");
  await page.goto("/#selected-work");
  await waitForExperience(page);

  await expect(page.locator('[data-project-halftone][data-halftone-state="fallback"]')).toHaveCount(7);
  await expect(page.locator("[data-project-halftone] img")).toHaveCount(7);
  await expect(page.locator("[data-project-halftone] canvas")).toHaveCount(0);
});

test("supported viewport matrix has no horizontal overflow with a study open", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  const viewports = [
    [320, 568],
    [375, 667],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
    [1920, 1080],
  ] as const;

  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);
  await openProject(page, "forma-studio");

  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(80);
    const heroGeometry = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>("[data-hero]")!;
      const avatar = document.querySelector<HTMLElement>(".hero__avatar")!;
      const screen = document.querySelector<HTMLElement>(".hero-screen")!;
      const title = document.querySelector<HTMLElement>(".hero__title")!;
      const intro = document.querySelector<HTMLElement>(".hero__title-intro")!;
      const name = document.querySelector<HTMLElement>(".hero__title-name")!;
      const footer = document.querySelector<HTMLElement>(".hero__footer")!;
      const heroBounds = hero.getBoundingClientRect();
      const avatarBounds = avatar.getBoundingClientRect();
      const screenBounds = screen.getBoundingClientRect();
      const titleBounds = title.getBoundingClientRect();
      const introBounds = intro.getBoundingClientRect();
      const nameBounds = name.getBoundingClientRect();
      const footerBounds = footer.getBoundingClientRect();
      const intersectionArea = (a: DOMRect, b: DOMRect) =>
        Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
        Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const nameArea = Math.max(nameBounds.width * nameBounds.height, 1);
      return {
        heroTop: heroBounds.top,
        heroBottom: heroBounds.bottom,
        heroHeight: heroBounds.height,
        avatarTop: avatarBounds.top,
        avatarBottom: avatarBounds.bottom,
        avatarCenter: avatarBounds.left + avatarBounds.width / 2,
        screenWidth: screenBounds.width,
        screenHeight: screenBounds.height,
        introWidth: introBounds.width,
        nameWidth: nameBounds.width,
        titleBottom: titleBounds.bottom,
        footerTop: footerBounds.top,
        screenAvatarOverlap: intersectionArea(screenBounds, avatarBounds),
        screenNameOverlapRatio:
          intersectionArea(screenBounds, nameBounds) / nameArea,
        avatarNameOverlapRatio:
          intersectionArea(avatarBounds, nameBounds) / nameArea,
      };
    });
    expect(Math.abs(heroGeometry.avatarCenter - width / 2)).toBeLessThanOrEqual(
      width * 0.02,
    );
    expect(heroGeometry.avatarTop).toBeGreaterThanOrEqual(
      heroGeometry.heroTop - 1,
    );
    expect(heroGeometry.avatarBottom).toBeLessThanOrEqual(
      heroGeometry.heroBottom + 1,
    );
    expect(heroGeometry.titleBottom).toBeLessThan(heroGeometry.footerTop);
    expect(heroGeometry.nameWidth).toBeGreaterThan(
      heroGeometry.introWidth * 1.8,
    );
    expect(heroGeometry.screenNameOverlapRatio).toBe(0);
    expect(heroGeometry.avatarNameOverlapRatio).toBeLessThanOrEqual(0.15);
    expect(heroGeometry.screenAvatarOverlap).toBeGreaterThan(0);
    expect(heroGeometry.screenHeight / heroGeometry.heroHeight).toBeLessThan(
      0.26,
    );

    if (width >= 1024) {
      expect(heroGeometry.screenWidth).toBeGreaterThanOrEqual(width * 0.55 - 1);
      expect(heroGeometry.screenWidth).toBeLessThanOrEqual(width * 0.7 + 1);
      expect(heroGeometry.screenHeight).toBeGreaterThanOrEqual(107);
      expect(heroGeometry.screenHeight).toBeLessThanOrEqual(145);
    } else if (width >= 768) {
      expect(heroGeometry.screenWidth).toBeGreaterThanOrEqual(width * 0.72);
      expect(heroGeometry.screenWidth).toBeLessThanOrEqual(width * 0.76);
    } else {
      expect(heroGeometry.screenWidth).toBeGreaterThanOrEqual(width * 0.86);
      expect(heroGeometry.screenWidth).toBeLessThanOrEqual(width * 0.92);
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
      .toBe(true);
    await expect
      .poll(() => page.locator(".site-header").evaluate((header) => header.getBoundingClientRect().right <= window.innerWidth + 1))
      .toBe(true);
  }
});

test("fine-pointer target cursor stays responsive and frames logical targets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  const cursor = page.locator("[data-target-cursor]");
  await expect(cursor).toHaveCount(1);
  await expect(cursor).toBeAttached();
  await expect(cursor.locator(".target-cursor-dot")).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/target-cursor-active/);
  expect(
    await page.locator("body").evaluate((element) => getComputedStyle(element).cursor),
  ).toBe("none");
  expect(
    await page
      .locator('[data-scroll-nav="work"]')
      .evaluate((element) => getComputedStyle(element).cursor),
  ).toBe("none");
  await expect(page.locator(".project-row__summary.cursor-target")).toHaveCount(0);
  await expect(page.locator(".service-row.cursor-target")).toHaveCount(5);
  await expect(page.locator(".process-row.cursor-target")).toHaveCount(4);
  await expect(page.locator(".service-row .cursor-target")).toHaveCount(0);
  await expect(page.locator(".cursor-target .cursor-target")).toHaveCount(0);

  await page.mouse.move(80, 120);
  await page.waitForTimeout(30);
  await page.mouse.move(900, 420);
  await page.waitForTimeout(25);
  const first = await cursor.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  });
  expect(Math.abs(900 - first.x)).toBeLessThan(260);
  expect(Math.abs(420 - first.y)).toBeLessThan(120);
  await page.waitForTimeout(120);
  const settled = await cursor.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2, transform: getComputedStyle(element).transform };
  });
  expect(Math.abs(900 - settled.x)).toBeLessThanOrEqual(Math.abs(900 - first.x));
  expect(Math.abs(420 - settled.y)).toBeLessThanOrEqual(Math.abs(420 - first.y));
  expect(Math.abs(900 - settled.x)).toBeLessThan(1);
  expect(Math.abs(420 - settled.y)).toBeLessThan(1);
  expect(settled.transform).not.toContain("NaN");
  await expect(cursor).toHaveCSS("mix-blend-mode", "difference");

  await page.locator(".section-heading--work").hover();
  await expect(cursor).toHaveAttribute("data-target-state", "idle");
  await page.waitForTimeout(240);
  const cornerTrajectory = await page.evaluate(async () => {
    const cursorElement = document.querySelector<HTMLElement>("[data-target-cursor]")!;
    const target = document.querySelector<HTMLElement>(".service-row")!;
    const idleSurface = document.querySelector<HTMLElement>(".section-heading--work")!;
    const corners = Array.from(
      document.querySelectorAll<HTMLElement>(".target-cursor-corner"),
    );
    const sleep = (duration: number) =>
      new Promise((resolve) => window.setTimeout(resolve, duration));
    const readCorners = () =>
      corners.map((corner) => {
        const bounds = corner.getBoundingClientRect();
        return { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom };
      });
    const readExtent = (positions: ReturnType<typeof readCorners>) => ({
      width: Math.max(...positions.map((position) => position.right)) -
        Math.min(...positions.map((position) => position.left)),
      height: Math.max(...positions.map((position) => position.bottom)) -
        Math.min(...positions.map((position) => position.top)),
    });
    const distance = (
      from: { left: number; top: number },
      to: { left: number; top: number },
    ) => Math.hypot(from.left - to.left, from.top - to.top);

    const targetBounds = target.getBoundingClientRect();
    const expected = [
      { left: targetBounds.left - 3, top: targetBounds.top - 3 },
      { left: targetBounds.right + 3 - 12, top: targetBounds.top - 3 },
      { left: targetBounds.right + 3 - 12, top: targetBounds.bottom + 3 - 12 },
      { left: targetBounds.left - 3, top: targetBounds.bottom + 3 - 12 },
    ];
    const start = readCorners();
    target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    await sleep(65);
    const middle = readCorners();
    await sleep(210);
    const end = readCorners();
    const activeExtent = readExtent(end);

    target.dispatchEvent(
      new PointerEvent("pointerout", {
        bubbles: true,
        relatedTarget: idleSurface,
      }),
    );
    await sleep(65);
    const collapsingExtent = readExtent(readCorners());
    await sleep(210);
    const collapsedExtent = readExtent(readCorners());

    return {
      state: cursorElement.dataset.targetState,
      corners: expected.map((destination, index) => ({
        total: distance(start[index], destination),
        travelled: distance(start[index], middle[index]),
        remaining: distance(middle[index], destination),
        final: distance(end[index], destination),
      })),
      activeExtent,
      collapsingExtent,
      collapsedExtent,
    };
  });
  expect(cornerTrajectory.state).toBe("idle");
  for (const corner of cornerTrajectory.corners) {
    expect(corner.total).toBeGreaterThan(40);
    expect(corner.travelled).toBeGreaterThan(8);
    expect(corner.remaining).toBeLessThan(corner.total * 0.75);
    expect(corner.final).toBeLessThan(6);
  }
  expect(cornerTrajectory.collapsingExtent.width).toBeLessThan(
    cornerTrajectory.activeExtent.width,
  );
  expect(cornerTrajectory.collapsingExtent.height).toBeLessThan(
    cornerTrajectory.activeExtent.height,
  );
  expect(cornerTrajectory.collapsedExtent.width).toBeLessThan(55);
  expect(cornerTrajectory.collapsedExtent.height).toBeLessThan(55);

  const pointerHotPathMs = await page.evaluate(() => {
    const startedAt = performance.now();
    for (let index = 0; index < 240; index += 1) {
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100 + (index % 100) * 10,
          clientY: 100 + (index % 50) * 8,
        }),
      );
    }
    return performance.now() - startedAt;
  });
  expect(pointerHotPathMs).toBeLessThan(50);

  const workLink = page.locator('[data-scroll-nav="work"]');
  await workLink.hover();
  await expect(cursor).toHaveAttribute("data-target-state", "active");
  await expect(page.locator(".target-cursor-corner").first()).toHaveCSS(
    "border-color",
    "rgb(180, 151, 207)",
  );
  await page.waitForTimeout(100);
  const frame = await page.evaluate(() => {
    const target = document.querySelector<HTMLElement>('[data-scroll-nav="work"]')!;
    const corners = Array.from(
      document.querySelectorAll<HTMLElement>(".target-cursor-corner"),
    );
    const targetBounds = target.getBoundingClientRect();
    const cornerBounds = corners.map((corner) => corner.getBoundingClientRect());
    return {
      target: {
        left: targetBounds.left,
        top: targetBounds.top,
        right: targetBounds.right,
        bottom: targetBounds.bottom,
      },
      tl: {
        left: cornerBounds[0].left,
        top: cornerBounds[0].top,
      },
      br: {
        right: cornerBounds[2].right,
        bottom: cornerBounds[2].bottom,
      },
    };
  });
  expect(frame.tl.left).toBeLessThanOrEqual(frame.target.left + 4);
  expect(frame.tl.top).toBeLessThanOrEqual(frame.target.top + 4);
  expect(frame.br.right).toBeGreaterThanOrEqual(frame.target.right - 4);
  expect(frame.br.bottom).toBeGreaterThanOrEqual(frame.target.bottom - 4);

  await page.evaluate(() => {
    const trackedWindow = window as typeof window & {
      __targetCursorObserver?: MutationObserver;
      __targetCursorStateChanges?: (string | null)[];
    };
    const cursorElement = document.querySelector<HTMLElement>("[data-target-cursor]")!;
    trackedWindow.__targetCursorStateChanges = [];
    trackedWindow.__targetCursorObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        trackedWindow.__targetCursorStateChanges!.push(record.oldValue);
      });
    });
    trackedWindow.__targetCursorObserver.observe(cursorElement, {
      attributes: true,
      attributeFilter: ["data-target-state"],
      attributeOldValue: true,
    });
  });
  await page.locator('[data-scroll-nav="services"]').hover();
  await expect(cursor).toHaveAttribute("data-target-state", "active");
  await page.waitForTimeout(240);
  const handoffStates = await page.evaluate(() => {
    const trackedWindow = window as typeof window & {
      __targetCursorObserver?: MutationObserver;
      __targetCursorStateChanges?: (string | null)[];
    };
    trackedWindow.__targetCursorObserver?.disconnect();
    return trackedWindow.__targetCursorStateChanges ?? [];
  });
  expect(handoffStates).not.toContain("idle");

  const readRotation = () =>
    cursor.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    });
  const pausedRotation = await readRotation();
  await page.waitForTimeout(260);
  expect(Math.abs((await readRotation()) - pausedRotation)).toBeLessThan(0.5);

  await page.locator(".section-heading--work").hover();
  await expect(cursor).toHaveAttribute("data-target-state", "idle");
  await expect(page.locator(".target-cursor-corner").first()).toHaveCSS(
    "border-color",
    "rgb(255, 255, 255)",
  );
  await page.waitForTimeout(120);
  const resumedRotation = await readRotation();
  await page.waitForTimeout(220);
  expect(Math.abs((await readRotation()) - resumedRotation)).toBeGreaterThan(4);
});

test("real pointer selects service and process rows but not project cards", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  const summary = page.locator('[data-project-row="crav"] .project-row__summary');
  await page.evaluate(() => {
    const row = document.querySelector<HTMLElement>('[data-project-row="crav"]')!;
    const top = row.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 150));
  });
  await page.waitForTimeout(800);

  const bounds = await summary.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;
  await page.mouse.move(
    bounds.x + bounds.width * 0.72,
    bounds.y + bounds.height * 0.52,
  );
  const cursor = page.locator("[data-target-cursor]");
  await expect(cursor).toHaveAttribute("data-target-state", "idle");
  await expect(page.locator(".target-cursor-corner").first()).toHaveCSS(
    "border-color",
    "rgb(255, 255, 255)",
  );

  const expectRowFrame = async (target: Locator) => {
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await target.hover();
    await expect(cursor).toHaveAttribute("data-target-state", "active");
    await page.waitForTimeout(240);

    const frameError = await target.evaluate((element) => {
      const corners = Array.from(
        document.querySelectorAll<HTMLElement>(".target-cursor-corner"),
      );
      const targetBounds = element.getBoundingClientRect();
      const cornerBounds = corners.map((corner) => corner.getBoundingClientRect());
      return Math.max(
        Math.abs(cornerBounds[0].left - (targetBounds.left - 3)),
        Math.abs(cornerBounds[0].top - (targetBounds.top - 3)),
        Math.abs(cornerBounds[2].right - (targetBounds.right + 3)),
        Math.abs(cornerBounds[2].bottom - (targetBounds.bottom + 3)),
      );
    });
    expect(frameError).toBeLessThan(7);
  };

  await expectRowFrame(page.locator("[data-service-item]").first());
  await expectRowFrame(page.locator("[data-process-item]").first());
  await expect(page.locator(".target-cursor-corner").first()).toHaveCSS(
    "border-color",
    "rgb(180, 151, 207)",
  );
});

test("real pointer frames full capability rows in project details", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);

  const panel = await openProject(page, "north-co");
  const capability = panel.locator("[data-project-capability]").nth(2);
  await capability.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await capability.hover();

  const cursor = page.locator("[data-target-cursor]");
  await expect(cursor).toHaveAttribute("data-target-state", "active");
  await expect(page.locator(".target-cursor-corner").first()).toHaveCSS(
    "border-color",
    "rgb(180, 151, 207)",
  );
  await page.waitForTimeout(240);

  const frameError = await capability.evaluate((element) => {
    const corners = Array.from(
      document.querySelectorAll<HTMLElement>(".target-cursor-corner"),
    );
    const targetBounds = element.getBoundingClientRect();
    const cornerBounds = corners.map((corner) => corner.getBoundingClientRect());
    return Math.max(
      Math.abs(cornerBounds[0].left - (targetBounds.left - 3)),
      Math.abs(cornerBounds[0].top - (targetBounds.top - 3)),
      Math.abs(cornerBounds[2].right - (targetBounds.right + 3)),
      Math.abs(cornerBounds[2].bottom - (targetBounds.bottom + 3)),
    );
  });
  expect(frameError).toBeLessThan(7);
  await expect(panel.locator(".cursor-target .cursor-target")).toHaveCount(0);
});

test("every cursor target receives the four-corner frame", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off");
  await waitForExperience(page);

  const result = await page.evaluate(async () => {
    const cursor = document.querySelector<HTMLElement>("[data-target-cursor]")!;
    const corners = Array.from(
      document.querySelectorAll<HTMLElement>(".target-cursor-corner"),
    );
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(".cursor-target"),
    ).filter((target) => target.getClientRects().length > 0);
    const sleep = (duration: number) =>
      new Promise((resolve) => window.setTimeout(resolve, duration));
    const failures: string[] = [];

    for (const [index, target] of targets.entries()) {
      target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
      await sleep(240);

      const targetBounds = target.getBoundingClientRect();
      const cornerBounds = corners.map((corner) => corner.getBoundingClientRect());
      const error = Math.max(
        Math.abs(cornerBounds[0].left - (targetBounds.left - 3)),
        Math.abs(cornerBounds[0].top - (targetBounds.top - 3)),
        Math.abs(cornerBounds[2].right - (targetBounds.right + 3)),
        Math.abs(cornerBounds[2].bottom - (targetBounds.bottom + 3)),
      );
      if (
        cursor.dataset.targetState !== "active" ||
        getComputedStyle(corners[0]).borderColor !== "rgb(180, 151, 207)" ||
        error > 7
      ) {
        failures.push(`${index}:${target.className}:error=${error.toFixed(2)}`);
      }
    }

    return { tested: targets.length, failures };
  });

  expect(result.tested).toBeGreaterThan(15);
  expect(result.failures).toEqual([]);

  let detailTargetsTested = 0;
  for (const slug of projectSlugs) {
    const panel = await openProject(page, slug);
    const detailTargets = panel.locator(".cursor-target");
    const detailTargetCount = await detailTargets.count();
    detailTargetsTested += detailTargetCount;

    for (let index = 0; index < detailTargetCount; index += 1) {
      const framed = await detailTargets.nth(index).evaluate(async (target) => {
        target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        await new Promise((resolve) => window.setTimeout(resolve, 240));
        const cursor = document.querySelector<HTMLElement>("[data-target-cursor]")!;
        const corners = Array.from(
          document.querySelectorAll<HTMLElement>(".target-cursor-corner"),
        );
        const targetBounds = target.getBoundingClientRect();
        const cornerBounds = corners.map((corner) => corner.getBoundingClientRect());
        return {
          state: cursor.dataset.targetState,
          color: getComputedStyle(corners[0]).borderColor,
          error: Math.max(
            Math.abs(cornerBounds[0].left - (targetBounds.left - 3)),
            Math.abs(cornerBounds[0].top - (targetBounds.top - 3)),
            Math.abs(cornerBounds[2].right - (targetBounds.right + 3)),
            Math.abs(cornerBounds[2].bottom - (targetBounds.bottom + 3)),
          ),
        };
      });
      expect(framed.state).toBe("active");
      expect(framed.color).toBe("rgb(180, 151, 207)");
      expect(framed.error).toBeLessThan(7);
    }
  }
  expect(detailTargetsTested).toBeGreaterThanOrEqual(projectSlugs.length * 2);
});

test("modified same-page clicks preserve the browser's new-tab behavior", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/?webgl-off");
  await waitForExperience(page);

  const popupPromise = page.context().waitForEvent("page");
  await page.locator('[data-scroll-nav="work"]').click({ modifiers: ["Control"] });
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await expect(page).not.toHaveURL(/#selected-work$/);
  await expect(popup).toHaveURL(/#selected-work$/);
  await popup.close();
});

test("runtime stays stable through expansion, resize, and section stress", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  test.setTimeout(100_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/?webgl-off#selected-work");
  await waitForExperience(page);
  await openProject(page, "crav");
  await openProject(page, "northstar");
  await page.setViewportSize({ width: 1280, height: 720 });

  for (let index = 0; index < 60; index += 1) {
    const direction = Math.floor(index / 6) % 2 === 0 ? 360 : -360;
    await page.mouse.wheel(0, direction);
    await page.waitForTimeout(500);
  }

  const transforms = await page.locator(".project-row__title").evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).transform),
  );
  expect(transforms.join(" ")).not.toContain("NaN");
  await expect(page.locator('[data-project-expand="forma-studio"]')).toBeAttached();
  expect(errors).toEqual([]);
});
