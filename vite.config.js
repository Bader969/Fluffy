import { defineConfig } from 'vite';
import { productMarkup, menuMarkup } from './src/render-catalog.js';
import { legal } from './src/legal.js';
const pages = { 'impressum': 'impressum', 'datenschutz': 'datenschutz', 'allergenhinweise': 'allergene' };
function legalPage(key) {
  const page = legal[key];
  return `<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title} — Fluffy</title><style>body{margin:0;background:#FBF9F5;color:#191817;font:18px/1.75 Arial,sans-serif}main{max-width:760px;margin:60px auto;padding:0 24px}h1{font:normal clamp(40px,7vw,64px)/1.1 Georgia,serif;overflow-wrap:anywhere}a{color:inherit;text-underline-offset:5px}p{margin:24px 0}</style></head><body><main><a href="/">← Zurück zu Fluffy</a><h1>${page.title}</h1>${page.body}</main></body></html>`;
}
export default defineConfig({
  plugins: [{
    name: 'fluffy-static-content',
    transformIndexHtml(html) {
      return html.replace(/(<div[^>]*id="product-grid"[^>]*>)(\s*)(<\/div>)/, (_, start, space, end) => start + productMarkup() + end)
        .replace('<div id="menu-accordions"></div>', '<div id="menu-accordions">' + menuMarkup() + '</div>');
    },
    generateBundle() {
      for (const [slug, key] of Object.entries(pages)) this.emitFile({ type:'asset', fileName:`${slug}.html`, source:legalPage(key) });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const slug = req.url?.split('?')[0].slice(1).replace(/\.html$/, '');
        if (!pages[slug]) return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(legalPage(pages[slug]));
      });
    },
  }],
});
