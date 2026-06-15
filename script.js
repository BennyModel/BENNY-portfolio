(function () {
  const storageKey = "benny-selected-theme";
  const defaultTheme = "frost-rune";
  const body = document.body;
  const themeButtons = document.querySelectorAll("[data-theme-choice]");
  const menu = document.getElementById("site-menu");
  const navToggle = document.querySelector(".nav-toggle");
  const cursorCore = document.querySelector(".cursor-core");
  const cursorRing = document.querySelector(".cursor-ring");

  function setTheme(theme) {
    body.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeChoice === theme;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme || defaultTheme;
  setTheme(initialTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeChoice);
    });
  });

  if (navToggle && menu) {
    navToggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function initRevealAnimations() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = [
      ".hero-copy",
      ".section-heading",
      ".portfolio-filters .filter-btn",
      ".split-layout > *",
      ".text-panel",
      ".project-card",
      ".skill-cloud span",
      ".guild-card",
      ".member-card",
      ".contact-grid > *",
      ".contact-list a"
    ];
    const elements = document.querySelectorAll(revealTargets.join(", "));

    elements.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 65}ms`);
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12
    });

    elements.forEach((element) => observer.observe(element));
  }

  function initScrollEffects() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      return;
    }

    let ticking = false;

    function updateScrollVars() {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const scrollY = window.scrollY || window.pageYOffset;
      const ratio = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      body.style.setProperty("--scroll-y", `${scrollY}px`);
      body.style.setProperty("--scroll-ratio", ratio.toFixed(4));
      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        requestAnimationFrame(updateScrollVars);
        ticking = true;
      }
    }

    updateScrollVars();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll("[data-filter]");
    const projectCards = document.querySelectorAll(".project-card[data-category]");

    if (!filterButtons.length || !projectCards.length) {
      return;
    }

    function applyFilter(filter) {
      filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      projectCards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered-out", !shouldShow);

        if (shouldShow) {
          requestAnimationFrame(() => card.classList.add("is-visible"));
        }
      });
    }

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
      button.addEventListener("click", () => applyFilter(button.dataset.filter));
    });
  }

  function initLightbox() {
    const lightbox = document.querySelector(".lightbox");
    const lightboxImage = document.querySelector(".lightbox-image");
    const lightboxTitle = document.querySelector(".lightbox-title");
    const lightboxType = document.querySelector(".lightbox-type");
    const closeButton = document.querySelector(".lightbox-close");
    const cards = document.querySelectorAll(".project-card, .member-card");
    const emptyImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

    if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxType || !closeButton || !cards.length) {
      return;
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      body.classList.remove("lightbox-open");
      lightboxImage.src = emptyImage;
      lightboxImage.alt = "";
    }

    function openLightbox(card) {
      const image = card.querySelector("img");
      const title = card.querySelector("h3");
      const type = card.querySelector(".project-type");

      if (!image || !title || !type) {
        return;
      }

      lightboxImage.src = image.getAttribute("src");
      lightboxImage.alt = image.getAttribute("alt") || title.textContent.trim();
      lightboxTitle.textContent = title.textContent.trim();
      lightboxType.textContent = type.textContent.trim();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      body.classList.add("lightbox-open");
      closeButton.focus();
    }

    cards.forEach((card) => {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", () => openLightbox(card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(card);
        }
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  function initArcaneCursor() {
    const canUseCursor = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseCursor || !cursorCore || !cursorRing) {
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    function moveCursor(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      body.classList.add("cursor-ready");
      cursorCore.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
    }

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX - cursorRing.offsetWidth / 2}px, ${ringY - cursorRing.offsetHeight / 2}px, 0)`;
      requestAnimationFrame(animateRing);
    }

    const hoverTargets = document.querySelectorAll("a, button, .project-card, .guild-card, .member-card, .skill-cloud span");
    hoverTargets.forEach((target) => {
      target.addEventListener("mouseenter", () => body.classList.add("cursor-hover"));
      target.addEventListener("mouseleave", () => body.classList.remove("cursor-hover"));
    });

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseleave", () => body.classList.remove("cursor-ready", "cursor-hover"));
    window.addEventListener("mouseenter", () => body.classList.add("cursor-ready"));
    animateRing();
  }

  initRevealAnimations();
  initScrollEffects();
  initPortfolioFilters();
  initLightbox();
  initArcaneCursor();
})();
