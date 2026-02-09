export function createHeroSection(content) {
  const section = document.createElement("section");
  section.className = "section-card hero-section";

  const badge = document.createElement("p");
  badge.className = "tet-badge";
  badge.textContent = content.badge;

  const title = document.createElement("h1");
  title.className = "hero-title";
  title.textContent = content.title;

  const subtitle = document.createElement("p");
  subtitle.className = "hero-subtitle";
  subtitle.textContent = content.subtitle;

  const intro = document.createElement("p");
  intro.className = "hero-intro";
  intro.textContent = content.intro;

  const motif = document.createElement("div");
  motif.className = "hero-motif";
  motif.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");
    dot.className = "motif-item";
    motif.append(dot);
  }

  section.append(badge, title, subtitle, intro, motif);
  return section;
}
