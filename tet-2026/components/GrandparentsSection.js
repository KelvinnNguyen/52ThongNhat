export function createGrandparentsSection(content) {
  const section = document.createElement("section");
  section.className = "section-card grandparents-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  const grid = document.createElement("div");
  grid.className = "grandparents-grid stagger-parent";

  content.items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "grandparent-card interactive-card stagger-item";

    const heading = document.createElement("h3");
    heading.className = "grandparent-title";
    heading.textContent = item.heading;

    const body = document.createElement("p");
    body.className = "grandparent-body";
    body.textContent = item.body;

    card.append(heading, body);
    grid.append(card);
  });

  section.append(title, intro, grid);
  return section;
}
