import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("starfield");
const ctx = canvas?.getContext("2d");
const stars = [];
const STAR_COUNT = 400;
let width = 0;
let height = 0;

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function seedStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i += 1) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.7 + 0.2,
    });
  }
}

function drawStars() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(124, 155, 255, 0.8)";
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.speed;
    if (star.y > height) star.y = 0;
  });
  requestAnimationFrame(drawStars);
}

function initStarfield() {
  if (!canvas) return;
  resizeCanvas();
  seedStars();
  drawStars();
}

window.addEventListener("resize", () => {
  resizeCanvas();
  seedStars();
});

initStarfield();

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

toggle?.addEventListener("click", () => {
  nav?.classList.toggle("is-open");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("is-open"));
});

const intro = document.querySelector(".intro");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DEFAULT_PASSCODE = "0041";
const PASSCODE_KEY = "portfolioPasscode";
let fallbackPasscode = DEFAULT_PASSCODE;
let editorUnlocked = false;

function resolveApiBase() {
  if (window.PORTFOLIO_API_BASE) return window.PORTFOLIO_API_BASE.replace(/\/$/, "");
  const { origin, hostname = "localhost", port = "", protocol = "http:" } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocalHost && port !== "3001") {
    return `${protocol}//${hostname}:3001/api`;
  }
  if (origin && origin.startsWith("http")) {
    return `${origin.replace(/\/$/, "")}/api`;
  }
  return `${protocol}//${hostname}:3001/api`;
}

const API_BASE = resolveApiBase();
console.info("Portfolio API base:", API_BASE);

function createHeroTimeline() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from([".hero__text .eyebrow", ".hero__text h1"], {
    y: 50,
    opacity: 0,
    stagger: 0.08,
    duration: 1,
  })
    .from(
      ".hero__value",
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
      },
      "-=0.4"
    )
    .from(
      ".hero__actions .button",
      {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
      },
      "-=0.3"
    )
    .from(
      ".hero__stats article",
      {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.7,
      },
      "-=0.4"
    )
    .from(
      ".hero__visual",
      {
        opacity: 0,
        y: 30,
        duration: 0.8,
      },
      "-=0.6"
    )
    .from(
      ".hero__constellation .hero__node",
      {
        opacity: 0,
        scale: 0.5,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
      "-=0.6"
    );
  return tl;
}

function activateScrollMotions() {
  if (prefersReducedMotion) return;
  const elements = document.querySelectorAll('[data-motion="section"], [data-motion="card"]');
  elements.forEach((element) => {
    const distance = element.dataset.motion === "card" ? 35 : 65;
    gsap.from(element, {
      opacity: 0,
      y: distance,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        once: true,
      },
    });
  });
}

function startExperience() {
  if (!prefersReducedMotion) {
    createHeroTimeline();
  }
  activateScrollMotions();
}

const editFab = document.querySelector(".edit-fab");
const editModal = document.querySelector(".edit-modal");
const editorPanel = document.querySelector(".editor-panel");
const inlineToggle = document.getElementById("inlineEditingToggle");
const heroForm = document.getElementById("heroForm");
const projectForm = document.getElementById("projectForm");
const skillForm = document.getElementById("skillForm");
const blogForm = document.getElementById("blogForm");
const aboutForm = document.getElementById("aboutForm");
const certForm = document.getElementById("certForm");
const contactForm = document.getElementById("contactForm");
const purgeForm = document.getElementById("purgeForm");
const projectsContainer = document.querySelector(".singularity__stack");
const skillsGrid = document.querySelector(".pulse__grid");
const blogsGrid = document.querySelector(".signals__grid");
const heroPhoto = document.getElementById("heroPhoto");
const heroTaglineEl = document.querySelector(".hero__eyebrow");
const heroHeadlineEl = document.querySelector(".hero__text h1");
const heroSummaryEl = document.querySelector(".hero__value");
const heroBadgesEl = document.querySelector(".hero__badges");
const heroMetricsEl = document.querySelector(".hero__glance");
const heroActions = document.querySelector(".hero__actions");
const heroPrimaryCta = heroActions?.querySelector(".button--primary");
const heroSecondaryCta = heroActions?.querySelector(".button--ghost");
const contactList = document.querySelector("[data-featured-skills]");
const aboutHeadingEl = document.querySelector("[data-about-heading]");
const aboutSummaryEl = document.querySelector("[data-about-summary]");
const aboutBulletsEl = document.querySelector("[data-about-bullets]");
const certList = document.querySelector("[data-certifications]");
const defaultContactMarkup = contactList?.innerHTML ?? "";
const defaultCertMarkup = certList?.innerHTML ?? "";
const modalForm = editModal?.querySelector(".edit-modal__form");
const resetForm = editModal?.querySelector(".edit-modal__reset");
const resetToggle = editModal?.querySelector('[data-editor="forgot"]');
const resetCancel = editModal?.querySelector('[data-editor="reset-cancel"]');
const modalCancel = editModal?.querySelector('[data-editor="cancel"]');
const panelClose = editorPanel?.querySelector(".editor-panel__close");

const inlineRegions = [document.querySelector("main"), document.querySelector(".site-header"), document.querySelector(".site-footer")].filter(Boolean);

const initialHeroBadges = heroBadgesEl
  ? Array.from(heroBadgesEl.children)
      .map((badge) => badge.textContent?.trim() ?? "")
      .filter(Boolean)
  : [];

const initialHeroMetrics = heroMetricsEl
  ? Array.from(heroMetricsEl.querySelectorAll("li")).map((item) => ({
      value: item.querySelector("strong")?.textContent?.trim() ?? "",
      label: item.querySelector("span")?.textContent?.trim() ?? "",
    }))
  : [];

const initialHeroState = {
  tagline: heroTaglineEl?.textContent?.trim() ?? "",
  headline: heroHeadlineEl?.textContent?.trim() ?? "",
  subheading: heroSummaryEl?.textContent?.trim() ?? "",
  badges: initialHeroBadges,
  metrics: initialHeroMetrics,
  primaryLabel: heroPrimaryCta?.textContent?.trim() ?? "",
  primaryUrl: heroPrimaryCta?.getAttribute("href") ?? "",
  secondaryLabel: heroSecondaryCta?.textContent?.trim() ?? "",
  secondaryUrl: heroSecondaryCta?.getAttribute("href") ?? "",
};

const initialAboutBullets = aboutBulletsEl
  ? Array.from(aboutBulletsEl.querySelectorAll("li"))
      .map((item) => item.textContent?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
  : "";

let heroState = initialHeroState;
const initialAboutState = {
  heading: aboutHeadingEl?.textContent?.trim() ?? "",
  summary: aboutSummaryEl?.textContent?.trim() ?? "",
  bullets: initialAboutBullets,
  photo: heroPhoto?.getAttribute("src") ?? "",
};

let aboutState = initialAboutState;
let certificationsState = [];
let contactLinksState = [];

function readStoredPasscode() {
  try {
    return localStorage.getItem(PASSCODE_KEY);
  } catch (error) {
    return fallbackPasscode;
  }
}

function writeStoredPasscode(value) {
  fallbackPasscode = value;
  try {
    localStorage.setItem(PASSCODE_KEY, value);
  } catch (error) {
    // Ignore quota/security errors and rely on fallback value.
  }
}

function getPasscode() {
  const stored = readStoredPasscode();
  return stored && stored.trim().length ? stored : DEFAULT_PASSCODE;
}

function setPasscode(value) {
  writeStoredPasscode(value);
}

function setInlineEditing(enabled) {
  inlineRegions.forEach((region) => {
    region?.setAttribute("contenteditable", enabled ? "true" : "false");
  });
  document.body.classList.toggle("editor-inline", enabled);
  const protectedNodes = document.querySelectorAll(
    ".editor-panel, .editor-panel *, .edit-modal, .edit-modal *, .edit-fab, form, form *, button, input, textarea, select"
  );
  protectedNodes.forEach((node) => node.setAttribute("contenteditable", "false"));
}

function toggleEditorPanel() {
  if (!editorPanel) return;
  const isHidden = editorPanel.hasAttribute("hidden");
  if (isHidden) {
    editorPanel.removeAttribute("hidden");
  } else {
    editorPanel.setAttribute("hidden", "");
  }
}

function openModal() {
  if (!editModal) return;
  hideResetForm();
  editModal.removeAttribute("hidden");
  editModal.querySelector("input")?.focus();
}

function closeModal() {
  if (!editModal) return;
  const errorEl = editModal.querySelector(".edit-modal__error");
  if (errorEl) errorEl.textContent = "";
  editModal.setAttribute("hidden", "");
  modalForm?.reset();
  resetForm?.reset();
  hideResetForm();
}

function showResetForm() {
  if (!resetForm || !modalForm) return;
  modalForm.setAttribute("hidden", "");
  resetForm.removeAttribute("hidden");
  resetForm.querySelector('input[name="currentPasscode"]')?.focus();
  setResetStatus("");
}

function hideResetForm() {
  if (!resetForm || !modalForm) return;
  modalForm.removeAttribute("hidden");
  resetForm.setAttribute("hidden", "");
  setResetStatus("");
}

function setResetStatus(message, variant = "info") {
  if (!resetForm) return;
  let status = resetForm.querySelector(".edit-modal__reset-status");
  if (!message) {
    status?.removeAttribute("data-variant");
    status && (status.textContent = "");
    return;
  }
  if (!status) {
    status = document.createElement("p");
    status.className = "edit-modal__reset-status";
    status.setAttribute("role", "status");
    resetForm.appendChild(status);
  }
  status.dataset.variant = variant;
  status.textContent = message;
}

function unlockEditor() {
  editorUnlocked = true;
  closeModal();
  editorPanel?.removeAttribute("hidden");
  inlineToggle?.removeAttribute("disabled");
  editFab?.classList.add("edit-fab--active");
}

function registerScrollAnimation(element, distance = 65) {
  if (prefersReducedMotion || !element) return;
  gsap.from(element, {
    opacity: 0,
    y: distance,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      once: true,
    },
  });
}

function normalizeMetricEntry(entry) {
  if (typeof entry === "string") {
    const [value, label] = entry.split("|");
    return { value: (value ?? "").trim(), label: (label ?? "").trim() };
  }
  if (entry && typeof entry === "object") {
    return {
      value: String(entry.value ?? "").trim(),
      label: String(entry.label ?? "").trim(),
    };
  }
  return { value: "", label: "" };
}

function metricsToTextarea(metrics) {
  if (!Array.isArray(metrics)) return "";
  return metrics
    .map((metric) => {
      const value = metric?.value ?? "";
      const label = metric?.label ?? "";
      const line = `${value}`.trim();
      const detail = `${label}`.trim();
      return detail ? `${line} | ${detail}`.trim() : line;
    })
    .filter(Boolean)
    .join("\n");
}

function parseMetricTextarea(value) {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [metricValue, metricLabel] = line.split("|");
      return {
        value: (metricValue ?? "").trim(),
        label: (metricLabel ?? "").trim(),
      };
    });
}

function populateHeroForm(data) {
  if (!heroForm || !data) return;
  const taglineInput = heroForm.querySelector('input[name="heroTagline"]');
  const headlineInput = heroForm.querySelector('input[name="heroHeadline"]');
  const summaryInput = heroForm.querySelector('textarea[name="heroSummary"]');
  const badgesInput = heroForm.querySelector('textarea[name="heroBadges"]');
  const metricsInput = heroForm.querySelector('textarea[name="heroMetrics"]');
  const primaryLabelInput = heroForm.querySelector('input[name="heroPrimaryLabel"]');
  const primaryUrlInput = heroForm.querySelector('input[name="heroPrimaryUrl"]');
  const secondaryLabelInput = heroForm.querySelector('input[name="heroSecondaryLabel"]');
  const secondaryUrlInput = heroForm.querySelector('input[name="heroSecondaryUrl"]');
  if (taglineInput && document.activeElement !== taglineInput) taglineInput.value = data.tagline ?? "";
  if (headlineInput && document.activeElement !== headlineInput) headlineInput.value = data.headline ?? "";
  if (summaryInput && document.activeElement !== summaryInput) summaryInput.value = data.subheading ?? "";
  if (badgesInput && document.activeElement !== badgesInput) badgesInput.value = (Array.isArray(data.badges) ? data.badges : []).join("\n");
  if (metricsInput && document.activeElement !== metricsInput) metricsInput.value = metricsToTextarea(data.metrics ?? []);
  if (primaryLabelInput && document.activeElement !== primaryLabelInput) primaryLabelInput.value = data.primaryLabel ?? "";
  if (primaryUrlInput && document.activeElement !== primaryUrlInput) primaryUrlInput.value = data.primaryUrl ?? "";
  if (secondaryLabelInput && document.activeElement !== secondaryLabelInput) secondaryLabelInput.value = data.secondaryLabel ?? "";
  if (secondaryUrlInput && document.activeElement !== secondaryUrlInput) secondaryUrlInput.value = data.secondaryUrl ?? "";
}

function renderHero(data) {
  if (!data) return;
  const badges = Array.isArray(data.badges) ? data.badges.map((badge) => String(badge ?? "").trim()).filter(Boolean) : [];
  const metrics = Array.isArray(data.metrics) ? data.metrics.map(normalizeMetricEntry).filter((metric) => metric.value || metric.label) : [];
  heroState = {
    tagline: data.tagline ?? "",
    headline: data.headline ?? "",
    subheading: data.subheading ?? "",
    badges,
    metrics,
    primaryLabel: data.primaryLabel ?? "",
    primaryUrl: data.primaryUrl ?? "",
    secondaryLabel: data.secondaryLabel ?? "",
    secondaryUrl: data.secondaryUrl ?? "",
  };
  if (heroTaglineEl) heroTaglineEl.textContent = heroState.tagline || initialHeroState.tagline;
  if (heroHeadlineEl) heroHeadlineEl.textContent = heroState.headline || initialHeroState.headline;
  if (heroSummaryEl) heroSummaryEl.textContent = heroState.subheading || initialHeroState.subheading;
  if (heroBadgesEl) {
    heroBadgesEl.innerHTML = "";
    const targetBadges = heroState.badges.length ? heroState.badges : initialHeroState.badges;
    targetBadges.forEach((badge) => {
      const span = document.createElement("span");
      span.textContent = badge;
      heroBadgesEl.appendChild(span);
    });
  }
  if (heroMetricsEl) {
    heroMetricsEl.innerHTML = "";
    const targetMetrics = heroState.metrics.length ? heroState.metrics : initialHeroState.metrics;
    targetMetrics.forEach((metric) => {
      const li = document.createElement("li");
      const valueEl = document.createElement("strong");
      valueEl.textContent = metric.value || "-";
      const labelEl = document.createElement("span");
      labelEl.textContent = metric.label || "";
      li.append(valueEl, labelEl);
      heroMetricsEl.appendChild(li);
    });
  }
  if (heroPrimaryCta) {
    heroPrimaryCta.textContent = heroState.primaryLabel || initialHeroState.primaryLabel;
    heroPrimaryCta.setAttribute("href", heroState.primaryUrl || initialHeroState.primaryUrl || "#");
  }
  if (heroSecondaryCta) {
    heroSecondaryCta.textContent = heroState.secondaryLabel || initialHeroState.secondaryLabel;
    heroSecondaryCta.setAttribute("href", heroState.secondaryUrl || initialHeroState.secondaryUrl || "#");
  }
  populateHeroForm(heroState);
}

function renderGallery(images) {
  if (!Array.isArray(images) || images.length === 0) return "";
  const thumbnails = images
    .filter(Boolean)
    .map((url) => `<img src="${url}" alt="Project visual" loading="lazy" />`)
    .join("");
  return thumbnails ? `<div class="card-gallery">${thumbnails}</div>` : "";
}

function createProjectCard(data) {
  const article = document.createElement("article");
  article.dataset.motion = "card";
  const galleryMarkup = renderGallery(data.images ?? []);
  const bulletItems = (data.bullets ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const bulletMarkup = bulletItems.length
    ? `<ul>${bulletItems.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "";
  const linkMarkup = data.linkLabel && data.linkUrl
    ? `<div class="singularity__links"><a href="${data.linkUrl}" target="_blank" rel="noreferrer">${data.linkLabel}</a></div>`
    : "";
  const shouldShowLegacyImage = (!Array.isArray(data.images) || data.images.length === 0) && data.image;
  const mediaMarkup = shouldShowLegacyImage
    ? `<div class="project-card__media"><img src="${data.image}" alt="${data.title} visual" loading="lazy" /></div>`
    : "";
  article.innerHTML = `${galleryMarkup}${mediaMarkup}<header><p class="tag">${data.tag}</p><h3>${data.title}</h3></header><p>${data.description}</p>${bulletMarkup}${linkMarkup}`;
  return article;
}

function createSkillCard(data) {
  const article = document.createElement("article");
  article.dataset.motion = "card";
  article.innerHTML = `<h3>${data.title}</h3><p>${data.details}</p>`;
  return article;
}

function createBlogCard(data) {
  const article = document.createElement("article");
  article.dataset.motion = "card";
  const galleryMarkup = renderGallery(data.images ?? []);
  article.innerHTML = `${galleryMarkup}<h3>${data.title}</h3><p>${data.summary}</p><a href="${data.link}" target="_blank" rel="noreferrer">Read</a>`;
  return article;
}

function toBulletArray(value) {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderAbout(data) {
  if (!data) return;
  aboutState = {
    heading: data.heading ?? "",
    summary: data.summary ?? "",
    bullets: data.bullets ?? "",
    photo: data.photo ?? aboutState.photo,
  };

  if (aboutHeadingEl && aboutState.heading) {
    aboutHeadingEl.textContent = aboutState.heading;
  }
  if (aboutSummaryEl && aboutState.summary) {
    aboutSummaryEl.textContent = aboutState.summary;
  }
  if (aboutBulletsEl) {
    const bullets = toBulletArray(aboutState.bullets);
    aboutBulletsEl.innerHTML = "";
    (bullets.length ? bullets : ["Always improving delivery teams"]).forEach((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      aboutBulletsEl.appendChild(li);
    });
  }
  if (heroPhoto && aboutState.photo) {
    heroPhoto.src = aboutState.photo;
  }
  populateAboutForm(aboutState);
}

function populateAboutForm(data) {
  if (!aboutForm || !data) return;
  const headingInput = aboutForm.querySelector('input[name="aboutHeading"]');
  const summaryInput = aboutForm.querySelector('textarea[name="aboutSummary"]');
  const bulletsInput = aboutForm.querySelector('textarea[name="aboutBullets"]');
  const photoUrlInput = aboutForm.querySelector('input[name="aboutPhotoUrl"]');
  if (headingInput && document.activeElement !== headingInput) headingInput.value = data.heading ?? "";
  if (summaryInput && document.activeElement !== summaryInput) summaryInput.value = data.summary ?? "";
  if (bulletsInput && document.activeElement !== bulletsInput) bulletsInput.value = data.bullets ?? "";
  if (photoUrlInput && document.activeElement !== photoUrlInput) photoUrlInput.value = data.photo ?? "";
}

function createCertCard(cert) {
  const article = document.createElement("article");
  article.className = "cert-card";
  article.dataset.motion = "card";
  const issuer = cert.issuer ? `<span class="cert-card__issuer">${cert.issuer}</span>` : "";
  article.innerHTML = `
    <header>
      <span class="cert-card__year">${cert.year || ""}</span>
      ${issuer}
    </header>
    <h3>${cert.title}</h3>
    <p>${cert.description || ""}</p>
  `;
  return article;
}

function renderCertifications(list) {
  if (!certList) return;
  if (!Array.isArray(list) || list.length === 0) {
    certList.innerHTML = defaultCertMarkup;
    certificationsState = [];
    return;
  }
  certificationsState = list;
  certList.innerHTML = "";
  list.forEach((cert) => {
    const card = createCertCard(cert);
    certList.appendChild(card);
    registerScrollAnimation(card, 35);
  });
}

const CONTACT_ICON_SVGS = {
  linkedin: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5H4.5V23H.5V8.5zM8.5 8.5H12.2V10.3H12.3C12.8 9.3 14.1 8.2 16.1 8.2 20.1 8.2 21 10.6 21 14.6V23H17V15.4C17 13.3 16.6 11.8 14.9 11.8 13.2 11.8 12.6 13.1 12.6 15.2V23H8.5V8.5z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12A12 12 0 0 0 8.21 23.54c.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.72.08-.72 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.3-5.48-1.33-5.48-5.91 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.59-2.81 5.61-5.49 5.91.43.37.81 1.09.81 2.2 0 1.58-.02 2.86-.02 3.25 0 .32.21.7.83.58A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.01l10 6.25L22 6V6H2zm0 12h20V8.5l-10 6.25L2 8.5V18z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M6.62 10.79a15.09 15.09 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1A17.5 17.5 0 0 1 2.5 6a1 1 0 0 1 1-1H7a1 1 0 0 1 1 1c0 1.23.2 2.42.57 3.58a1 1 0 0 1-.24 1.01z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M10.59 13.41a1 1 0 0 0 1.41 0l5.3-5.3a3 3 0 0 0-4.24-4.24l-2 2a1 1 0 1 1-1.42-1.42l2-2A5 5 0 0 1 20.83 8a5 5 0 0 1-1.46 3.54l-5.3 5.3a3 3 0 0 1-4.24 0 1 1 0 1 1 1.42-1.42 1 1 0 0 0 1.42 0zm-7.88-2.12a5 5 0 0 0 0 7.07 5 5 0 0 0 7.07 0l2-2a1 1 0 1 0-1.42-1.42l-2 2a3 3 0 1 1-4.24-4.24l5.3-5.3a3 3 0 0 1 4.24 0 1 1 0 1 0 1.42-1.42 5 5 0 0 0-7.07 0z"/></svg>`,
};

function resolveContactHref(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed;
  if (trimmed.includes("@")) return `mailto:${trimmed}`;
  const digits = trimmed.replace(/[^+\d]/g, "");
  if (digits.length >= 7) return `tel:${digits}`;
  return null;
}

function getContactIconMarkup(entry) {
  const haystack = `${entry.title ?? ""} ${entry.details ?? ""}`.toLowerCase();
  if (haystack.includes("linkedin")) return CONTACT_ICON_SVGS.linkedin;
  if (haystack.includes("github")) return CONTACT_ICON_SVGS.github;
  if (haystack.includes("mail") || haystack.includes("@")) return CONTACT_ICON_SVGS.email;
  if (haystack.includes("phone") || /\d{3,}/.test(entry.details ?? "")) return CONTACT_ICON_SVGS.phone;
  return CONTACT_ICON_SVGS.link;
}

function createContactChip(entry) {
  const value = entry.details ?? "";
  const href = resolveContactHref(value);
  const link = document.createElement(href ? "a" : "div");
  link.className = "hero__contact-icon";
  if (href) {
    link.setAttribute("href", href);
    if (href.startsWith("http")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noreferrer");
    }
  }
  const circle = document.createElement("span");
  circle.className = "hero__contact-icon-circle";
  circle.setAttribute("aria-hidden", "true");
  circle.innerHTML = getContactIconMarkup(entry);
  const label = document.createElement("span");
  label.className = "hero__contact-icon-label";
  label.textContent = entry.title ?? "Contact";
  if (!href) {
    const fallback = document.createElement("span");
    fallback.textContent = value;
    fallback.className = "hero__contact-fallback";
    label.appendChild(document.createElement("br"));
    label.appendChild(fallback);
  }
  link.append(circle, label);
  return link;
}

function renderContactLinks(list) {
  if (!contactList) return;
  if (!Array.isArray(list) || list.length === 0) {
    contactList.innerHTML = defaultContactMarkup;
    contactLinksState = [];
    return;
  }
  contactLinksState = list;
  contactList.innerHTML = "";
  list.forEach((entry) => {
    const chip = createContactChip(entry);
    contactList.appendChild(chip);
  });
}

populateHeroForm(heroState);
populateAboutForm(aboutState);

async function requestJSON(endpoint, options = {}) {
  if (!API_BASE) {
    throw new Error("API base URL is not configured.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, signal: controller.signal });
    const contentType = response.headers.get("content-type") ?? "";
    const isJSON = contentType.includes("application/json");
    const payload = isJSON ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.error;
      throw new Error(message || `Request failed (${response.status})`);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function setFormBusy(form, busy) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) {
    submit.disabled = busy;
  }
}

function setFormStatus(form, message, variant = "info") {
  let status = form.querySelector(".editor-form__status");
  if (!message) {
    status?.remove();
    return;
  }
  if (!status) {
    status = document.createElement("p");
    status.className = "editor-form__status";
    status.setAttribute("role", "status");
    form.appendChild(status);
  }
  status.dataset.variant = variant;
  status.textContent = message;
}

async function loadPersistedContent() {
  if (!API_BASE) return;
  const heroPromise = heroTaglineEl || heroForm ? requestJSON("/hero").catch(() => null) : Promise.resolve(null);
  const projectsPromise = projectsContainer ? requestJSON("/projects").catch(() => []) : Promise.resolve([]);
  const skillsPromise = skillsGrid ? requestJSON("/skills").catch(() => []) : Promise.resolve([]);
  const blogsPromise = blogsGrid ? requestJSON("/blogs").catch(() => []) : Promise.resolve([]);
  const aboutPromise = aboutHeadingEl || aboutSummaryEl || aboutForm || heroPhoto ? requestJSON("/about").catch(() => null) : Promise.resolve(null);
  const certPromise = certList ? requestJSON("/certifications").catch(() => []) : Promise.resolve([]);
  const featuredPromise = contactList ? requestJSON("/featured-skills").catch(() => []) : Promise.resolve([]);
  try {
    const [heroContent, projects, skills, blogs, about, certifications, featuredSkills] = await Promise.all([
      heroPromise,
      projectsPromise,
      skillsPromise,
      blogsPromise,
      aboutPromise,
      certPromise,
      featuredPromise,
    ]);
    if (heroContent) {
      renderHero(heroContent);
    }
    if (projectsContainer && Array.isArray(projects)) {
      projects
        .slice()
        .reverse()
        .forEach((project) => {
          const card = createProjectCard(project);
          projectsContainer.appendChild(card);
          registerScrollAnimation(card);
        });
    }
    if (skillsGrid && Array.isArray(skills)) {
      skills
        .slice()
        .reverse()
        .forEach((skill) => {
          const card = createSkillCard(skill);
          skillsGrid.appendChild(card);
          registerScrollAnimation(card, 35);
        });
    }
    if (blogsGrid && Array.isArray(blogs)) {
      blogs
        .slice()
        .reverse()
        .forEach((blog) => {
          const card = createBlogCard(blog);
          blogsGrid.appendChild(card);
          registerScrollAnimation(card, 35);
        });
    }
    if (about) {
      renderAbout(about);
    }
    if (Array.isArray(certifications)) {
      renderCertifications(certifications);
    }
    if (Array.isArray(featuredSkills)) {
      renderContactLinks(featuredSkills);
    }
  } catch (error) {
    console.warn("Unable to load saved entries", error);
  }
}

function persistHero(payload) {
  return requestJSON("/hero", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function persistProject(payload) {
  return requestJSON("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function persistSkill(payload) {
  return requestJSON("/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function persistBlog(payload) {
  return requestJSON("/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function persistAbout(payload) {
  return requestJSON("/about", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function persistCertification(payload) {
  return requestJSON("/certifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function persistContactLink(payload) {
  return requestJSON("/featured-skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function purgeContent(sections) {
  return requestJSON("/content", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sections }),
  });
}

async function uploadImages(files, maxImages = 5) {
  if (!files || files.length === 0) return [];
  if (!API_BASE) throw new Error("API base URL is not configured.");
  const limit = Math.max(1, maxImages);
  const selected = Array.from(files).slice(0, limit);
  if (!selected.length) return [];
  const formData = new FormData();
  selected.forEach((file) => formData.append("images", file));
  const response = await fetch(`${API_BASE}/uploads`, { method: "POST", body: formData });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Upload failed.");
  }
  const payload = await response.json();
  return (payload.files ?? []).map((file) => file.url).filter(Boolean);
}

function extractUrlList(value) {
  if (!value) return [];
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

editFab?.addEventListener("click", () => {
  if (!editorUnlocked) {
    openModal();
  } else {
    toggleEditorPanel();
  }
});

modalCancel?.addEventListener("click", closeModal);

modalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const passcode = formData.get("passcode")?.toString().trim();
  const errorEl = editModal?.querySelector(".edit-modal__error");
  if (passcode && passcode === getPasscode()) {
    unlockEditor();
  } else if (errorEl) {
    errorEl.textContent = "Incorrect passcode.";
  }
});

resetToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  showResetForm();
});

resetCancel?.addEventListener("click", (event) => {
  event.preventDefault();
  hideResetForm();
});

resetForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const current = formData.get("currentPasscode")?.toString().trim() ?? "";
  const next = formData.get("newPasscode")?.toString().trim() ?? "";
  const confirm = formData.get("confirmPasscode")?.toString().trim() ?? "";
  if (!current || current !== getPasscode()) {
    setResetStatus("Current passcode is incorrect.", "error");
    return;
  }
  if (!next || next.length < 4) {
    setResetStatus("New passcode must be at least 4 characters.", "error");
    return;
  }
  if (next !== confirm) {
    setResetStatus("New passcodes do not match.", "error");
    return;
  }
  setPasscode(next);
  form.reset();
  setResetStatus("Passcode updated. Use the new code to unlock.", "success");
});

panelClose?.addEventListener("click", () => {
  editorPanel?.setAttribute("hidden", "");
});

inlineToggle?.addEventListener("change", (event) => {
  const target = event.currentTarget;
  const enabled = target.checked;
  setInlineEditing(enabled);
});

heroForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    tagline: formData.get("heroTagline")?.toString().trim() ?? "",
    headline: formData.get("heroHeadline")?.toString().trim() ?? "",
    subheading: formData.get("heroSummary")?.toString().trim() ?? "",
    badges: toBulletArray(formData.get("heroBadges")?.toString() ?? ""),
    metrics: parseMetricTextarea(formData.get("heroMetrics")?.toString() ?? ""),
    primaryLabel: formData.get("heroPrimaryLabel")?.toString().trim() ?? "",
    primaryUrl: formData.get("heroPrimaryUrl")?.toString().trim() ?? "",
    secondaryLabel: formData.get("heroSecondaryLabel")?.toString().trim() ?? "",
    secondaryUrl: formData.get("heroSecondaryUrl")?.toString().trim() ?? "",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving hero…");
  try {
    const saved = await persistHero(payload);
    renderHero(saved ?? payload);
    setFormStatus(form, "Hero updated.", "success");
  } catch (error) {
    console.error("Unable to update hero", error);
    setFormStatus(form, error.message || "Unable to update hero.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

projectForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!projectsContainer) return;
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    tag: formData.get("tag")?.toString() ?? "Project",
    title: formData.get("title")?.toString() ?? "New project",
    description: formData.get("description")?.toString() ?? "",
    bullets: formData.get("bullets")?.toString() ?? "",
    linkLabel: formData.get("linkLabel")?.toString() ?? "",
    linkUrl: formData.get("linkUrl")?.toString() ?? "",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving entry…");
  try {
    const uploadInput = form.querySelector('input[name="projectImages"]');
    const urlField = form.querySelector('textarea[name="projectImageUrls"]');
    const uploadedImages = await uploadImages(uploadInput?.files ?? []);
    const remoteImages = extractUrlList(urlField?.value ?? "");
    const images = [...uploadedImages, ...remoteImages];
    const saved = await persistProject({ ...payload, images, image: images[0] ?? "" });
    const card = createProjectCard(saved ?? payload);
    projectsContainer.appendChild(card);
    registerScrollAnimation(card);
    form.reset();
    setFormStatus(form, "Project saved.", "success");
  } catch (error) {
    console.error("Unable to save project", error);
    setFormStatus(form, error.message || "Unable to save project.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

skillForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!skillsGrid) return;
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    title: formData.get("skillTitle")?.toString() ?? "Skill",
    details: formData.get("skillDetails")?.toString() ?? "",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving entry…");
  try {
    const saved = await persistSkill(payload);
    const card = createSkillCard(saved ?? payload);
    skillsGrid.appendChild(card);
    registerScrollAnimation(card, 35);
    form.reset();
    setFormStatus(form, "Skill saved.", "success");
  } catch (error) {
    console.error("Unable to save skill", error);
    setFormStatus(form, error.message || "Unable to save skill.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

blogForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!blogsGrid) return;
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    title: formData.get("blogTitle")?.toString() ?? "Blog",
    summary: formData.get("blogSummary")?.toString() ?? "",
    link: formData.get("blogLink")?.toString() ?? "#",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving entry…");
  try {
    const uploadInput = form.querySelector('input[name="blogImages"]');
    const urlField = form.querySelector('textarea[name="blogImageUrls"]');
    const uploadedImages = await uploadImages(uploadInput?.files ?? []);
    const remoteImages = extractUrlList(urlField?.value ?? "");
    const images = [...uploadedImages, ...remoteImages];
    const saved = await persistBlog({ ...payload, images });
    const card = createBlogCard(saved ?? { ...payload, images });
    blogsGrid.appendChild(card);
    registerScrollAnimation(card, 35);
    form.reset();
    setFormStatus(form, "Blog saved.", "success");
  } catch (error) {
    console.error("Unable to save blog", error);
    setFormStatus(form, error.message || "Unable to save blog.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

aboutForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    heading: formData.get("aboutHeading")?.toString() ?? "",
    summary: formData.get("aboutSummary")?.toString() ?? "",
    bullets: formData.get("aboutBullets")?.toString() ?? "",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving about section…");
  try {
    const uploadInput = form.querySelector('input[name="aboutPhoto"]');
    const photoUrlInput = form.querySelector('input[name="aboutPhotoUrl"]');
    const uploaded = await uploadImages(uploadInput?.files ?? [], 1);
    const remote = extractUrlList(photoUrlInput?.value ?? "");
    const photo = uploaded[0] ?? remote[0] ?? aboutState.photo ?? "";
    const saved = await persistAbout({ ...payload, photo });
    renderAbout(saved ?? { ...payload, photo });
    if (uploadInput) uploadInput.value = "";
    setFormStatus(form, "About updated.", "success");
  } catch (error) {
    console.error("Unable to update about", error);
    setFormStatus(form, error.message || "Unable to update about section.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

certForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!certList) return;
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    title: formData.get("certTitle")?.toString() ?? "",
    issuer: formData.get("certIssuer")?.toString() ?? "",
    year: formData.get("certYear")?.toString() ?? "",
    description: formData.get("certDescription")?.toString() ?? "",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving certification…");
  try {
    const saved = await persistCertification(payload);
    const next = [saved ?? payload, ...certificationsState];
    renderCertifications(next);
    form.reset();
    setFormStatus(form, "Certification added.", "success");
  } catch (error) {
    console.error("Unable to save certification", error);
    setFormStatus(form, error.message || "Unable to save certification.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactList) return;
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    title: formData.get("contactLabel")?.toString() ?? "",
    details: formData.get("contactValue")?.toString() ?? "",
  };
  setFormBusy(form, true);
  setFormStatus(form, "Saving contact…");
  try {
    const saved = await persistContactLink(payload);
    const next = [saved ?? payload, ...contactLinksState];
    renderContactLinks(next);
    form.reset();
    setFormStatus(form, "Contact added.", "success");
  } catch (error) {
    console.error("Unable to save contact", error);
    setFormStatus(form, error.message || "Unable to save contact.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

purgeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const sections = Array.from(form.querySelectorAll('input[name="sections"]:checked')).map((input) => input.value);
  if (!sections.length) {
    setFormStatus(form, "Select at least one area to delete.", "error");
    return;
  }
  const confirmDelete = window.confirm(`Delete saved data for ${sections.length} section(s)? This cannot be undone.`);
  if (!confirmDelete) return;
  setFormBusy(form, true);
  setFormStatus(form, "Deleting selected data…");
  try {
    await purgeContent(sections);
    setFormStatus(form, "Selected data deleted. Reloading…", "success");
    setTimeout(() => window.location.reload(), 900);
  } catch (error) {
    console.error("Unable to delete content", error);
    setFormStatus(form, error.message || "Unable to delete content.", "error");
  } finally {
    setFormBusy(form, false);
  }
});

function playIntro() {
  return new Promise((resolve) => {
    if (!intro) {
      resolve();
      return;
    }

    if (prefersReducedMotion) {
      intro.remove();
      resolve();
      return;
    }

    const letters = intro.querySelectorAll(".intro__letters span");
    const meteor = intro.querySelector(".intro__meteor");
    const impact = intro.querySelector(".intro__impact");
    const shockwave = intro.querySelector(".intro__shockwave");

    if (!letters.length || !meteor || !impact || !shockwave) {
      intro.remove();
      resolve();
      return;
    }

    gsap.set(letters, { opacity: 0, y: 60 });
    gsap.set(meteor, { xPercent: -140, yPercent: -80, opacity: 0, rotate: -8 });
    gsap.set([impact, shockwave], { opacity: 0, scale: 0.2 });

    const timeline = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        document.body.classList.add("intro-complete");
        gsap.delayedCall(0.5, () => {
          intro.remove();
          resolve();
        });
      },
    });

    timeline
      .to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
      })
      .to(
        meteor,
        {
          opacity: 1,
          duration: 0.1,
        },
        "-=0.3"
      )
      .to(
        meteor,
        {
          xPercent: 90,
          yPercent: 140,
          duration: 0.65,
          ease: "power4.in",
        },
        "<"
      )
      .to(
        impact,
        {
          opacity: 1,
          scale: 6,
          duration: 0.35,
        },
        "-=0.15"
      )
      .to(
        shockwave,
        {
          opacity: 1,
          scale: 14,
          duration: 0.6,
        },
        "-=0.25"
      )
      .to(
        [impact, shockwave],
        {
          opacity: 0,
          duration: 0.3,
        },
        "-=0.1"
      )
      .to(
        letters,
        {
          opacity: 0,
          y: -40,
          duration: 0.4,
          stagger: -0.1,
        },
        "-=0.2"
      )
      .to(".intro", { opacity: 0, duration: 0.7 }, "-=0.2");
  });
}

window.addEventListener("load", () => {
  playIntro().then(startExperience);
});

loadPersistedContent();
