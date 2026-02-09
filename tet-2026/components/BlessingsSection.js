export function createBlessingsSection(content) {
  const section = document.createElement("section");
  section.className = "section-card blessings-section stagger-parent";

  const title = document.createElement("h2");
  title.className = "section-title blessing-title stagger-item";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro blessing-intro stagger-item";
  intro.textContent = content.intro;

  const list = document.createElement("div");
  list.className = "blessing-lines";

  content.lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.className = "blessing-line stagger-item";
    paragraph.textContent = line;
    list.append(paragraph);
  });

  section.append(title, intro, list);
  return section;
}
