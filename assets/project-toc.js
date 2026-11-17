(() => {
  const toc = document.querySelector('.side-toc');
  const handle = toc?.querySelector('summary');
  if (!toc || !handle) return;

  const mobileQuery = window.matchMedia('(max-width: 699px)');
  const storageKey = () => `portfolio-project-toc-position-v1:${mobileQuery.matches ? 'mobile' : 'desktop'}`;
  const setHint = () => {
    handle.title = document.documentElement.lang.toLowerCase().startsWith('en')
      ? 'Drag to move the contents panel'
      : '按住并拖动目录，可移到不遮挡的位置';
  };

  const applyPosition = (left, top, persist = true) => {
    const rect = toc.getBoundingClientRect();
    const width = rect.width || (mobileQuery.matches ? 48 : (window.innerWidth < 1200 ? 132 : 164));
    const height = rect.height || (mobileQuery.matches ? 48 : window.innerHeight * .8);
    const x = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const y = Math.max(8, Math.min(top, window.innerHeight - height - 8));
    toc.style.setProperty('--toc-left', `${x}px`);
    toc.style.setProperty('--toc-top', `${y}px`);
    toc.classList.add('is-positioned');

    if (mobileQuery.matches) {
      toc.dataset.openSide = x + width / 2 < window.innerWidth / 2 ? 'right' : 'left';
      toc.dataset.openDown = y < window.innerHeight * .34 ? 'true' : 'false';
    }

    if (persist) {
      try { localStorage.setItem(storageKey(), JSON.stringify({ left: x, top: y })); } catch (_) {}
    }
  };

  const restorePosition = () => {
    toc.classList.remove('is-positioned');
    toc.style.removeProperty('--toc-left');
    toc.style.removeProperty('--toc-top');
    delete toc.dataset.openSide;
    delete toc.dataset.openDown;

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top)) {
        requestAnimationFrame(() => applyPosition(saved.left, saved.top, false));
      }
    } catch (_) {}
  };

  const setResponsiveState = () => {
    toc.open = !mobileQuery.matches;
    restorePosition();
  };

  setResponsiveState();
  setHint();
  window.addEventListener('portfolio-language-change', setHint);

  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', setResponsiveState);
  else mobileQuery.addListener(setResponsiveState);

  let drag = null;
  let suppressClick = false;

  handle.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rect = toc.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
    try { handle.setPointerCapture(event.pointerId); } catch (_) {}
  });

  handle.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    event.preventDefault();
    toc.classList.add('is-dragging');
    applyPosition(drag.left + dx, drag.top + dy);
  }, { passive: false });

  const finishDrag = (event) => {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    if (drag.moved) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 700);
    }
    drag = null;
    toc.classList.remove('is-dragging');
  };

  handle.addEventListener('pointerup', finishDrag);
  handle.addEventListener('pointercancel', finishDrag);
  handle.addEventListener('lostpointercapture', finishDrag);
  handle.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);

  toc.querySelector('nav')?.addEventListener('click', (event) => {
    if (mobileQuery.matches && event.target.closest('a')) toc.open = false;
  });

  window.addEventListener('resize', () => {
    if (!toc.classList.contains('is-positioned')) return;
    const left = parseFloat(toc.style.getPropertyValue('--toc-left'));
    const top = parseFloat(toc.style.getPropertyValue('--toc-top'));
    if (Number.isFinite(left) && Number.isFinite(top)) applyPosition(left, top);
  });
})();
