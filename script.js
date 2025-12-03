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
