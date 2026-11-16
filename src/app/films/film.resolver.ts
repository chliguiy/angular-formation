import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Film } from './film.model';

/** Charge le film avant l'activation de la route ; redirige vers /films s'il est introuvable. */
export const filmResolver: ResolveFn<Film | RedirectCommand> = (route) => {
  const router = inject(Router);
  return inject(HttpClient)
    .get<Film>(`https://ghibliapi.vercel.app/films/${route.paramMap.get('id')}`)
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/films')))));
};
