export function createClosingSection(content) {
  const section = document.createElement("section");
  section.className = "section-card closing-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const paragraph = document.createElement("p");
  paragraph.className = "closing-paragraph";
  paragraph.textContent = content.paragraph;

  const signature = document.createElement("p");
  signature.className = "closing-signature";
  signature.textContent = content.signature;

  section.append(title, paragraph, signature);
  return section;
}
