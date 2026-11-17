(() => {
  if (window.parent === window) return;

  const notifyParent = (replace = false) => {
    const route = window.location.pathname.split('/').pop() + window.location.search + window.location.hash;
    window.parent.postMessage({ type: 'portfolio-route', route, replace }, '*');
  };

  // Let the outer portfolio shell keep its refreshable URL in sync, including on file://.
  try {
    ['pushState', 'replaceState'].forEach((method) => {
      const original = window.history[method];
      window.history[method] = function (...args) {
        const result = original.apply(this, args);
        notifyParent(method === 'replaceState');
        return result;
      };
    });
  } catch (_) {}

  window.addEventListener('hashchange', () => notifyParent(false));
  window.addEventListener('popstate', () => notifyParent(true));
  window.addEventListener('pageshow', () => notifyParent(false));
  notifyParent(false);
})();
