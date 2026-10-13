export const products = [
  {
    id: "klassisch",
    name: "Klassische Wolke",
    note: "Unsere Signatur",
    description:
      "Drei goldene Soufflé-Pancakes, Hokkaido-Butter und reiner Ahornsirup.",
    price: 1450,
    image: "/assets/poster.webp",
    alt: "Goldene Soufflé-Pancakes mit Butter und Ahornsirup",
    category: "signatur",
    ingredients: ["Weizen", "Ei", "Milch"],
    allergensVerified: false,
  },
  {
    id: "matcha",
    name: "Uji Matcha Traum",
    note: "Die grüne Poesie",
    description:
      "Zeremonieller Bio-Matcha trifft auf eine zarte Creme aus weißer Schokolade.",
    price: 1600,
    image: "/assets/matcha-photo.webp",
    alt: "Soufflé-Pancakes mit Uji-Matcha und weißer Schokoladencreme",
    category: "matcha",
    ingredients: ["Weizen", "Ei", "Milch"],
    allergensVerified: false,
  },
  {
    id: "karamell",
    name: "Karamell & Butter",
    note: "Die Gourmet-Edition",
    description:
      "Goldene Soufflé-Pancakes, langsam schmelzende Butter und ein glänzendes Band aus Karamell.",
    price: 1850,
    image: "/assets/caramel.webp",
    alt: "Goldene Soufflé-Pancakes mit Butter und bernsteinfarbenem Guss",
    category: "edition",
    ingredients: ["Weizen", "Ei", "Milch"],
    allergensVerified: false,
  },
];
export const menu = [
  {
    title: "Unsere Soufflé-Klassiker",
    items: [
      [
        "Fluffy Klassik",
        "Japanischer Soufflé-Pancake mit Sahne und Ahornsirup.",
      ],
      ["Erdbeere", "Frische Erdbeeren, Sahne und Erdbeersauce."],
      ["Banane & Nutella", "Banane, Nutella, Sahne und Schokoladensauce."],
      ["Matcha & rote Bohne", "Matcha-Creme, rote Bohnen und Matcha-Sauce."],
      ["Mango & Kokos", "Frische Mango, Kokos und ein cremiges Topping."],
      ["Raffaello", "Kokos, weiße Schokolade, Raffaello und Sahne."],
      [
        "Pistazie & weiße Schokolade",
        "Pistaziencreme, weiße Schokolade und Pistazien.",
      ],
      ["Kinder-Schokolade", "Kinder-Schokolade, Schokoladensauce und Sahne."],
      ["Lotus Biscoff", "Lotus-Creme, Lotus Biscoff und Karamellsauce."],
      ["Oreo", "Oreo-Kekse, Schokolade und Sahne."],
      ["Schokolade & Haselnuss", "Schokoladen-Haselnuss-Creme und Haselnüsse."],
      ["Vanille", "Vanillecreme, Vanillesauce und Puderzucker."],
    ],
  },
  {
    title: "Frucht & besondere Kreationen",
    items: [
      ["Erdbeertraum", "Erdbeeren, Sahne, Erdbeersauce und weiße Schokolade."],
      [
        "Mango & Passionsfrucht",
        "Mango, Passionsfrucht und ein cremiges Topping.",
      ],
      [
        "Beerenkomposition",
        "Erdbeeren, Heidelbeeren, Himbeeren und Beerensauce.",
      ],
      ["Pistazien-Auslese", "Pistaziencreme, Pistazien und weiße Schokolade."],
      [
        "Dubai-Schokolade",
        "Pistaziencreme, knuspriges Kadayif und Schokolade.",
      ],
      ["Matcha-Auslese", "Matcha-Creme, weiße Schokolade und Matcha-Topping."],
    ],
  },
  {
    title: "Pancake & Eis",
    items: ["Vanille", "Schokolade", "Matcha", "Erdbeere", "Keks & Sahne"].map(
      (x) => [x, ""],
    ),
  },
  {
    title: "Japanische Desserts",
    items: [
      "Japanischer Soufflé-Pancake",
      "Mochi",
      "Matcha-Tiramisu",
      "Japanischer Käsekuchen",
      "Dorayaki",
    ].map((x) => [x, ""]),
  },
  {
    title: "Kalte Getränke",
    items: [
      "Matcha Latte",
      "Matcha auf Eis",
      "Erdbeer-Matcha",
      "Mango-Matcha",
      "Japanischer Milchtee",
      "Bubble Tea",
      "Kaffee auf Eis",
      "Japanische Limonade",
    ].map((x) => [x, ""]),
  },
  {
    title: "Warme Getränke",
    items: [
      "Espresso",
      "Cappuccino",
      "Latte Macchiato",
      "Matcha Latte",
      "Heiße Schokolade",
      "Japanischer Grüntee",
    ].map((x) => [x, ""]),
  },
];
export const composition = {
  Pancake: ["Klassisch", "Matcha", "Schokolade"],
  Sauce: [
    "Nutella",
    "Pistazie",
    "Weiße Schokolade",
    "Lotus",
    "Schokolade",
    "Erdbeere",
    "Mango",
  ],
  Früchte: ["Erdbeere", "Banane", "Mango", "Heidelbeere", "Himbeere"],
  Creme: ["Vanille", "Erdbeere", "Matcha", "Sahne"],
  Eis: ["Vanille", "Schokolade", "Matcha", "Erdbeere", "Keks & Sahne"],
  Topping: [
    "Oreo",
    "Kinder",
    "Lotus",
    "Raffaello",
    "Schokoladenstückchen",
    "Kokos",
    "Pistazien",
    "Rote Bohne",
  ],
};
export const extras = [
  "Dubai-Schokolade",
  "Extra Pistazie",
  "Frische Beeren",
  "Mochi",
  "Extra Eis",
  "Extra Sauce",
];
export const euro = (value) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    value / 100,
  );
