import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Pages publiques : HTML rendu à chaque requête avec les données de l'API (LCP)
  { path: 'films', renderMode: RenderMode.Server },
  { path: 'films/:id', renderMode: RenderMode.Server },
  // Pages dépendant de l'état de connexion (mock côté client)
  { path: 'home', renderMode: RenderMode.Client },
  { path: 'products', renderMode: RenderMode.Client },
  { path: 'connexion', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
