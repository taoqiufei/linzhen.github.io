(() => {
  const buttons = [...document.querySelectorAll('[data-language-button]')];
  if (!buttons.length) return;

  const localized = [...document.querySelectorAll('[data-language-content]')];
  const labels = [...document.querySelectorAll('[data-aria-zh], [data-aria-en]')];
  const applyLanguage = (language, updateUrl = true) => {
    const selected = language === 'en' ? 'en' : 'zh';
    document.documentElement.lang = selected === 'en' ? 'en' : 'zh-CN';

    localized.forEach((element) => {
      element.hidden = element.dataset.languageContent !== selected;
    });
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.languageButton === selected));
    });
    labels.forEach((element) => {
      const value = element.dataset[selected === 'en' ? 'ariaEn' : 'ariaZh'];
      if (value) element.setAttribute('aria-label', value);
    });

    try {
      localStorage.setItem('portfolio-language', selected);
    } catch (_) {}

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', selected);
      window.history.replaceState(window.history.state, '', url);
    }

    window.dispatchEvent(new CustomEvent('portfolio-language-change', {
      detail: { language: selected }
    }));
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.languageButton));
  });

  const requested = new URLSearchParams(window.location.search).get('lang');
  let remembered = 'zh';
  try {
    remembered = localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'zh';
  } catch (_) {}
  applyLanguage(requested === 'en' || requested === 'zh' ? requested : remembered, false);
})();
