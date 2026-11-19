import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { DEFAULT_LOCALE, LOCALES, SITE_URL } from './app/seo/site';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Locale par défaut : / redirige vers /fr/ (mettre 'en' pour basculer).
 */
app.get('/', (req, res, next) =>
  req.originalUrl === '/' ? res.redirect(302, `/${DEFAULT_LOCALE}/`) : next(),
);

/**
 * robots.txt et sitemap.xml à la racine (les assets statiques sont servis par langue).
 */
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

let sitemapCache: { xml: string; at: number } | undefined;
const SITEMAP_TTL = 60 * 60 * 1000;

async function buildSitemap(): Promise<string> {
  const res = await fetch('https://ghibliapi.vercel.app/films');
  if (!res.ok) throw new Error(`API Ghibli indisponible (${res.status})`);
  const films = (await res.json()) as { id: string }[];
  const paths = ['/films', ...films.map((f) => `/films/${f.id}`)];
  const entry = (path: string) => {
    const alternates = [
      ...LOCALES.map(
        (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${path}"/>`,
      ),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/${DEFAULT_LOCALE}${path}"/>`,
    ].join('');
    return LOCALES.map((l) => `<url><loc>${SITE_URL}/${l}${path}</loc>${alternates}</url>`).join('');
  };
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    paths.map(entry).join('') +
    '</urlset>'
  );
}

app.get('/sitemap.xml', async (_req, res, next) => {
  try {
    if (!sitemapCache || Date.now() - sitemapCache.at > SITEMAP_TTL) {
      sitemapCache = { xml: await buildSitemap(), at: Date.now() };
    }
    res.type('application/xml').send(sitemapCache.xml);
  } catch (err) {
    next(err);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    // Service worker et manifest : jamais en cache long, sinon les mises à jour n'arrivent pas
    setHeaders: (res, path) => {
      if (/(ngsw\.json|ngsw-worker\.js|safety-worker\.js|worker-basic\.min\.js|manifest\.webmanifest)$/.test(path)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
