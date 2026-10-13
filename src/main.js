import { productMarkup, menuMarkup } from './render-catalog.js';
import { products, composition } from './catalog.js';
import { legal } from './legal.js';
import { setupMotion, setupSound } from './motion.js';
import { setupStory } from './story.js';
const motion = setupMotion(); setupSound(); setupStory();
const $ = s => document.querySelector(s);
$('#year').textContent = new Date().getFullYear();
let category = 'all', allergen = 'all';
let returnFocus;
function renderProducts() {
  const filtered = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (allergen === "all" ||
        (p.allergensVerified && p.freeFrom?.includes(allergen))),
  );
  $("#filter-empty").hidden = !!filtered.length;
  $("#product-grid").innerHTML = productMarkup(filtered);
}

function renderMenu() {
  $("#menu-accordions").innerHTML = menuMarkup();
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

document.addEventListener('click', event => {
  const el = event.target.closest('button,a'); if (!el) return;
  if (el.dataset.legal) {
    event.preventDefault();
    const page = legal[el.dataset.legal]; if (!page) return;
    returnFocus = el; $('#legal-title').textContent = page.title;
    $('#legal-body').innerHTML = page.body;
    motion.stop(); $('#legal-dialog').showModal();
  }
  if (el.classList.contains('close-dialog')) $('#legal-dialog').close();
  if (el.dataset.filter) {
    category = el.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => {
      b.classList.toggle('active', b === el); b.setAttribute('aria-pressed', String(b === el));
    }); renderProducts();
  }
});
$('#legal-dialog').addEventListener('close', () => { motion.start(); returnFocus?.focus(); });
$('#legal-dialog').addEventListener('click', e => {
  if (e.target !== e.currentTarget) return;
  const b = e.currentTarget.getBoundingClientRect();
  if(e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) e.currentTarget.close();
});
$('#allergen-filter').addEventListener('change', e => { allergen = e.target.value; renderProducts(); });
$('#composition-grid').addEventListener('change', updateComposition);
renderProducts(); renderMenu();
