import {products, menu, euro} from './catalog.js';
export function productMarkup(filtered = products) {
  return filtered
    .map(
      (p) =>
        `<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.alt}" loading="lazy" width="800" height="1000"><span class="product-number">0${products.indexOf(p) + 1} / FLUFFY</span><span class="product-note">${p.note.toUpperCase()}</span></div><div class="product-info"><div class="product-title-line"><h3>${p.name}</h3><span class="price">${euro(p.price)}</span></div><p>${p.description}</p><div class="ingredient-tags" aria-label="Vorläufige Zutatenhinweise">${p.ingredients.map((i) => `<span>${i}</span>`).join("")}<span>Allergenprüfung ausstehend</span></div></div></article>`,
    )
    .join("");
}
export function menuMarkup() {
  return menu
    .map(
      (group) =>
        `<details><summary><span>${group.title}</span><span aria-hidden="true">＋</span></summary><div class="menu-items">${group.items.map(([name, description]) => `<div class="menu-item"><h3>${name}</h3>${description ? `<p>${description}</p>` : ""}</div>`).join("")}</div></details>`,
    )
    .join("");

}
