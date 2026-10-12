import { products } from "./catalog.js";
export function normalizeCart(items) {
  if (!Array.isArray(items) || items.length > 30)
    throw new Error("Die Auswahl ist ungültig.");
  const result = new Map();
  for (const item of items) {
    if (
      !products.some((p) => p.id === item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 12
    )
      throw new Error("Bitte prüfen Sie Ihre Produktauswahl.");
    result.set(item.id, (result.get(item.id) || 0) + item.quantity);
  }
  const rows = [...result].map(([id, quantity]) => {
    if (quantity > 12)
      throw new Error("Pro Kreation sind höchstens zwölf Portionen möglich.");
    return { id, quantity };
  });
  return rows;
}
export function total(items) {
  return normalizeCart(items).reduce(
    (sum, row) =>
      sum + products.find((p) => p.id === row.id).price * row.quantity,
    0,
  );
}
export function berlinParts(now = new Date()) {
  const pieces = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  return {
    date: `${pieces.year}-${pieces.month}-${pieces.day}`,
    minutes: Number(pieces.hour) * 60 + Number(pieces.minute),
  };
}
export function createSlots(
  now = new Date(),
  hours = { open: 11, close: 19, closedDays: [] },
) {
  const local = berlinParts(now),
    slots = [];
  for (let d = 0; d < 7; d++) {
    const day = new Date(`${local.date}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + d);
    const date = day.toISOString().slice(0, 10);
    if (hours.closedDays.includes(day.getUTCDay())) continue;
    for (let min = hours.open * 60; min + 15 <= hours.close * 60; min += 15) {
      if (d === 0 && min < local.minutes + 45) continue;
      const time = (n) =>
        `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
      const label =
        d === 0
          ? "Heute"
          : d === 1
            ? "Morgen"
            : new Intl.DateTimeFormat("de-DE", {
                timeZone: "Europe/Berlin",
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
              }).format(day);
      slots.push({
        id: `${date}T${time(min)}`,
        label: `${label}, ${time(min)} – ${time(min + 15)} Uhr`,
      });
    }
  }
  return slots;
}
export function validateRequest(body, slots) {
  if (!body || !["order", "reservation"].includes(body.kind))
    throw new Error("Die Anfrage ist ungültig.");
  if (!slots.some((s) => s.id === body.slot))
    throw new Error("Bitte wählen Sie ein aktuelles Zeitfenster.");
  const name = String(body.name || "").trim(),
    email = String(body.email || "").trim();
  if (
    name.length < 2 ||
    name.length > 100 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 254
  )
    throw new Error(
      "Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse an.",
    );
  if (body.consent !== true)
    throw new Error("Bitte bestätigen Sie den Datenschutzhinweis.");
  const base = { kind: body.kind, name, email, slot: body.slot, consent: true };
  if (body.kind === "reservation") {
    if (!Number.isInteger(body.guests) || body.guests < 1 || body.guests > 8)
      throw new Error(
        "Reservierungen sind für eine bis acht Personen möglich.",
      );
    return { ...base, guests: body.guests };
  }
  const items = normalizeCart(body.items);
  if (!items.length) throw new Error("Ihr Warenkorb ist noch leer.");
  return {
    ...base,
    items,
    total: total(items),
    currency: "EUR",
    payment: "bei_abholung",
  };
}
