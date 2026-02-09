import { createHeroSection } from "./HeroSection.js";
import { createBlessingsSection } from "./BlessingsSection.js";
import { createFamilyPortrait } from "./FamilyPortrait.js";
import { createValuesSection } from "./ValuesSection.js";
import { createTimelineSection } from "./TimelineSection.js";
import { createLiXiSection } from "./LiXiSection.js";
import { createGrandparentsSection } from "./GrandparentsSection.js";
import { createSpotlightSection } from "./SpotlightSection.js";
import { createAlbumSection } from "./AlbumSection.js";
import { createClosingSection } from "./ClosingSection.js";

export function createTet2026Page(content) {
  const fragment = document.createDocumentFragment();

  const hero = createHeroSection(content.hero);
  const blessings = createBlessingsSection(content.blessings);
  const portrait = createFamilyPortrait(content.familyPortrait);
  const values = createValuesSection(content.values);
  const timeline = createTimelineSection(content.timeline);
  const liXi = createLiXiSection(content.liXi);
  const grandparents = createGrandparentsSection(content.grandparents);
  const spotlight = createSpotlightSection(content.spotlight);
  const album = createAlbumSection(content.album);
  const closing = createClosingSection(content.closing);
  const authorSignature = createAuthorSignature(content.authorSignature);
  const footer = createFooter(content.footer);

  const sections = [
    hero,
    blessings,
    portrait,
    values,
    timeline,
    liXi,
    grandparents,
    spotlight,
    album,
    closing,
    authorSignature,
    footer,
  ];

  sections.forEach((section) => {
    section.classList.add("reveal-target");
    fragment.append(section);
  });

  return fragment;
}

function createFooter(content) {
  const footerElement = document.createElement("footer");
  footerElement.className = "site-footer";

  const text = document.createElement("p");
  text.textContent = `${content.signature} ${content.year}`;

  footerElement.append(text);
  return footerElement;
}

function createAuthorSignature(content) {
  const section = document.createElement("section");
  section.className = "author-signature";

  const author = document.createElement("p");
  author.className = "author-signature-main";
  author.textContent = content.author;

  const stageName = document.createElement("p");
  stageName.className = "author-signature-sub";
  stageName.textContent = content.stageName;

  section.append(author, stageName);
  return section;
}
