import { tet2026Content } from "./content.js";
import { createTet2026Page } from "./components/Tet2026Page.js";
import { initScrollReveal } from "./scrollReveal.js";
import { initNewYearFireworksIntro } from "./components/NewYearFireworksIntro.js";

const app = document.getElementById("app");

if (!app) {
  throw new Error("Cannot find #app root element.");
}

document.title = tet2026Content.meta.pageTitle;
app.append(createTet2026Page(tet2026Content));
initScrollReveal(app);
initNewYearFireworksIntro();
