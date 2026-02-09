export function createTimelineSection(content) {
  const section = document.createElement("section");
  section.className = "section-card timeline-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  const list = document.createElement("ol");
  list.className = "timeline-list stagger-parent";

  content.items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "timeline-item interactive-card stagger-item";

    const year = document.createElement("p");
    year.className = "timeline-year";
    year.textContent = item.year;

    const itemTitle = document.createElement("h3");
    itemTitle.className = "timeline-title";
    itemTitle.textContent = item.title;

    const caption = document.createElement("p");
    caption.className = "timeline-caption";
    caption.textContent = item.caption;

    listItem.append(year, itemTitle, caption);
    list.append(listItem);
  });

  section.append(title, intro, list);
  return section;
}
