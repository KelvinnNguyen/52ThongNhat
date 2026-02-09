const INTRO_STORAGE_KEY = "tetIntroPlayed2026";
const INTRO_DURATION_MS = 4200;
const INTRO_REDUCED_DURATION_MS = 1000;
const INTRO_FADE_MS = 420;

const FIREWORK_COLORS = ["#d35a45", "#d4a04e", "#f6dfb4", "#b53b30", "#e8c47a"];

export function initNewYearFireworksIntro(options = {}) {
  const {
    title = "Happy New Year 2026",
    storageKey = INTRO_STORAGE_KEY,
    force = false,
  } = options;

  if (!force && hasPlayed(storageKey)) {
    return;
  }

  markPlayed(storageKey);

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = reduceMotionQuery.matches;
  const overlay = createIntroOverlay(title);
  document.body.append(overlay);
  document.body.classList.add("tet-intro-open");

  let isClosed = false;
  let closeTimerId = 0;
  let rafId = 0;

  const canvas = overlay.querySelector(".tet-intro-canvas");
  const skipButton = overlay.querySelector(".tet-intro-skip");

  const fireworks = reduceMotion || !canvas ? null : createCanvasFireworks(canvas);
  fireworks?.start();

  function closeIntro() {
    if (isClosed) {
      return;
    }
    isClosed = true;

    if (closeTimerId) {
      window.clearTimeout(closeTimerId);
      closeTimerId = 0;
    }

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    fireworks?.stop();
    overlay.classList.add("is-closing");
    overlay.classList.remove("is-visible");

    window.setTimeout(() => {
      document.body.classList.remove("tet-intro-open");
      overlay.remove();
    }, INTRO_FADE_MS);
  }

  skipButton?.addEventListener("click", closeIntro);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeIntro();
    }
  });

  const duration = reduceMotion ? INTRO_REDUCED_DURATION_MS : INTRO_DURATION_MS;
  closeTimerId = window.setTimeout(closeIntro, duration);

  rafId = window.requestAnimationFrame(() => {
    overlay.classList.add("is-visible");
  });
}

function createIntroOverlay(title) {
  const overlay = document.createElement("section");
  overlay.className = "tet-intro-overlay";
  overlay.setAttribute("aria-label", "New Year greeting");

  const canvas = document.createElement("canvas");
  canvas.className = "tet-intro-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  content.className = "tet-intro-content";

  const heading = document.createElement("h1");
  heading.className = "tet-intro-title";
  heading.textContent = title;

  const skipButton = document.createElement("button");
  skipButton.type = "button";
  skipButton.className = "tet-intro-skip";
  skipButton.textContent = "Skip";

  content.append(heading);
  overlay.append(canvas, content, skipButton);
  return overlay;
}

function createCanvasFireworks(canvas) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return null;
  }

  const rockets = [];
  const particles = [];
  const maxParticles = 260;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let nextLaunchAt = 0;
  let rafId = 0;
  let lastTime = 0;
  let running = false;

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function launchRocket(now) {
    rockets.push({
      x: randomBetween(width * 0.12, width * 0.88),
      y: height + randomBetween(14, 36),
      vx: randomBetween(-16, 16),
      vy: randomBetween(-340, -270),
      targetY: randomBetween(height * 0.18, height * 0.52),
      color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      life: 1,
    });

    nextLaunchAt = now + randomBetween(280, 560);
  }

  function spawnExplosion(rocket) {
    const count = Math.floor(randomBetween(14, 20));
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + randomBetween(-0.12, 0.12);
      const speed = randomBetween(60, 180);
      particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(0.62, 1),
        decay: randomBetween(0.84, 1.1),
        size: randomBetween(1.5, 3.1),
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      });
    }

    if (particles.length > maxParticles) {
      particles.splice(0, particles.length - maxParticles);
    }
  }

  function update(dt, now) {
    if (now >= nextLaunchAt) {
      launchRocket(now);
    }

    for (let index = rockets.length - 1; index >= 0; index -= 1) {
      const rocket = rockets[index];
      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy * dt;
      rocket.vy += 180 * dt;
      rocket.life -= dt * 0.6;

      if (rocket.y <= rocket.targetY || rocket.vy > -40 || rocket.life <= 0) {
        spawnExplosion(rocket);
        rockets.splice(index, 1);
      }
    }

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.982;
      particle.vy = particle.vy * 0.984 + 148 * dt;
      particle.life -= dt * particle.decay;

      if (particle.life <= 0) {
        particles.splice(index, 1);
      }
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    for (let index = 0; index < rockets.length; index += 1) {
      const rocket = rockets[index];
      context.globalAlpha = 0.75;
      context.fillStyle = rocket.color;
      context.beginPath();
      context.arc(rocket.x, rocket.y, 1.8, 0, Math.PI * 2);
      context.fill();
    }

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      context.globalAlpha = Math.max(Math.min(particle.life, 1), 0);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
  }

  function tick(now) {
    if (!running) {
      return;
    }

    if (lastTime === 0) {
      lastTime = now;
    }

    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.034);
    lastTime = now;
    update(deltaSeconds, now);
    draw();
    rafId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running) {
      return;
    }
    running = true;
    resizeCanvas();
    nextLaunchAt = performance.now() + 140;
    window.addEventListener("resize", resizeCanvas);
    rafId = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) {
      return;
    }
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener("resize", resizeCanvas);
    rockets.length = 0;
    particles.length = 0;
    context.clearRect(0, 0, width, height);
  }

  return { start, stop };
}

function hasPlayed(storageKey) {
  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

function markPlayed(storageKey) {
  try {
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // Ignore storage failures in private mode or blocked storage contexts.
  }
}
