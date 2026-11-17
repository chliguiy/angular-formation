import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ServiceFilm } from '../film';
import { FilmsActions } from './films.actions';

export const loadFilms = createEffect(
  (actions$ = inject(Actions), filmService = inject(ServiceFilm)) =>
    actions$.pipe(
      ofType(FilmsActions.loadFilms),
      switchMap(() =>
        filmService.getFilms().pipe(
          map((films) => FilmsActions.loadFilmsSuccess({ films })),
          catchError((e) => of(FilmsActions.loadFilmsFailure({ error: e?.message ?? 'Erreur' }))),
        ),
      ),
    ),
  { functional: true },
);
