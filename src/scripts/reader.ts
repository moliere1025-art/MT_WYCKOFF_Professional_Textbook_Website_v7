import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PROGRESS_KEY = "mtwyckoff:progress:v1";
const root = document.querySelector<HTMLElement>("[data-reader-root]");
const progressBar = document.querySelector<HTMLElement>("[data-reading-progress]");
const sideProgress = document.querySelector<HTMLElement>("[data-side-progress]");

function saveProgress(percent: number) {
  if (!root) return;
  const number = root.dataset.chapter || "0";
  const title = root.dataset.chapterTitle || "";
  try {
    const store = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    const previous = store[number]?.percent || 0;
    const maximum = Math.max(previous, percent);
    store[number] = {
      percent: Math.round(maximum * 10) / 10,
      complete: maximum >= 96,
      title,
      timestamp: Date.now()
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
  } catch {
    // Reading remains fully usable when storage is disabled.
  }
}

let saveTimer = 0;
function updateProgress() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const percent = Math.max(0, Math.min(100, window.scrollY / max * 100));
  const transform = `scaleX(${percent / 100})`;
  if (progressBar) progressBar.style.transform = transform;
  if (sideProgress) sideProgress.style.transform = transform;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveProgress(percent), 350);
}

function initSectionObserver() {
  const sections = [...document.querySelectorAll<HTMLElement>("[data-reader-section]")];
  const railSection = document.querySelector<HTMLElement>("[data-rail-section]");
  const sidebarSection = document.querySelector<HTMLElement>("[data-sidebar-section]");
  const links = new Map(
    [...document.querySelectorAll<HTMLAnchorElement>("[data-section-link]")].map((link) => [link.dataset.sectionLink, link])
  );
  if (!sections.length) return;

  const activate = (id: string) => {
    links.forEach((link, key) => link.classList.toggle("is-active", key === id));
    const activeIndex = sections.findIndex((section) => section.id === id);
    const sectionNumber = String(activeIndex + 1).padStart(2, "0");
    if (railSection && activeIndex >= 0) railSection.textContent = sectionNumber;
    if (sidebarSection && activeIndex >= 0) sidebarSection.textContent = sectionNumber;
    const drawer = document.querySelector<HTMLElement>("[data-sidebar]");
    if (drawer?.classList.contains("is-open") || drawer?.classList.contains("is-pinned")) links.get(id)?.scrollIntoView({ block: "nearest" });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) activate(visible[0].target.id);
  }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, .1] });

  sections.forEach((section) => observer.observe(section));
  activate(sections[0].id);
}

function initMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const context = gsap.matchMedia();
  context.add("(min-width: 681px)", () => {
    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    timeline
      .fromTo("[data-intro-rule]", { scaleX: 0 }, { scaleX: 1, duration: .78 })
      .fromTo(".chapter-intro__number", { color: "#b8b8b3" }, { color: "var(--accent)", duration: .6 }, "-=.38")
      .fromTo(".chapter-intro__title", { color: "#aaaead" }, { color: "var(--ink)", duration: .82 }, "-=.5")
      .fromTo(".chapter-intro__notes", { opacity: 0 }, { opacity: 1, duration: .55 }, "-=.32");

    document.querySelectorAll<HTMLElement>("[data-figure-reveal]").forEach((figure) => {
      const image = figure.querySelector(".evidence-figure__image");
      const caption = figure.querySelector("figcaption");
      const figureTimeline = gsap.timeline({
        scrollTrigger: { trigger: figure, start: "top 82%", once: true }
      });
      figureTimeline
        .fromTo(image, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: .76, ease: "power2.inOut" })
        .fromTo(caption, { opacity: 0 }, { opacity: 1, duration: .42 }, "-=.16");
    });

    return () => context.revert();
  });
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });
window.addEventListener("pagehide", updateProgress);

updateProgress();
initSectionObserver();
initMotion();
