// script.js
// Footer year
const y = document.getElementById("y");
if (y) y.textContent = new Date().getFullYear();

// Burger menu
const burger = document.querySelector("[data-burger]");
const closeBtn = document.querySelector("[data-burger-close]");
const mnav = document.querySelector("[data-mnav]");

function openMenu() {
  if (!burger || !mnav) return;
  burger.classList.add("is-open");
  burger.setAttribute("aria-expanded", "true");
  mnav.hidden = false;
  document.documentElement.style.overflow = "hidden";
}
function closeMenu() {
  if (!burger || !mnav) return;
  burger.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
  mnav.hidden = true;
  document.documentElement.style.overflow = "";
}

if (burger)
  burger.addEventListener("click", () => {
    const isOpen = burger.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });
if (closeBtn) closeBtn.addEventListener("click", closeMenu);

// close on outside click
document.addEventListener("click", (e) => {
  if (!mnav || mnav.hidden) return;
  const inside = mnav.contains(e.target) || burger.contains(e.target);
  if (!inside) closeMenu();
});
// close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
// close on resize to desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeMenu();
});

// Focus tabs when clicking hero button
const focusTabsBtn = document.querySelector("[data-focus-tabs]");
if (focusTabsBtn) {
  focusTabsBtn.addEventListener("click", () => {
    const tabsSection = document.getElementById("tabs");
    if (tabsSection)
      tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const active = document.querySelector(".panel.is-active");
      if (active) active.focus({ preventScroll: true });
    }, 250);
  });
}

// Tabs logic (keep tabs on mobile, no select)
const tabButtons = [...document.querySelectorAll("[data-tab]")];
const panels = [...document.querySelectorAll(".panel")];

function setActive(id) {
  tabButtons.forEach((btn) => {
    const on = btn.dataset.tab === id;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  panels.forEach((p) => p.classList.toggle("is-active", p.id === id));
}

tabButtons.forEach((btn) =>
  btn.addEventListener("click", () => setActive(btn.dataset.tab))
);

// Keyboard nav (left/right)
const tablist = document.querySelector(".tabs__nav");
if (tablist) {
  tablist.addEventListener("keydown", (e) => {
    const currentIndex = tabButtons.findIndex((t) =>
      t.classList.contains("is-active")
    );
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight")
      nextIndex = (currentIndex + 1) % tabButtons.length;
    if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const next = tabButtons[nextIndex];
      setActive(next.dataset.tab);
      next.focus();
      next.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  });
}

// Lead form -> Telegram deep-link
const TG_USERNAME = "username"; // TODO: replace
const form = document.getElementById("leadForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.getElementById("name").value || "").trim();
    const phone = (document.getElementById("phone").value || "").trim();
    const msg = (document.getElementById("msg").value || "").trim();

    const lines = [];
    lines.push("Запрос по строительному контролю / технадзору");
    if (name) lines.push("Имя: " + name);
    if (phone) lines.push("Телефон: " + phone);
    if (msg) lines.push("Задача: " + msg);
    lines.push("—");
    lines.push("Прошу подсказать формат участия.");

    const text = encodeURIComponent(lines.join("\n"));
    window.open(
      `https://t.me/${TG_USERNAME}?text=${text}`,
      "_blank",
      "noopener"
    );
  });
}
