import { createHmac } from "node:crypto";
import { createSlots, validateRequest } from "../src/commerce-core.js";
import { products } from "../src/catalog.js";
const validUrl = (value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const env = process.env;
  const configured =
    env.COMMERCE_ENABLED === "true" &&
    env.LEGAL_APPROVED === "true" &&
    env.ALLERGENS_VERIFIED === "true" &&
    validUrl(env.COMMERCE_WEBHOOK_URL) &&
    validUrl(env.AVAILABILITY_URL) &&
    env.COMMERCE_WEBHOOK_SECRET &&
    env.BUSINESS_NAME &&
    env.BUSINESS_ADDRESS &&
    env.BUSINESS_EMAIL &&
    env.SITE_ORIGIN;
  let slots = [];
  try {
    if (configured) {
      const upstream = await fetch(env.AVAILABILITY_URL, {
        headers: { Authorization: `Bearer ${env.COMMERCE_WEBHOOK_SECRET}` },
        signal: AbortSignal.timeout(6000),
      });
      if (!upstream.ok) throw Error();
      const result = await upstream.json();
      const possible = new Set(
        createSlots(new Date(), { open: 0, close: 24, closedDays: [] }).map(
          (s) => s.id,
        ),
      );
      slots = (result.slots || [])
        .filter(
          (s) =>
            typeof s.label === "string" &&
            s.label.length < 100 &&
            possible.has(s.id),
        )
        .slice(0, 500);
    }
    if (req.method === "GET") {
      return res
        .status(200)
        .json({
          enabled: !!configured,
          mode: configured ? "live" : "preview",
          slots: configured ? slots : createSlots(),
          business: {
            name: env.BUSINESS_NAME || "",
            address: env.BUSINESS_ADDRESS || "",
            email: env.BUSINESS_EMAIL || "",
            hours: env.BUSINESS_HOURS || "",
          },
        });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res
        .status(405)
        .json({ error: "Diese Anfrage ist nicht möglich." });
    }
    if (!configured)
      return res
        .status(503)
        .json({
          error:
            "Die Online-Bestellung und Reservierung sind noch nicht freigeschaltet. Es wurde nichts übermittelt.",
        });
    if (req.headers.origin !== env.SITE_ORIGIN)
      return res
        .status(403)
        .json({ error: "Diese Anfrage ist nicht zulässig." });
    if (!String(req.headers["content-type"] || "").includes("application/json"))
      return res.status(415).json({ error: "Das Anfrageformat ist ungültig." });
    if (Number(req.headers["content-length"] || 0) > 10000)
      return res.status(413).json({ error: "Die Anfrage ist zu umfangreich." });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (JSON.stringify(body).length > 10000)
      return res.status(413).json({ error: "Die Anfrage ist zu umfangreich." });
    const data = validateRequest(body, slots),
      key = String(req.headers["idempotency-key"] || "");
    if (!/^[a-f0-9-]{36}$/.test(key))
      return res
        .status(400)
        .json({ error: "Bitte laden Sie den Bestellschritt erneut." });
    const payload = JSON.stringify({
      ...data,
      idempotencyKey: key,
      items: data.items?.map((row) => ({
        ...row,
        name: products.find((p) => p.id === row.id).name,
        unitPrice: products.find((p) => p.id === row.id).price,
      })),
    });
    const timestamp = String(Date.now()),
      signature = createHmac("sha256", env.COMMERCE_WEBHOOK_SECRET)
        .update(`${timestamp}.${payload}`)
        .digest("hex");
    const response = await fetch(env.COMMERCE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": key,
        "X-Fluffy-Timestamp": timestamp,
        "X-Fluffy-Signature": signature,
      },
      body: payload,
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok)
      throw Error(
        "Die Annahme konnte nicht bestätigt werden. Bitte versuchen Sie es später erneut.",
      );
    const receipt = await response.json();
    if (
      receipt.accepted !== true ||
      !/^[-\w]{3,64}$/.test(receipt.reference || "")
    )
      throw Error(
        "Es liegt noch keine bestätigte Annahme vor. Bitte kontaktieren Sie die Boutique.",
      );
    return res
      .status(200)
      .json({ accepted: true, reference: receipt.reference });
  } catch (error) {
    return res
      .status(400)
      .json({
        error:
          error.message &&
          error.message.length < 200 &&
          !/fetch|JSON|URL|abort/i.test(error.message)
            ? error.message
            : "Die Verfügbarkeit konnte nicht geprüft werden. Es wurde keine Annahme bestätigt.",
      });
  }
}
