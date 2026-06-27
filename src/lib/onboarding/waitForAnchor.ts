// Resolver de anclas del tour: localiza el elemento [data-tour="key"] VISIBLE.
// Mobile y desktop coexisten en el DOM (uno oculto por CSS), así que elegimos por
// tamaño de rect + display, NO por offsetParent (el botón "Continuar Unidad" móvil es
// position:fixed y su offsetParent es null aun estando visible).

export function isUsable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
  return true;
}

export function pickAnchor(key: string): HTMLElement | null {
  const nodes = document.querySelectorAll(`[data-tour="${key}"]`);
  for (const node of Array.from(nodes)) {
    if (isUsable(node)) return node;
  }
  return null;
}

// Espera a que el ancla aparezca y sea visible. Las páginas cliente (calendario,
// materiales, …) hacen fetch y montan tarde: MutationObserver capta el insert, y un
// poll de respaldo capta cambios de visibilidad por CSS que el observer no ve.
export function waitForAnchor(key: string, timeout = 4000): Promise<HTMLElement | null> {
  const immediate = pickAnchor(key);
  if (immediate) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    let settled = false;
    let observer: MutationObserver | null = null;
    let poll = 0;
    let timer = 0;

    const cleanup = () => {
      if (observer) observer.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(timer);
    };
    const finish = (el: HTMLElement | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(el);
    };

    observer = new MutationObserver(() => {
      const el = pickAnchor(key);
      if (el) finish(el);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    poll = window.setInterval(() => {
      const el = pickAnchor(key);
      if (el) finish(el);
    }, 120);
    timer = window.setTimeout(() => finish(null), timeout);
  });
}
