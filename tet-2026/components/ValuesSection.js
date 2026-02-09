export function createValuesSection(content) {
  const section = document.createElement("section");
  section.className = "section-card values-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  const grid = document.createElement("div");
  grid.className = "values-grid stagger-parent";

  content.items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "value-card interactive-card stagger-item";

    const name = document.createElement("h3");
    name.className = "value-name";
    name.textContent = item.name;

    const description = document.createElement("p");
    description.className = "value-description";
    description.textContent = item.description;

    card.append(name, description);
    grid.append(card);
  });

  section.append(title, intro, grid);
  return section;
}
