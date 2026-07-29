(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections = [...document.querySelectorAll(".chapter[id]")];
  const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")];
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const heroImage = document.querySelector(".hero-media img");
  const detailSections = [...document.querySelectorAll(".detail-section")];
  let frameRequested = false;

  const setActiveChapter = (section) => {
    if (!section) return;
    body.dataset.tone = section.dataset.tone || "light";
    body.dataset.chapter = section.id;
    chapterLinks.forEach((link) => {
      if (link.dataset.chapterLink === section.id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const chapterObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveChapter(visible.target);
    },
    { rootMargin: "-32% 0px -48%", threshold: [0, 0.2, 0.5, 0.8] },
  );
  sections.forEach((section) => chapterObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8%" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));

  const updateScrollEffects = () => {
    frameRequested = false;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    root.style.setProperty("--scroll-progress", progress.toFixed(4));

    if (!reduceMotion.matches) {
      if (heroImage) {
        const heroShift = Math.min(42, window.scrollY * 0.045);
        root.style.setProperty("--hero-shift", heroShift.toFixed(2));
      }
      detailSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const local = Math.max(-1, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
        section.style.setProperty("--detail-shift", ((local - 0.5) * 24).toFixed(2));
      });
    }
  };

  const requestScrollUpdate = () => {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateScrollEffects);
    }
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  updateScrollEffects();

  chapterLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.chapterLink);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    });
  });

  const dialog = document.getElementById("drawing-viewer");
  const stage = dialog?.querySelector("[data-viewer-stage]");
  const image = dialog?.querySelector("[data-viewer-image]");
  const viewerTitle = dialog?.querySelector("[data-viewer-title]");
  const viewerMeta = dialog?.querySelector("[data-viewer-meta]");
  const selectors = [...document.querySelectorAll("[data-drawing-selector]")];

  selectors.forEach((selector, selectorIndex) => {
    const options = [...selector.querySelectorAll("[data-selector-option]")];
    const selectorImage = selector.querySelector("[data-selector-image]");
    const openButton = selector.querySelector("[data-selector-open]");
    const title = selector.querySelector("[data-selector-title]");
    const meta = selector.querySelector("[data-selector-meta]");
    const description = selector.querySelector("[data-selector-description]");
    if (!options.length || !selectorImage || !openButton || !title || !meta || !description) return;

    const panelId = `drawing-selector-panel-${selectorIndex + 1}`;
    openButton.id = panelId;
    openButton.setAttribute("role", "tabpanel");

    const selectOption = (option, moveFocus = false) => {
      options.forEach((candidate, optionIndex) => {
        const isSelected = candidate === option;
        candidate.setAttribute("aria-selected", String(isSelected));
        candidate.tabIndex = isSelected ? 0 : -1;
        candidate.id ||= `drawing-selector-${selectorIndex + 1}-tab-${optionIndex + 1}`;
        candidate.setAttribute("aria-controls", panelId);
      });
      openButton.setAttribute("aria-labelledby", option.id);
      selectorImage.src = option.dataset.src;
      selectorImage.alt = option.dataset.alt;
      title.textContent = option.dataset.title;
      meta.textContent = option.dataset.meta;
      description.textContent = option.dataset.description;
      openButton.dataset.viewerSrc = option.dataset.src;
      openButton.dataset.viewerTitle = option.dataset.title;
      openButton.dataset.viewerMeta = option.dataset.meta;
      openButton.dataset.viewerAlt = option.dataset.alt;
      openButton.setAttribute("aria-label", `Open ${option.dataset.title.toLowerCase()} in full-screen viewer`);
      if (moveFocus) option.focus();
    };

    options.forEach((option, optionIndex) => {
      option.addEventListener("click", () => selectOption(option));
      option.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = optionIndex;
        if (event.key === "ArrowLeft") nextIndex = (optionIndex - 1 + options.length) % options.length;
        if (event.key === "ArrowRight") nextIndex = (optionIndex + 1) % options.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = options.length - 1;
        selectOption(options[nextIndex], true);
      });
    });
    selectOption(options.find((option) => option.getAttribute("aria-selected") === "true") || options[0]);
  });

  const openButtons = [...document.querySelectorAll("[data-open-viewer], [data-selector-open]")];
  const controls = [...(dialog?.querySelectorAll("[data-viewer-action]") || [])];

  if (!dialog || !stage || !image) return;

  const state = { scale: 1, x: 0, y: 0 };
  const pointers = new Map();
  let dragOrigin = null;
  let pinchOrigin = null;

  const getContainSize = () => {
    const stageRect = stage.getBoundingClientRect();
    const imageRatio = image.naturalWidth / image.naturalHeight || 1;
    const stageRatio = stageRect.width / stageRect.height || 1;
    if (imageRatio > stageRatio) {
      return { width: stageRect.width * 0.92, height: (stageRect.width * 0.92) / imageRatio, stageRect };
    }
    return { width: stageRect.height * 0.88 * imageRatio, height: stageRect.height * 0.88, stageRect };
  };

  const clampPan = () => {
    const size = getContainSize();
    const maxX = Math.max(0, (size.width * state.scale - size.stageRect.width) / 2 + 24);
    const maxY = Math.max(0, (size.height * state.scale - size.stageRect.height) / 2 + 24);
    state.x = Math.max(-maxX, Math.min(maxX, state.x));
    state.y = Math.max(-maxY, Math.min(maxY, state.y));
  };

  const renderViewer = () => {
    clampPan();
    image.style.setProperty("--zoom", state.scale.toFixed(3));
    image.style.setProperty("--pan-x", `${state.x.toFixed(1)}px`);
    image.style.setProperty("--pan-y", `${state.y.toFixed(1)}px`);
  };

  const resetViewer = () => {
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    renderViewer();
  };

  const setScale = (nextScale) => {
    state.scale = Math.max(1, Math.min(5, nextScale));
    if (state.scale === 1) {
      state.x = 0;
      state.y = 0;
    }
    renderViewer();
  };

  const defaultDrawing = {
    src: image.getAttribute("src"),
    alt: image.getAttribute("alt"),
    title: viewerTitle?.textContent || "Study 001",
    meta: viewerMeta?.textContent || "R-L-S",
  };

  const openViewer = (trigger) => {
    image.src = trigger?.dataset.viewerSrc || defaultDrawing.src;
    image.alt = trigger?.dataset.viewerAlt || defaultDrawing.alt;
    if (viewerTitle) viewerTitle.textContent = trigger?.dataset.viewerTitle || defaultDrawing.title;
    if (viewerMeta) viewerMeta.textContent = trigger?.dataset.viewerMeta || defaultDrawing.meta;
    resetViewer();
    body.classList.add("viewer-open");
    dialog.showModal();
    controls.find((control) => control.dataset.viewerAction === "close")?.focus();
  };

  const closeViewer = () => {
    dialog.close();
    body.classList.remove("viewer-open");
    pointers.clear();
  };

  openButtons.forEach((button) => button.addEventListener("click", () => openViewer(button)));
  dialog.addEventListener("close", () => body.classList.remove("viewer-open"));
  image.addEventListener("load", renderViewer);

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      const action = control.dataset.viewerAction;
      if (action === "close") closeViewer();
      if (action === "reset") resetViewer();
      if (action === "zoom-in") setScale(state.scale + 0.5);
      if (action === "zoom-out") setScale(state.scale - 0.5);
    });
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      setScale(state.scale + (event.deltaY < 0 ? 0.25 : -0.25));
    },
    { passive: false },
  );

  stage.addEventListener("pointerdown", (event) => {
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      dragOrigin = { pointerX: event.clientX, pointerY: event.clientY, x: state.x, y: state.y };
      stage.classList.add("is-dragging");
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchOrigin = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: state.scale };
    }
  });

  stage.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && pinchOrigin) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      setScale(pinchOrigin.scale * (distance / Math.max(1, pinchOrigin.distance)));
      return;
    }
    if (pointers.size === 1 && dragOrigin && state.scale > 1) {
      state.x = dragOrigin.x + event.clientX - dragOrigin.pointerX;
      state.y = dragOrigin.y + event.clientY - dragOrigin.pointerY;
      renderViewer();
    }
  });

  const releasePointer = (event) => {
    pointers.delete(event.pointerId);
    pinchOrigin = null;
    if (pointers.size === 1) {
      const [remaining] = pointers.values();
      dragOrigin = { pointerX: remaining.x, pointerY: remaining.y, x: state.x, y: state.y };
    } else {
      dragOrigin = null;
      stage.classList.remove("is-dragging");
    }
  };

  stage.addEventListener("pointerup", releasePointer);
  stage.addEventListener("pointercancel", releasePointer);

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "+" || event.key === "=") setScale(state.scale + 0.5);
    if (event.key === "-") setScale(state.scale - 0.5);
    if (event.key === "0") resetViewer();
  });

  window.addEventListener("resize", renderViewer, { passive: true });
})();
