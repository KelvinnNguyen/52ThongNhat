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
  const envelopeByCard = new Map();
  const envelopeCards = [];
  const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setActiveEnvelope(nextId) {
    activeEnvelopeId = nextId;
    renderEnvelopes();
  }

  function closeEnvelope() {
    setActiveEnvelope(null);
  }

  function scrollEnvelopeIntoView(card) {
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

  function openEnvelope(card, options = {}) {
    const { withEffects = true, scrollIntoView = false } = options;
    const target = envelopeByCard.get(card);
    if (!target) {
      return;
    }

    setActiveEnvelope(target.id);

    if (scrollIntoView) {
      scrollEnvelopeIntoView(card);
    }

    if (withEffects) {
      if (scrollIntoView && !prefersReducedMotionQuery.matches) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            playFireworkBurst(card);
          });
        });
      } else {
        playFireworkBurst(card);
      }
    }
  }

  function openRandomEnvelope() {
    if (envelopeCards.length === 0) {
      return;
    }

    const candidates = envelopeCards.filter((card) => {
      const envelope = envelopeByCard.get(card);
      return envelope && envelope.id !== activeEnvelopeId;
    });

    const pool = candidates.length > 0 ? candidates : envelopeCards;
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    openEnvelope(randomCard, { withEffects: true, scrollIntoView: true });
  }

  function handleEnvelopeTrigger(card) {
    const target = envelopeByCard.get(card);
    if (!target) {
      return;
    }

    if (activeEnvelopeId === target.id) {
      closeEnvelope();
      return;
    }

    openEnvelope(card, { withEffects: true });
  }

  function playFireworkBurst(card) {
    if (prefersReducedMotionQuery.matches) {
      return;
    }

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

    trigger.addEventListener("click", () => handleEnvelopeTrigger(card));
    closeButton.addEventListener("click", closeEnvelope);

    wishBody.append(wish);
    panel.append(wishBody, closeButton);
    card.append(trigger, panel);
    grid.append(card);

    envelopeRegistry.set(member.id, {
      id: member.id,
      card,
      trigger,
      panel,
      closeButton,
    });
    envelopeByCard.set(card, {
      id: member.id,
      card,
      trigger,
      panel,
      closeButton,
    });
    envelopeCards.push(card);
  });

  randomButton.addEventListener("click", openRandomEnvelope);

  section.append(headingRow, grid);
  renderEnvelopes();

  return section;
}
