import { products, menu, composition, euro } from "./catalog.js";
import {
  normalizeCart,
  total,
  createSlots,
  validateRequest,
} from "./commerce-core.js";
import { legal } from "./legal.js";
import { setupMotion, setupSound } from "./motion.js";
import { setupStory } from "./story.js";
const motion = setupMotion();
setupSound();
setupStory();
document.querySelector("#year").textContent = new Date().getFullYear();
const $ = (s) => document.querySelector(s);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let cart = [];
try {
  cart = normalizeCart(JSON.parse(localStorage.getItem("fluffy-cart") || "[]"));
} catch {}
let category = "all",
  allergen = "all",
  service = { enabled: false, slots: createSlots(), business: {} },
  toastTimer;
const focusReturn = new WeakMap();
const requestKeys = new Map();
function notify(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2800);
}
function save() {
  try {
    localStorage.setItem("fluffy-cart", JSON.stringify(cart));
  } catch {}
  renderCart();
}
function renderProducts() {
  const filtered = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (allergen === "all" ||
        (p.allergensVerified && p.freeFrom?.includes(allergen))),
  );
  $("#filter-empty").hidden = !!filtered.length;
  $("#product-grid").innerHTML = filtered
    .map(
      (p) =>
        `<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.alt}" loading="lazy" width="800" height="1000"><span class="product-number">0${products.indexOf(p) + 1} / FLUFFY</span><span class="product-note">${p.note.toUpperCase()}</span><button class="add-circle" data-add="${p.id}" data-cursor="Bestellen" aria-label="${p.name} zum Warenkorb hinzufügen">＋</button></div><div class="product-info"><div class="product-title-line"><h3>${p.name}</h3><span class="price">${euro(p.price)}</span></div><p>${p.description}</p><div class="ingredient-tags" aria-label="Vorläufige Zutatenhinweise">${p.ingredients.map((i) => `<span>${i}</span>`).join("")}<span>Allergenprüfung ausstehend</span></div></div></article>`,
    )
    .join("");
}
function renderCart() {
  const count = cart.reduce((n, r) => n + r.quantity, 0);
  $("#cart-count").textContent = count;
  document
    .querySelector("[data-cart]")
    .setAttribute("aria-label", `Warenkorb öffnen, ${count} Portionen`);
  $("#cart-items").innerHTML = cart.length
    ? cart
        .map((row) => {
          const p = products.find((p) => p.id === row.id);
          return `<div class="cart-item"><img src="${p.image}" alt="${p.alt}" width="75" height="90"><div><h3>${p.name}</h3><p class="price">${euro(p.price * row.quantity)}</p><div class="quantity"><button data-quantity="${p.id}" data-delta="-1" aria-label="Eine Portion ${p.name} weniger">−</button><span aria-label="Anzahl">${row.quantity}</span><button data-quantity="${p.id}" data-delta="1" aria-label="Eine Portion ${p.name} mehr" ${row.quantity >= 12 ? "disabled" : ""}>＋</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="${p.name} entfernen">×</button></div>`;
        })
        .join("")
    : '<div class="empty-cart"><h3>Ein wenig Vorfreude fehlt noch.</h3><p>Entdecken Sie unsere drei Boutique-Kreationen und stellen Sie Ihren Wolkenmoment zusammen.</p><button class="text-link close-dialog">Kreationen entdecken ↗</button></div>';
  $("#cart-summary").innerHTML = cart.length
    ? `<div class="cart-total"><span>Gesamtsumme<small>inkl. MwSt. · Abholung in der Boutique</small></span><strong>${euro(total(cart))}</strong></div>`
    : "";
  $("#checkout-area").hidden = !cart.length;
  $("#clear-cart").hidden = !cart.length;
  $("#order-status").textContent = "";
}
function add(id) {
  $("#cart-receipt").textContent = "";
  const row = cart.find((p) => p.id === id);
  if (row && row.quantity >= 12) {
    notify("Höchstens zwölf Portionen je Kreation.");
    return;
  }
  if (row) row.quantity++;
  else cart.push({ id, quantity: 1 });
  save();
  notify("Zu Ihrer Auswahl hinzugefügt.");
}
function openDialog(dialog) {
  focusReturn.set(dialog, document.activeElement);
  motion.stop();
  dialog.showModal();
}
function closeDialog(dialog) {
  dialog.close();
  if (!document.querySelector("dialog[open]")) {
    motion.start();
    focusReturn.get(dialog)?.focus();
  }
}
async function refreshService() {
  try {
    const response = await fetch("/api/commerce");
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!Array.isArray(data.slots)) throw Error();
    service = data;
  } catch {
    service = { enabled: false, slots: createSlots(), business: {} };
  }
  const options =
    '<option value="">Bitte wählen</option>' +
    service.slots
      .map((s) => `<option value="${esc(s.id)}">${esc(s.label)}</option>`)
      .join("");
  for (const el of [$("#pickup-slot"), $("#reservation-slot")]) {
    const previous = el.value;
    el.innerHTML = options;
    if (service.slots.some((s) => s.id === previous)) el.value = previous;
  }
  document
    .querySelectorAll(".preview-notice,.slot-note")
    .forEach((el) => (el.hidden = service.enabled));
  $(".checkout-submit").innerHTML = service.enabled
    ? "Zahlungspflichtig bestellen"
    : "Bestellübersicht prüfen <span>↗</span>";
  $("#reservation-form button[type=submit]").innerHTML = service.enabled
    ? "Reservierung anfragen <span>↗</span>"
    : "Reservierung prüfen <span>↗</span>";
  if (service.business?.address) {
    $("#boutique-address").textContent = [
      service.business.address,
      service.business.hours,
    ]
      .filter(Boolean)
      .join(" · ");
  }
}
function renderMenu() {
  $("#menu-accordions").innerHTML = menu
    .map(
      (group) =>
        `<details><summary><span>${group.title}</span><span aria-hidden="true">＋</span></summary><div class="menu-items">${group.items.map(([name, description]) => `<div class="menu-item"><h3>${name}</h3>${description ? `<p>${description}</p>` : ""}</div>`).join("")}</div></details>`,
    )
    .join("");
  $("#composition-grid").innerHTML = Object.entries(composition)
    .map(
      ([name, options]) =>
        `<label>${name}<select class="compose-select" aria-label="${name} für die eigene Komposition">${options.map((x) => `<option>${x}</option>`).join("")}</select></label>`,
    )
    .join("");
  updateComposition();
}
function updateComposition() {
  $("#composition-summary").textContent =
    "Ihre Komposition: " +
    [...document.querySelectorAll(".compose-select")]
      .map((x) => x.value)
      .join(" · ");
}
document.addEventListener("click", (event) => {
  const el = event.target.closest("button,a");
  if (!el) return;
  if (el.dataset.add) add(el.dataset.add);
  if (el.dataset.quantity) {
    const row = cart.find((r) => r.id === el.dataset.quantity);
    if (row) {
      row.quantity += Number(el.dataset.delta);
      cart = cart.filter((r) => r.quantity > 0);
      save();
    }
  }
  if (el.dataset.remove) {
    cart = cart.filter((r) => r.id !== el.dataset.remove);
    save();
  }
  if (el.hasAttribute("data-cart")) {
    openDialog($("#cart-dialog"));
    refreshService();
  }
  if (el.hasAttribute("data-reserve")) {
    openDialog($("#reservation-dialog"));
    refreshService();
  }
  if (el.classList.contains("close-dialog")) {
    const dialog = el.closest("dialog");
    if (dialog) closeDialog(dialog);
  }
  if (el.dataset.legal) {
    const page = legal[el.dataset.legal];
    $("#legal-title").textContent = page.title;
    $("#legal-body").innerHTML = page.body;
    openDialog($("#legal-dialog"));
  }
  if (el.dataset.filter) {
    category = el.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((b) => {
      b.classList.toggle("active", b === el);
      b.setAttribute("aria-pressed", String(b === el));
    });
    renderProducts();
  }
});
$("#allergen-filter").addEventListener("change", (e) => {
  allergen = e.target.value;
  renderProducts();
});
$("#clear-cart").addEventListener("click", () => {
  cart = [];
  save();
  try {
    localStorage.removeItem("fluffy-cart");
  } catch {}
});
$("#composition-grid").addEventListener("change", updateComposition);
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("cancel", () => {
    if (document.querySelectorAll("dialog[open]").length <= 1) motion.start();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const b = dialog.getBoundingClientRect();
      if (
        e.clientX < b.left ||
        e.clientX > b.right ||
        e.clientY < b.top ||
        e.clientY > b.bottom
      )
        closeDialog(dialog);
    }
  });
});
async function submit(event, kind) {
  event.preventDefault();
  const form = event.currentTarget,
    status = $(kind === "order" ? "#order-status" : "#reservation-status"),
    button = form.querySelector("[type=submit]");
  status.classList.remove("error");
  const values = new FormData(form);
  const data = {
    kind,
    name: values.get("name"),
    email: values.get("email"),
    consent: values.get("consent") === "on",
    slot: kind === "order" ? $("#pickup-slot").value : values.get("slot"),
    ...(kind === "order"
      ? { items: cart.map((row) => ({ ...row })) }
      : { guests: Number(values.get("guests")) }),
  };
  try {
    const checked = validateRequest(data, service.slots);
    if (!service.enabled) {
      status.textContent =
        kind === "order"
          ? `Ihre Auswahl: ${euro(checked.total)} inkl. MwSt. Die Angaben sind vollständig. Dies ist ausschließlich eine Vorschau; es wurde keine Bestellung übermittelt.`
          : "Ihre Angaben sind vollständig. Dies ist ausschließlich eine Vorschau; es wurde kein Tisch reserviert.";
      return;
    }
    button.disabled = true;
    status.textContent = "Ihre Anfrage wird übermittelt …";
    const fingerprint = JSON.stringify(data);
    if (!requestKeys.has(fingerprint))
      requestKeys.set(fingerprint, crypto.randomUUID());
    const response = await fetch("/api/commerce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": requestKeys.get(fingerprint),
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || result.accepted !== true)
      throw Error(result.error || "Es konnte keine Annahme bestätigt werden.");
    if (kind === "order") {
      cart = [];
      save();
      $("#cart-receipt").textContent =
        "Ihre Bestellung wurde angenommen. Ihre Referenz: " +
        result.reference +
        ".";
    }
    status.textContent = `Ihre ${kind === "order" ? "Bestellung" : "Reservierungsanfrage"} wurde angenommen. Ihre Referenz: ${result.reference}.`;
    form.reset();
  } catch (error) {
    status.classList.add("error");
    status.textContent = error.message || "Bitte prüfen Sie Ihre Angaben.";
  } finally {
    button.disabled = false;
  }
}
$("#checkout-form").addEventListener("submit", (e) => submit(e, "order"));
$("#reservation-form").addEventListener("submit", (e) =>
  submit(e, "reservation"),
);
renderProducts();
renderCart();
renderMenu();
refreshService();
document.addEventListener(
  "invalid",
  (event) => {
    const input = event.target;
    if (!input.matches("input,select")) return;
    input.setCustomValidity(
      input.validity.typeMismatch
        ? "Bitte geben Sie eine gültige E-Mail-Adresse ein."
        : input.type === "checkbox"
          ? "Bitte bestätigen Sie den Hinweis."
          : "Bitte ergänzen Sie dieses Feld vollständig.",
    );
  },
  true,
);
document.addEventListener("input", (event) =>
  event.target.setCustomValidity?.(""),
);
document.addEventListener("change", (event) =>
  event.target.setCustomValidity?.(""),
);
