# Fluffy — Marken-MVP

Deutschsprachige Marken- und Speisekarten-Website mit scrollgesteuertem Pancake-Film. **Keine Bestellannahme, kein Warenkorb und keine Reservierung.** Diese Ausrichtung wurde für den ersten MVP ausdrücklich gewählt.

## Start, Prüfung und Vercel

```sh
npm ci
npm test
npm run build
npm run preview
```

Vercel: Repository `Bader969/Fluffy`, Branch `main`, Framework **Vite**, Build `npm run build`, Ausgabe `dist`. Keine Umgebungsvariablen oder externen Dienste nötig. Die aktuelle Domain ist `https://fluffy-chi.vercel.app/`; bei einem Domainwechsel Canonical-/Open-Graph-Tags, Sitemap und robots.txt anpassen.

`npm run dev` startet die Entwicklung auf Port 5173. `npm run preview` prüft den tatsächlichen Build auf Port 4173.

## Was der MVP enthält

- Editoriales Japandi-Design, lokal ausgelieferte Schriften, Absätze mit 17–20 px, lesbare Beschriftungen und Bedienelemente.
- Drei freigegebene Boutique-Kreationen: Klassische Wolke (14,50 €), Uji Matcha Traum (16,00 €), Karamell & Butter (18,50 €). Kein Trüffelprodukt.
- Weitere Speisekarte aus der bereitgestellten PDF, ohne erfundene Preise. Produktkarten und Speisekarte werden als HTML vorgerendert und sind auch ohne JavaScript lesbar.
- Filter und Kompositionsvorschläge; noch nicht bestätigte Allergene werden niemals als allergenfrei ausgewiesen.
- Pause, Geschichte überspringen, reduzierte Bewegung, Tastaturbedienung und freiwillige synthetische Klangkulisse.
- Impressum, Datenschutz und Allergenhinweise mit eigenen HTML-Adressen; mit JavaScript zusätzlich als Dialog.
- Keine Kundendatenformulare, keine Analytics, kein neuer Local-Storage-Warenkorb. Die frühere Commerce-API antwortet dauerhaft mit HTTP 410.

## Vor einem rechtlich vollständigen öffentlichen Betrieb offen

**Betreiber/Firmierung, ladungsfähige Anschrift und Kontakt-E-Mail fehlen.** Gegebenenfalls Registerdaten/USt-ID ergänzen. `src/legal.js` enthält ausdrücklich unvollständige Hinweise; diese müssen anhand der echten Betriebs- und Hostingdaten vervollständigt werden. Auch Adresse/Öffnungszeiten in `index.html` und die bestätigte Allergenmatrix fehlen. Technische Deploybarkeit bedeutet nicht, dass diese fehlenden Angaben ersetzt wurden.

## Scroll-Film: Version 2

Die frühere Lösung lud 361 einzelne WebP-Bilder während des Scrollens nach und hielt nur einen kleinen Ausschnitt im dekodierten Cache. Bei CDN-Latenz führte das zu fehlenden Zwischenbildern und stockender Wiedergabe.

Die neue Lösung lädt **eine vollständige H.264-Datei** vor der Freigabe der Animation (Desktop etwa 7,5 MB / Mobile etwa 5,4 MB). Jedes Bild ist ein unabhängig dekodierbares Keyframe. Scrollziele werden zusammengeführt; es läuft höchstens ein Seek gleichzeitig. Ein kurzer, zeitbasierter Übergang glättet schnelle Richtungswechsel. Während des Scrollens gibt es keine weiteren Medienanfragen. Bei Fehlern, Datensparmodus oder reduzierter Bewegung bleibt ein lesbarer statischer Einstieg.

`src/story.js` steuert Wiedergabe und Lebenszyklus; `src/story-timing.js` enthält die geprüfte Zeitabbildung. Das Video wird stumm und inline dargestellt. Der Master stammt aus Higgsfield: 3848 × 2152 Pixel, 24 fps. Für zuverlässige Browserwiedergabe werden 1280 bzw. 960 Pixel breite Versionen ausgeliefert. Die ersten zwei Sekunden mit einem schwebenden Stapel sind entfernt. Die Original-Makrofahrt endet im Café; das separate Aufsetzen einzelner Pancakes wurde vom Modell nicht erreicht, und eine Korrektur scheiterte am Higgsfield-Tageslimit.

`node scripts/prepare-scroll-video.mjs` erstellt die zwei optimierten Videos aus `.local-assets/stacking-master.mp4` (FFmpeg erforderlich). Der Master und die alten WebP-Sequenzen liegen nur im lokalen Archiv und werden nicht mehr deployt. Neue Exporte benötigen eine neue Versionsnummer im Dateinamen und in `src/story.js`, damit CDN-Caches korrekt wechseln.

## Inhalte und Grenzen

- `src/catalog.js`: Sortiment und Cent-Preise.
- `src/render-catalog.js`: gemeinsame HTML-Ausgabe für Build und Filter.
- `index.html`, `src/style.css`: Texte, Gestaltung und responsive Typografie.
- `src/legal.js`: rechtliche Inhalte; Vite erzeugt daraus die eigenständigen Seiten.
- Die Matcha-Darstellung wurde am 13.10.2026 als passende Higgsfield-Produktaufnahme ergänzt. Die Café-Szene ist eine atmosphärische Visualisierung, kein bestätigtes Ladenfoto.
- Die Preis- und Validierungsfunktionen für eine mögliche spätere Bestellfunktion bleiben als ungenutzte Module erhalten; im MVP sind sie nicht mit der Website verbunden.

## Prüfungen

`npm test`: zehn Tests für Preisvalidierung, Zeitfenster, deaktivierte Commerce-API, Zeitabbildung, Richtungswechsel und statischen Katalog. Zusätzlich: Build, mobile/desktop Browserprüfung, Film vorwärts/rückwärts, Pause, Filter, eigenständige Rechtshinweise und Überläufe.

Technische Referenz für das Zusammenführen von Video-Seeks: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeked_event
