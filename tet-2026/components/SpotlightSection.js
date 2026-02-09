export function createSpotlightSection(content) {
  const section = document.createElement("section");
  section.className = "section-card spotlight-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  const layout = document.createElement("div");
  layout.className = "spotlight-layout stagger-parent";

  const featured = document.createElement("figure");
  featured.className = "spotlight-featured interactive-card stagger-item";

  const featuredImage = document.createElement("img");
  featuredImage.src = content.featured.src;
  featuredImage.alt = content.featured.alt;
  featuredImage.loading = "lazy";

  const featuredCaption = document.createElement("figcaption");
  featuredCaption.textContent = content.featured.caption;

  featured.append(featuredImage, featuredCaption);

  const supporting = document.createElement("div");
  supporting.className = "spotlight-supporting";

  content.supporting.forEach((item) => {
    const figure = document.createElement("figure");
    figure.className = "spotlight-support-item interactive-card stagger-item";

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent = item.caption;

    figure.append(image, caption);
    supporting.append(figure);
  });

  layout.append(featured, supporting);
  section.append(title, intro, layout);
  return section;
}
