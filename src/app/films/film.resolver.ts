import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { ServiceFilm } from './film';
import { Film as FilmModel } from './film.model';
import { FilmsSignalStore } from './state/films.signal-store';

/** Démarre le téléchargement de la bannière en parallèle du chargement du chunk de la page. */
function preloadImage(url: string): void {
  const img = new Image();
  img.fetchPriority = 'high';
  img.src = url;
}

/**
 * Charge le film avant l'activation de la route.
 * - Film présent dans le SignalStore : retour immédiat (aucune requête).
 * - Sinon : appel API (service Film), redirection vers /films si introuvable.
 */
export const filmResolver: ResolveFn<FilmModel | RedirectCommand> = (route) => {
  const id = route.paramMap.get('id');
  // `inject()` doit être appelé ici (contexte d'injection), pas dans les callbacks asynchrones
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const cached = inject(FilmsSignalStore).findById(id);
  if (cached) {
    if (isBrowser) preloadImage(cached.movie_banner);
    console.log('Film récuper par ngrx: film trouvé dans le store', cached);
    return cached;
  }

  const router = inject(Router);
  return inject(ServiceFilm)
    .getFilm(id)
    .pipe(
      tap((film) => {

        console.log('Film récuper par api: film trouvé dans le store', film);
        if (isBrowser) preloadImage(film.movie_banner);
      }),
      catchError(() => of(new RedirectCommand(router.parseUrl('/films')))),
    );
};
