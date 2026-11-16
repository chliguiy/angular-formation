import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { Film } from './film.model';
import { FilmsStore } from './films.store';

/** Démarre le téléchargement de la bannière en parallèle du chargement du chunk de la page. */
function preloadImage(url: string): void {
  const img = new Image();
  img.fetchPriority = 'high';
  img.src = url;
}

/**
 * Charge le film avant l'activation de la route.
 * - Déjà dans le cache de la liste : retour immédiat (aucune requête).
 * - Sinon : requête API, redirection vers /films si introuvable.
 */
export const filmResolver: ResolveFn<Film | RedirectCommand> = (route) => {
  const id = route.paramMap.get('id');
  const cached = inject(FilmsStore).findById(id);
  if (cached) {
    preloadImage(cached.movie_banner);
    return cached;
  }

  const router = inject(Router);
  return inject(HttpClient)
    .get<Film>(`https://ghibliapi.vercel.app/films/${id}`)
    .pipe(
      tap((film) => preloadImage(film.movie_banner)),
      catchError(() => of(new RedirectCommand(router.parseUrl('/films')))),
    );
};
