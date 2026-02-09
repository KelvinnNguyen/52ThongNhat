let photoModalController = null;

export function createAlbumSection(content) {
  const section = document.createElement("section");
  section.className = "section-card memories-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "section-intro";
  intro.textContent = content.intro;

  const yearEntries = Array.isArray(content.albumByYear) ? content.albumByYear : [];
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const yearLookup = new Map(yearEntries.map((entry) => [entry.year, entry]));
  const chipRegistry = new Map();
  let switchTimeoutId = null;
  let activeYear = getDefaultYear(yearEntries);

  const yearNav = document.createElement("div");
  yearNav.className = "memories-year-nav";

  const yearChips = document.createElement("div");
  yearChips.className = "memories-year-chips";

  const yearStage = document.createElement("div");
  yearStage.className = "memory-year-stage";

  function setActiveYear(year) {
    activeYear = year;
    chipRegistry.forEach((chip, chipYear) => {
      const isActive = chipYear === activeYear;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });
  }

  function scrollSectionIntoView() {
    const viewportHeight = window.innerHeight || 0;
    const rect = section.getBoundingClientRect();
    const isOutsideViewport = rect.top < 0 || rect.bottom > viewportHeight;
    if (!isOutsideViewport) {
      return;
    }

    section.scrollIntoView({
      behavior: reduceMotionQuery.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  function commitActiveYearRender(yearData) {
    const nextBlock = createYearSection(yearData);
    yearStage.replaceChildren(nextBlock);
    window.requestAnimationFrame(() => {
      nextBlock.classList.add("is-visible");
    });
  }

  function renderActiveYear(options = {}) {
    const { animate = true } = options;
    const activeYearData = yearLookup.get(activeYear);
    if (!activeYearData) {
      return;
    }

    if (switchTimeoutId) {
      window.clearTimeout(switchTimeoutId);
      switchTimeoutId = null;
    }

    const reduceMotion = reduceMotionQuery.matches;
    const hasCurrentBlock = yearStage.childElementCount > 0;

    if (!animate || reduceMotion || !hasCurrentBlock) {
      yearStage.classList.remove("is-switching");
      yearStage.style.minHeight = "";
      commitActiveYearRender(activeYearData);
      return;
    }

    const currentHeight = yearStage.getBoundingClientRect().height;
    if (currentHeight > 0) {
      yearStage.style.minHeight = `${currentHeight}px`;
    }

    yearStage.classList.add("is-switching");
    switchTimeoutId = window.setTimeout(() => {
      commitActiveYearRender(activeYearData);
      yearStage.classList.remove("is-switching");
      window.setTimeout(() => {
        yearStage.style.minHeight = "";
      }, 220);
    }, 170);
  }

  function handleYearChipClick(year) {
    if (year === activeYear) {
      return;
    }

    setActiveYear(year);
    renderActiveYear({ animate: true });
    scrollSectionIntoView();
  }

  yearEntries.forEach((yearEntry) => {
    const chip = createYearChip(getYearChipLabel(yearEntry));
    chip.addEventListener("click", () => handleYearChipClick(yearEntry.year));
    yearChips.append(chip);
    chipRegistry.set(yearEntry.year, chip);
  });

  yearNav.append(yearChips);

  if (yearEntries.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "memory-year-description";
    emptyState.textContent = "No yearly memories available yet.";
    section.append(title, intro, yearNav, emptyState);
    return section;
  }

  setActiveYear(activeYear);
  renderActiveYear({ animate: false });
  section.append(title, intro, yearNav, yearStage);

  return section;
}

function createYearChip(label) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "memories-year-chip";
  chip.textContent = label;
  chip.setAttribute("aria-pressed", "false");
  return chip;
}

function createYearSection(yearEntry) {
  const block = document.createElement("article");
  block.className = "memory-year-block";
  block.dataset.year = yearEntry.year;

  const heading = document.createElement("h3");
  heading.className = "memory-year-heading";
  heading.textContent = buildYearHeading(yearEntry);

  const isComingSoon = isComingSoonYear(yearEntry);
  const descriptionText = String(yearEntry.description ?? "").trim();

  const grid = document.createElement("div");
  grid.className = isComingSoon ? "memory-coming-soon" : "memory-photo-grid";

  if (isComingSoon) {
    const glow = document.createElement("span");
    glow.className = "memory-coming-glow";
    glow.setAttribute("aria-hidden", "true");

    const particles = document.createElement("span");
    particles.className = "memory-coming-particles";
    particles.setAttribute("aria-hidden", "true");

    const text = document.createElement("p");
    text.className = "memory-coming-soon-text";
    text.textContent = descriptionText || "Coming soon";

    grid.append(glow, particles, text);
    initComingSoonInteraction(grid);
    block.append(heading, grid);
    return block;
  }

  const description = document.createElement("p");
  description.className = "memory-year-description";
  description.textContent = descriptionText;

  const photos = Array.isArray(yearEntry.photos) ? yearEntry.photos : [];
  photos.forEach((photo, photoIndex) => {
    const cardState = createPhotoCard(photo);
    const { card, trigger } = cardState;

    trigger.addEventListener("click", () => {
      openPhotoModal(photo.src, photo.alt);
    });

    const delay = Math.min(photoIndex * 70, 280);
    card.style.setProperty("--memory-photo-delay", `${delay}ms`);
    grid.append(card);
  });
  block.append(heading, description, grid);
  return block;
}

function createPhotoCard(photo) {
  const figure = document.createElement("figure");
  figure.className = "memory-photo-card interactive-card";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "memory-photo-trigger";
  trigger.setAttribute("aria-label", `Preview photo: ${photo.alt || "Family photo"}`);
  trigger.setAttribute("aria-haspopup", "dialog");

  const image = document.createElement("img");
  image.src = photo.src;
  image.alt = photo.alt;
  image.loading = "lazy";
  image.decoding = "async";
  trigger.append(image);

  figure.append(trigger);
  return { card: figure, trigger };
}

function openPhotoModal(src, alt) {
  const source = String(src ?? "").trim();
  if (!source) {
    return;
  }

  if (!photoModalController) {
    photoModalController = createPhotoModalController();
  }

  photoModalController.open(source, alt);
}

function createPhotoModalController() {
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const overlay = document.createElement("div");
  overlay.className = "memory-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-hidden", "true");

  const panel = document.createElement("div");
  panel.className = "memory-lightbox-panel";
  panel.setAttribute("role", "document");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "memory-lightbox-close";
  closeButton.setAttribute("aria-label", "Close photo preview");
  closeButton.textContent = "Close";

  const image = document.createElement("img");
  image.className = "memory-lightbox-image";
  image.alt = "";
  image.loading = "eager";
  image.decoding = "async";

  const meta = document.createElement("div");
  meta.className = "memory-lightbox-meta";

  const caption = document.createElement("p");
  caption.className = "memory-lightbox-caption";

  const actions = document.createElement("div");
  actions.className = "memory-lightbox-actions";

  const downloadLink = document.createElement("a");
  downloadLink.className = "memory-lightbox-download";
  downloadLink.textContent = "Download";
  downloadLink.target = "_blank";
  downloadLink.rel = "noopener";

  const hint = document.createElement("p");
  hint.className = "memory-lightbox-hint";
  hint.textContent = "If download is blocked by your browser, the image will open in a new tab.";

  actions.append(downloadLink);
  meta.append(caption, actions, hint);
  panel.append(closeButton, image, meta);
  overlay.append(panel);
  if (document.body) {
    document.body.append(overlay);
  }

  let isOpen = false;
  let lastFocusedElement = null;
  let previousBodyOverflow = "";
  let previousBodyPaddingRight = "";
  let isBodyScrollLocked = false;

  function ensureOverlayAttached() {
    if (overlay.isConnected || !document.body) {
      return;
    }

    document.body.append(overlay);
  }

  function lockBodyScroll() {
    if (isBodyScrollLocked) {
      return;
    }

    previousBodyOverflow = document.body.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = Math.max(window.innerWidth - document.documentElement.clientWidth, 0);
    const computedBodyPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${computedBodyPadding + scrollbarWidth}px`;
    }

    document.body.classList.add("memory-lightbox-open");
    isBodyScrollLocked = true;
  }

  function unlockBodyScroll() {
    if (!isBodyScrollLocked) {
      return;
    }

    document.body.style.overflow = previousBodyOverflow;
    document.body.style.paddingRight = previousBodyPaddingRight;
    document.body.classList.remove("memory-lightbox-open");
    isBodyScrollLocked = false;
  }

  function close() {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    unlockBodyScroll();

    if (lastFocusedElement instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        lastFocusedElement.focus();
      });
    }
  }

  function open(source, altText) {
    ensureOverlayAttached();
    lastFocusedElement = document.activeElement;

    const alt = String(altText ?? "").trim() || "Family photo";
    image.src = source;
    image.alt = alt;
    caption.textContent = alt;
    configureDownload(downloadLink, hint, source);

    if (!isOpen) {
      lockBodyScroll();
    }

    isOpen = true;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");

    if (reduceMotionQuery.matches) {
      closeButton.focus();
      return;
    }

    window.requestAnimationFrame(() => {
      closeButton.focus();
    });
  }

  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen) {
      return;
    }

    event.preventDefault();
    close();
  });

  return { open, close };
}

function getDefaultYear(yearEntries) {
  if (yearEntries.length === 0) {
    return null;
  }

  const year2026 = yearEntries.find((entry) => entry.year === "2026");
  if (year2026) {
    return year2026.year;
  }

  return yearEntries[yearEntries.length - 1].year ?? yearEntries[0].year;
}

function getYearChipLabel(yearEntry) {
  const label = String(yearEntry.tabLabel ?? "").trim();
  if (label) {
    return label;
  }

  return yearEntry.year;
}

function buildYearHeading(yearEntry) {
  const year = String(yearEntry.year ?? "").trim();
  const title = String(yearEntry.title ?? "").trim();
  const normalizedYear = year.toLowerCase();

  if (normalizedYear === "other") {
    return title || "Other Photos";
  }

  if (title.startsWith(year)) {
    return title;
  }

  return `${year} · ${title}`;
}

function isComingSoonYear(yearEntry) {
  return String(yearEntry.year ?? "").trim() === "2026";
}

function initComingSoonInteraction(container) {
  container.style.setProperty("--mx", "50%");
  container.style.setProperty("--my", "50%");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    return;
  }

  let rafId = 0;
  let queuedPoint = null;

  function applyPointerPosition() {
    rafId = 0;
    if (!queuedPoint) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = clamp(queuedPoint.clientX - rect.left, 0, rect.width);
    const y = clamp(queuedPoint.clientY - rect.top, 0, rect.height);
    container.style.setProperty("--mx", `${x}px`);
    container.style.setProperty("--my", `${y}px`);
    queuedPoint = null;
  }

  function queuePointerPosition(event) {
    queuedPoint = {
      clientX: event.clientX,
      clientY: event.clientY,
    };
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(applyPointerPosition);
  }

  function setInteractiveState(isActive) {
    container.classList.toggle("is-pointer-active", isActive);
  }

  container.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setInteractiveState(true);
    queuePointerPosition(event);
  });

  container.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    queuePointerPosition(event);
  });

  container.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setInteractiveState(false);
    container.style.setProperty("--mx", "50%");
    container.style.setProperty("--my", "50%");
  });

  container.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    queuePointerPosition(event);
    spawnComingSoonRipple(container, event.clientX, event.clientY);

    if (event.pointerType !== "mouse") {
      setInteractiveState(true);
      window.setTimeout(() => {
        setInteractiveState(false);
      }, 260);
    }
  });
}

function spawnComingSoonRipple(container, clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const x = clamp(clientX - rect.left, 0, rect.width);
  const y = clamp(clientY - rect.top, 0, rect.height);

  const ripple = document.createElement("span");
  ripple.className = "memory-coming-ripple";
  ripple.style.setProperty("--rx", `${x}px`);
  ripple.style.setProperty("--ry", `${y}px`);
  container.append(ripple);

  ripple.addEventListener(
    "animationend",
    () => {
      ripple.remove();
    },
    { once: true },
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function configureDownload(linkElement, hintElement, src) {
  const filename = guessFilename(src);
  const isExternal = /^https?:\/\//i.test(src);

  linkElement.href = src;
  linkElement.setAttribute("download", filename);
  hintElement.hidden = !isExternal;
}

function guessFilename(src) {
  const clean = src.split("?")[0];
  const segment = clean.split("/").pop();
  if (!segment) {
    return "memory-photo";
  }

  return segment;
}
