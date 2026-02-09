(() => {
  const menu = document.querySelector("[data-menu]");
  const overlay = document.querySelector("[data-overlay]");
  const btnOpen = document.querySelector("[data-menu-open]");
  const btnClose = document.querySelector("[data-menu-close]");
  const menuLinks = document.querySelectorAll("[data-menu-link]");
  const year = document.querySelector("[data-year]");

  if (year) year.textContent = String(new Date().getFullYear());

  // Compact header on scroll (switch when hero ends)
  const smart = document.querySelector("[data-smart]");
  const hero = document.querySelector(".smart__hero");

  const onScroll = () => {
    if (!smart || !hero) return;

    const y = window.scrollY;

    const heroTop = hero.offsetTop;
    const heroH = hero.offsetHeight;
    const heroEnd = heroTop + heroH;

    // Фаза 1: начать гасить контент, когда прошли ~25% hero
    const fadeStart = heroTop + Math.round(heroH * 0.05);
    const fadeEnd = heroTop + Math.round(heroH * 0.3); // к этому моменту почти исчезло

    smart.classList.toggle("is-fading", y >= fadeStart);

    // Фаза 2: compact когда hero практически закончился
    smart.classList.toggle("is-compact", y >= heroEnd - 80);

    // Дополнительно: прогресс затухания (0..1) для идеального контроля
    const tRaw = (y - fadeStart) / Math.max(1, fadeEnd - fadeStart);
    const t = Math.min(1, Math.max(0, tRaw));
    smart.style.setProperty("--fade", String(t));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  // btnOpen.classList.add("is-open");
  // btnOpen.classList.remove("is-open");

  // Menu helpers
  const openMenu = () => {
    if (!menu || !overlay || !btnOpen) return;

    // показать элементы (без hidden)
    menu.hidden = false;
    overlay.hidden = false;

    // next frame — чтобы transition сработал
    requestAnimationFrame(() => {
      menu.classList.add("is-open");
      overlay.classList.add("is-open");
    });

    btnOpen.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  };

  const closeMenu = () => {
    if (!menu || !overlay || !btnOpen) return;

    // запускаем анимацию закрытия
    menu.classList.remove("is-open");
    overlay.classList.remove("is-open");

    btnOpen.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";

    // после окончания transition — прячем через hidden
    const dur = 340; // чуть больше чем .32s
    window.setTimeout(() => {
      menu.hidden = true;
      overlay.hidden = true;
    }, dur);
  };

  btnOpen?.addEventListener("click", openMenu);
  btnClose?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);

  menuLinks.forEach((a) => a.addEventListener("click", closeMenu));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener(
    "resize",
    () => {
      if (!menu?.hidden) closeMenu();
    },
    { passive: true }
  );

  const yearsEl = document.querySelector("[data-years]");
  const expEl = document.querySelector("[data-experience]");

  const startYear = 2007;
  const currentYear = new Date().getFullYear();
  const experience = currentYear - startYear;

  if (yearsEl) {
    yearsEl.textContent = `${startYear}–${currentYear}`;
  }

  if (expEl) {
    expEl.textContent = `${experience} ${declension(experience, [
      "год",
      "года",
      "лет",
    ])} в интересах заказчика`;
  }

  // правильное склонение
  function declension(n, forms) {
    return forms[
      n % 100 > 4 && n % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][Math.min(n % 10, 5)]
    ];
  }

  // Timeline reveal + progress
  (() => {
    const tl = document.querySelector("[data-timeline]");
    if (!tl) return;

    const steps = Array.from(tl.querySelectorAll("[data-step]"));
    if (!steps.length) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // reveal
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-in");
        });
      },
      { root: null, threshold: 0.18 }
    );

    if (!prefersReduced) steps.forEach((s) => io.observe(s));
    else steps.forEach((s) => s.classList.add("is-in"));

    // progress + active step
    const update = () => {
      const rect = tl.getBoundingClientRect();

      // если далеко вне экрана — ничего не считаем
      const out = rect.bottom < -200 || rect.top > window.innerHeight + 200;
      if (out) return;

      const first = steps[0].getBoundingClientRect();
      const last = steps[steps.length - 1].getBoundingClientRect();

      const lineTop = first.top;
      const lineBottom = last.bottom;

      const cursor = window.innerHeight * 0.35;

      const progress = Math.max(
        0,
        Math.min(lineBottom - lineTop, cursor - lineTop)
      );

      tl.style.setProperty("--tl-progress", `${progress}px`);

      let best = null;
      let bestDist = Infinity;

      steps.forEach((s) => {
        const r = s.getBoundingClientRect();
        const mid = (r.top + r.bottom) / 2;
        const d = Math.abs(mid - cursor);
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      });

      steps.forEach((s) => s.classList.toggle("is-active", s === best));
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  })();
})();

const animatedElements = document.querySelectorAll(
  ".section, .section__head, .card"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // SECTION / HEAD — просто показываем
      if (
        el.classList.contains("section") ||
        el.classList.contains("section__head")
      ) {
        el.classList.add("is-visible");
        observer.unobserve(el);
        return;
      }

      // CARD — каскад внутри текущей секции
      if (el.classList.contains("card")) {
        const section = el.closest(".section");
        const cards = section
          ? Array.from(section.querySelectorAll(".card"))
          : [el];

        // если у секции есть карточки — показываем их по очереди
        cards.forEach((card, i) => {
          // базовый шаг задержки
          const step = 0.06; // 60ms
          // небольшая стартовая пауза, чтобы head успел проявиться
          const base = 0.05; // 50ms

          card.style.setProperty("--delay", `${base + i * step}s`);
          card.classList.add("is-visible");
          observer.unobserve(card);
        });

        return;
      }
    });
  },
  {
    threshold: 0.18,
  }
);

animatedElements.forEach((el) => observer.observe(el));

(() => {
  const btn = document.querySelector("[data-totop]");
  if (!btn) return;

  const showAfter = Math.round(window.innerHeight * 0.7);

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const shouldShow = y > showAfter;

    btn.hidden = !shouldShow;
    btn.classList.toggle("is-visible", shouldShow);
  };

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });

  update();
})();
