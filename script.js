const reveals = document.querySelectorAll('.reveal');

const siteNav = document.querySelector('.site-nav');
const navToggle = siteNav?.querySelector('.nav-toggle');
const navToggleLabel = siteNav?.querySelector('.nav-toggle-label');
const navLinks = [...(siteNav?.querySelectorAll('.nav-links a') ?? [])];

const setMenuOpen = (open) => {
  if (!siteNav || !navToggle) return;
  siteNav.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  if (navToggleLabel) navToggleLabel.textContent = open ? 'Close' : 'Menu';
};

navToggle?.addEventListener('click', () => {
  setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
});

navLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && siteNav?.classList.contains('menu-open')) {
    setMenuOpen(false);
    navToggle?.focus();
  }
});

document.addEventListener('click', (event) => {
  if (siteNav?.classList.contains('menu-open') && !siteNav.contains(event.target)) setMenuOpen(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 600) setMenuOpen(false);
});

const navSections = navLinks
  .map((link) => ({ link, section: document.querySelector(link.hash) }))
  .filter(({ section }) => section);

const navSectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navSections.forEach(({ link, section }) => {
    if (section === visible.target) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-25% 0px -65% 0px', threshold: [0, 0.1] });

navSections.forEach(({ section }) => navSectionObserver.observe(section));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach((element) => observer.observe(element));

const comparisons = document.querySelectorAll('[data-visual-comparison]');

const initializeComparison = (comparison) => {
  if (comparison.dataset.comparisonReady === 'true' || comparison.hidden) return;

  const originalSrc = comparison.dataset.originalSrc;
  const visualizationSrc = comparison.dataset.visualizationSrc;
  const original = comparison.querySelector('[data-comparison-original]');
  const concept = comparison.querySelector('[data-comparison-concept]');
  const reveal = comparison.querySelector('[data-comparison-reveal]');
  const divider = comparison.querySelector('[data-comparison-divider]');
  const control = comparison.querySelector('[data-comparison-control]');
  const stage = comparison.querySelector('.visual-comparison-stage');
  const host = comparison.closest('[data-comparison-host]');
  const fallback = host?.querySelector('[data-comparison-fallback]');

  if (!originalSrc || !visualizationSrc || !original || !concept || !reveal || !divider || !control || !stage) return;

  original.src = originalSrc;
  concept.src = visualizationSrc;

  const update = () => {
    const value = Number(control.value);
    const originalShare = 100 - value;
    reveal.style.width = `${value}%`;
    divider.style.left = `${value}%`;
    concept.style.width = `${stage.clientWidth}px`;
    control.setAttribute('aria-valuetext', `${originalShare}% original drawing and ${value}% concept visualization`);
  };

  const updateFromPointer = (event) => {
    const bounds = stage.getBoundingClientRect();
    const value = Math.round(((event.clientX - bounds.left) / bounds.width) * 100);
    control.value = String(Math.max(0, Math.min(100, value)));
    update();
  };

  let dragging = false;
  control.addEventListener('pointerdown', (event) => {
    dragging = true;
    updateFromPointer(event);
  });
  control.addEventListener('pointermove', (event) => {
    if (dragging) updateFromPointer(event);
  });
  control.addEventListener('pointerup', () => { dragging = false; });
  control.addEventListener('pointercancel', () => { dragging = false; });
  control.addEventListener('input', update);
  new ResizeObserver(update).observe(stage);
  update();
  if (fallback) fallback.hidden = true;
  comparison.dataset.comparisonReady = 'true';
};

comparisons.forEach((comparison) => {
  initializeComparison(comparison);
  new MutationObserver(() => initializeComparison(comparison)).observe(comparison, {
    attributes: true,
    attributeFilter: ['hidden', 'data-visualization-src'],
  });
});

window.initializeVisualComparisons = () => comparisons.forEach(initializeComparison);
