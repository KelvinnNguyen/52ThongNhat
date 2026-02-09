export function initScrollReveal(rootElement = document) {
  document.documentElement.classList.add("has-reveal");

  const targets = Array.from(rootElement.querySelectorAll(".reveal-target"));
  if (targets.length === 0) {
    return;
  }

  const staggerParents = Array.from(rootElement.querySelectorAll(".stagger-parent"));
  staggerParents.forEach((parent) => {
    const items = Array.from(parent.querySelectorAll(".stagger-item"));
    const isBlessings = parent.classList.contains("blessings-section");
    const isGrandparents = parent.classList.contains("grandparents-grid");
    const stepDelay = isBlessings ? 100 : isGrandparents ? 180 : 55;
    const maxDelay = isBlessings ? 900 : isGrandparents ? 360 : 330;

    items.forEach((item, index) => {
      const delay = Math.min(index * stepDelay, maxDelay);
      item.style.setProperty("--item-delay", `${delay}ms`);
    });
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || typeof window.IntersectionObserver !== "function") {
    targets.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  targets.forEach((element, index) => {
    const delay = Math.min((index % 4) * 70, 210);
    element.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -9% 0px",
    },
  );

  targets.forEach((element) => {
    observer.observe(element);
  });
}
