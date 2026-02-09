export function createLiXiSection(content) {
  const section = document.createElement("section");
  section.className = "section-card lixi-section";

  const headingRow = document.createElement("div");
  headingRow.className = "lixi-heading-row";

  const headingGroup = document.createElement("div");

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  headingGroup.append(title, intro);

  const randomButton = document.createElement("button");
  randomButton.type = "button";
  randomButton.className = "btn-secondary";
  randomButton.textContent = content.randomButtonLabel;

  headingRow.append(headingGroup, randomButton);

  const grid = document.createElement("div");
  grid.className = "lixi-grid stagger-parent";

  let activeEnvelopeId = null;
  const envelopeRegistry = new Map();
  const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setActiveEnvelope(nextId) {
    activeEnvelopeId = nextId;
    renderEnvelopes();
  }

  function closeEnvelope() {
    setActiveEnvelope(null);
  }

  function scrollEnvelopeIntoView(id) {
    const target = envelopeRegistry.get(id);
    if (!target) {
      return;
    }

    const { card } = target;
    const viewportHeight = window.innerHeight || 0;
    const rect = card.getBoundingClientRect();
    const isOutOfView = rect.top < 0 || rect.bottom > viewportHeight;

    if (isOutOfView) {
      card.scrollIntoView({
        behavior: prefersReducedMotionQuery.matches ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  function openEnvelope(id, options = {}) {
    const { triggerEffects = true, scrollIntoView = false } = options;
    setActiveEnvelope(id);

    if (scrollIntoView) {
      scrollEnvelopeIntoView(id);
    }

    if (triggerEffects) {
      playFireworkBurst(id);
    }
  }

  function openRandomEnvelope() {
    const ids = content.members.map((member) => member.id);
    if (ids.length === 0) {
      return;
    }

    const candidates = ids.filter((id) => id !== activeEnvelopeId);
    const pool = candidates.length > 0 ? candidates : ids;
    const randomId = pool[Math.floor(Math.random() * pool.length)];
    openEnvelope(randomId, { triggerEffects: true, scrollIntoView: true });
  }

  function handleEnvelopeTrigger(id) {
    if (activeEnvelopeId === id) {
      closeEnvelope();
      return;
    }

    openEnvelope(id, { triggerEffects: true });
  }

  function playFireworkBurst(id) {
    if (prefersReducedMotionQuery.matches) {
      return;
    }

    const target = envelopeRegistry.get(id);
    if (!target) {
      return;
    }

    const { card } = target;
    const existingBurst = card.querySelector(".lixi-firework");
    if (existingBurst) {
      existingBurst.remove();
    }

    const burst = document.createElement("div");
    burst.className = "lixi-firework";
    burst.setAttribute("aria-hidden", "true");

    const ring = document.createElement("span");
    ring.className = "lixi-firework-ring";
    burst.append(ring);

    const colors = ["#f4d086", "#d85d48", "#fff0cf", "#b98536"];
    const particleCount = 14;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      particle.className = "lixi-firework-particle";

      const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.22;
      const distance = 26 + Math.random() * 28;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      particle.style.setProperty("--tx", `${offsetX}px`);
      particle.style.setProperty("--ty", `${offsetY}px`);
      particle.style.setProperty("--delay", `${Math.floor(Math.random() * 70)}ms`);
      particle.style.setProperty("--size", `${3 + Math.floor(Math.random() * 4)}px`);
      particle.style.setProperty("--spark", colors[index % colors.length]);
      burst.append(particle);
    }

    card.append(burst);
    window.setTimeout(() => {
      burst.remove();
    }, 1150);
  }

  function renderEnvelopes() {
    envelopeRegistry.forEach(({ card, trigger, panel, closeButton }, id) => {
      const isOpen = id === activeEnvelopeId;
      card.classList.toggle("is-open", isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
      panel.setAttribute("aria-hidden", String(!isOpen));
      closeButton.disabled = !isOpen;
      closeButton.tabIndex = isOpen ? 0 : -1;
    });
  }

  content.members.forEach((member) => {
    const card = document.createElement("article");
    card.className = "lixi-card interactive-card stagger-item";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "lixi-trigger";
    trigger.setAttribute("aria-expanded", "false");

    const panelId = `lixi-panel-${member.id}`;
    trigger.setAttribute("aria-controls", panelId);

    const roleText = document.createElement("span");
    roleText.className = "lixi-role";
    roleText.textContent = member.role;

    const nameText = document.createElement("span");
    nameText.className = "lixi-name";
    nameText.textContent = member.name;

    const seal = document.createElement("span");
    seal.className = "lixi-seal";
    seal.setAttribute("aria-hidden", "true");
    seal.textContent = content.sealLabel ?? "Lucky Envelope";

    trigger.append(roleText, nameText, seal);

    const panel = document.createElement("div");
    panel.className = "lixi-panel";
    panel.id = panelId;
    panel.setAttribute("aria-hidden", "true");

    const wishBody = document.createElement("div");
    wishBody.className = "lixi-wish-body";

    const wish = document.createElement("p");
    wish.className = "lixi-wish";
    wish.textContent = member.wish;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "lixi-close";
    closeButton.textContent = content.closeButtonLabel;
    closeButton.disabled = true;
    closeButton.tabIndex = -1;

    trigger.addEventListener("click", () => handleEnvelopeTrigger(member.id));
    closeButton.addEventListener("click", closeEnvelope);

    wishBody.append(wish);
    panel.append(wishBody, closeButton);
    card.append(trigger, panel);
    grid.append(card);

    envelopeRegistry.set(member.id, {
      card,
      trigger,
      panel,
      closeButton,
    });
  });

  randomButton.addEventListener("click", openRandomEnvelope);

  section.append(headingRow, grid);
  renderEnvelopes();

  return section;
}
