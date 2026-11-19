import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

const FILMS_API = 'https://ghibliapi.vercel.app/films';

/** Ids des films, récupérés à la compilation pour générer une page HTML par film. */
async function filmIds(): Promise<Record<string, string>[]> {
  const res = await fetch(FILMS_API).catch((err: Error & { cause?: { code?: string } }) => {
    throw new Error(
      `Impossible de joindre ${FILMS_API} (${err.cause?.code ?? err.message}). ` +
        "Si le code est SELF_SIGNED_CERT_IN_CHAIN (certificat d'entreprise), " +
        'lancez le build avec NODE_USE_SYSTEM_CA=1 (ex. `npm run build`).',
    );
  });
  if (!res.ok) throw new Error(`API Ghibli indisponible (${res.status})`);
  const films = (await res.json()) as { id: string }[];
  return films.map(({ id }) => ({ id }));
}

export const serverRoutes: ServerRoute[] = [
  // Pages publiques : HTML complet généré au build (une page par film et par langue) → SEO
  { path: 'films', renderMode: RenderMode.Prerender },
  { path: 'films/new', renderMode: RenderMode.Client },
  { path: 'films/new-signal', renderMode: RenderMode.Client },
  {
    path: 'films/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: filmIds,
    // Film absent au build (ajouté depuis) : rendu à la demande par le serveur
    fallback: PrerenderFallback.Server,
  },
  // Pages dépendant de l'état de connexion (mock côté client)
  { path: 'home', renderMode: RenderMode.Client },
  { path: 'products', renderMode: RenderMode.Client },
  { path: 'connexion', renderMode: RenderMode.Client },
  { path: 'aria', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
