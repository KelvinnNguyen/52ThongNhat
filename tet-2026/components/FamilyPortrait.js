export function createFamilyPortrait(content) {
  const section = document.createElement("section");
  section.className = "section-card";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  const figure = document.createElement("figure");
  figure.className = "portrait-figure";

  const image = document.createElement("img");
  image.src = content.imageSrc;
  image.alt = content.imageAlt;
  image.loading = "lazy";

  const caption = document.createElement("figcaption");
  caption.className = "portrait-caption";
  caption.textContent = content.caption;

  figure.append(image, caption);
  section.append(title, intro, figure);
  return section;
}
