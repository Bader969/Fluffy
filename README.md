# Fluffy — Japanische Soufflé-Pâtisserie

Deutschsprachige Boutique mit filmischer Scroll-Erzählung, Produktauswahl, Warenkorb, Abholzeitfenstern und Reservierungsoberfläche. Vite, modulare JavaScript-Dateien, Lenis, GSAP und SplitType. Schriften werden lokal ausgeliefert.

## Lokal starten

```sh
npm install
npm run dev
```

`npm test` prüft Preise, Warenkorb, Zeitfenster und Bestellvalidierung. `npm run build` erzeugt `dist/`. Die lokale API liefert ausdrücklich eine Vorschau und nimmt keine Bestellungen an.

## Auf Vercel veröffentlichen

1. Das GitHub-Repository `Bader969/Fluffy` in Vercel importieren.
2. Framework: Vite. Build: `npm run build`. Ausgabe: `dist`. Stammverzeichnis: Repository-Wurzel. Die Einstellungen sind in `vercel.json` hinterlegt.
3. Ohne Umgebungsvariablen bleiben Warenkorb und Reservierung eine deutlich gekennzeichnete Vorschau.
4. Vor dem Geschäftsbetrieb Betreiber- und Kontaktdaten, Öffnungszeiten, vollständige Allergenmatrix und die tatsächlichen Rechtstexte ergänzen. Danach die Bestellannahme anschließen und mit einer Testbestellung prüfen.

Eine Auszeichnung durch Awwwards ist kein zugesicherter Bestandteil. Das Design folgt dem gewünschten hohen gestalterischen Anspruch.

## Inhalte bearbeiten

- `src/catalog.js`: Boutique-Kreationen, Cent-Preise, deutsch übernommene PDF-Speisekarte und individuelle Kombinationen. Drei Preise wurden vom Auftraggeber vorgegeben. Die dritte Kreation wurde auf Wunsch zu **Karamell & Butter** geändert; der freigegebene Preis von 18,50 € bleibt erhalten.
- `index.html`: Haupttexte, Navigation, Formulare und Struktur.
- `src/style.css`: Reispapier-, Keramik-, Sumi-, Bernstein-, Matcha- und Goldtöne; responsive Gestaltung.
- `src/story.js`: gepinnte Filmsequenz, Rückwärtsscrollen, Pausensteuerung, begrenzter Bildspeicher, kleinere Mobilsequenz.
- `src/motion.js`: Lenis/GSAP-Synchronisierung, SplitType, Magneteffekte und freiwillig aktivierte synthetische Klangkulisse. Kein Audio startet automatisch.
- `src/main.js`: Warenkorb, Filter, Formulare und Vorschauzustände.
- `src/legal.js`: klar als unvollständig bezeichnete Rechtstexte. **Vor dem öffentlichen Geschäftsbetrieb ersetzen und prüfen lassen.**
- `public/style-tile.html`: deutsche Stilvorlage.
- `api/commerce.js`: Vercel-Funktion zur serverseitigen Preisprüfung und bestätigten Weitergabe an ein angeschlossenes Annahmesystem.

## Bestellannahme anschließen

Alle Variablen aus `.env.example` werden in Vercel hinterlegt. Geheimnisse nicht ins Repository schreiben. `COMMERCE_ENABLED`, `LEGAL_APPROVED` und `ALLERGENS_VERIFIED` bleiben zunächst `false`. Die Flags ersetzen keine tatsächliche Prüfung: Rechtstexte, Betriebsdaten und `allergensVerified`/`freeFrom` im Katalog müssen vorher sachlich ergänzt werden. Vorgesehene Zahlungsart ist Zahlung bei Abholung; es wurde kein Zahlungsanbieter ausgewählt und keine Zahlung integriert.

`AVAILABILITY_URL` ist ein HTTPS-Endpunkt des Annahmesystems. Er bekommt `Authorization: Bearer <COMMERCE_WEBHOOK_SECRET>` und muss echte freie Zeitfenster zurückgeben:

```json
{"slots":[{"id":"2026-10-13T14:30","label":"Morgen, 14:30 – 14:45 Uhr"}]}
```

Die Beispielwerte sind keine bestätigten Öffnungszeiten. Zeiten beziehen sich auf Europe/Berlin, liegen innerhalb der nächsten sieben Tage und mindestens 45 Minuten in der Zukunft. Der Empfänger muss Kapazitäten für Abholung und Reservierung verbindlich prüfen.

`COMMERCE_WEBHOOK_URL` erhält die serverseitig geprüfte Bestellung oder Reservierung als JSON. Pflicht: dauerhafte Speicherung, atomare Kapazitätsprüfung, Schutz vor Spam, HMAC-Prüfung und dauerhafte Deduplizierung anhand von `Idempotency-Key`. Nur nach gesicherter Annahme darf er mit folgendem JSON antworten:

```json
{"accepted":true,"reference":"FLUFFY-12345"}
```

Signatur: hex-kodierter HMAC-SHA256 über `X-Fluffy-Timestamp + '.' + unveränderter JSON-Body`, mit `COMMERCE_WEBHOOK_SECRET`. Alte Zeitstempel ablehnen. Reservierungsanfragen und Bestellungen enthalten Namen, E-Mail und Slot; Bestellungen zusätzlich serverseitig berechnete Positionen und Gesamtpreis. Preise aus dem Browser werden ignoriert. Keine Kundendaten werden auf der Website in Logs geschrieben. Eine fehlende oder ungültige Bestätigung wird niemals als Erfolg angezeigt.

Das Annahmesystem ist eine noch einzurichtende externe Abhängigkeit. Es gibt keine versteckte lokale Schein-Datenbank und keine vorgetäuschte Buchung.

## Medien und Grenzen

Die ursprüngliche Pancake-Aufnahme und das Logo stammen aus Higgsfield. Der vorhandene Film wurde mit Kling 3.0 Omni Edit bearbeitet. Verifizierte Ausgabe: **3848 × 2152 Pixel, 24 fps, 15,04 Sekunden**. „8K“ und „120 fps“ aus dem Kreativbrief wurden nicht erreicht. Der Film zeigt eine Makrofahrt mit Café-Abschluss; das gewünschte einzelne Aufsetzen der drei Pancakes wurde vom Modell nicht korrekt umgesetzt. Eine gezielte Korrektur wurde durch das Tageslimit abgewiesen und bleibt offen. Der Einstieg beginnt bei Bild 48, damit die zunächst schwebende Gesamtformation nicht gezeigt wird.

Der Originalmaster bleibt lokal in `.local-assets/stacking-master.mp4`; optimierte Desktop- und Mobilbilder liegen im Repository. `node scripts/prepare-stacking.mjs` erzeugt 24 Bilder pro Sekunde in einem frischen Zielordner und prüft die Vollständigkeit. Der Desktop lädt höchstens drei Bilder gleichzeitig und hält etwa 90 MiB dekodierte Bilder im Cache. Originalmaster werden nicht für jeden Seitenbesuch heruntergeladen.

Das zusätzliche Matcha-Foto wurde vom Higgsfield-Tageslimit abgewiesen. Die Matcha-Kreation nutzt deshalb eine eigens erstellte SVG-Illustration; alle Produktbilder sind als Serviervorschläge gekennzeichnet. Die nicht mehr gewünschte Trüffelaufnahme ist nicht Bestandteil der Website. Die Café-Aufnahme ist eine atmosphärische Visualisierung, kein Foto einer bestätigten Geschäftsadresse.

Die bereitgestellte PDF enthält 18 Pancake-Varianten, individuelle Kombinationen, Desserts und Getränke, aber keine Preise und keine vollständige Allergenmatrix. Produkte ohne bestätigte Allergenangaben werden nicht als „ohne Gluten“ oder „ohne Milch“ ausgegeben.

## Technische Referenzen

- Lenis/GSAP-Anbindung: https://github.com/darkroomengineering/lenis
- Vercel Functions: https://vercel.com/docs/functions
- Anbieterangaben: https://www.gesetze-im-internet.de/ddg/__5.html
- Bestellsituation: https://www.gesetze-im-internet.de/bgb/__312j.html

Die Rechtstexte sind ohne die tatsächlichen Betriebsdaten nicht veröffentlichungsfertig.
