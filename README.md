# Fluffy

A cinematic Japanese soufflé pancake brand website, built locally with Vite and vanilla JavaScript.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates `dist/`, suitable for static hosting. `npm run preview` serves the production build. No account, database or API credentials are required.

## Edit

- `index.html`: all semantic business copy, navigation and calls to action.
- `src/style.css`: shared palette, typography, desktop/mobile layouts.
- `src/main.js`: scroll timing, bounded frame loader and reduced-motion behavior.
- `public/style-tile.html`: editable visual identity board.
- `public/assets/logo-master.png`: generated raster logo master. `wordmark.png` is its cropped web derivative. `icon.svg` is an editable companion emblem, not a vectorized logo master.
- `public/assets/story-original.mp4`: original Higgsfield film.
- `public/frames/manifest.json`: actual sequence measurements.

Business facts are intentionally limited to the supplied brand and product. No invented address, prices, testimonials or hours. The café is an aspirational brand scene. Add genuine location and service details before a business launch. There is no reservation or email form pretending to submit data.

## Production

Higgsfield GPT Image 2.5 generated the pancake keyframe and logo. Kling 3.0 generated the silent continuous film from the pancake starting frame. Seedance 2.5 rejected submission because it required a higher account plan; no account settings were changed. Prompts and job IDs are in `production.json`.

Native scrolling drives an image sequence with piecewise pacing over six viewport heights of active travel, plus one viewport for the stage. HTML copy remains selectable. The loader limits concurrent requests to four and cached decoded frames to 28; obsolete images are closed. At the beginning the first frames gently loop while stationary, then scrolling takes over. Reduced-motion and data-saver users see the still image and normal product content. Skip and replay controls work without scroll hijacking. Google Fonts load remotely with local serif/sans fallbacks.

Publishing is not configured. GitHub lookup found no accessible matching `3D-Website` repository, so no unrelated repository was changed. This folder is the deliverable.
