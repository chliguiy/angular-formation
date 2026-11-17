import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Film } from '../film.model';
import { FilmsActions } from './films.actions';

export interface FilmsState {
  films: Film[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: FilmsState = { films: [], loaded: false, loading: false, error: null };

export const filmsFeature = createFeature({
  name: 'films',
  reducer: createReducer(
    initialState,
    on(FilmsActions.loadFilms, (state) => ({ ...state, loading: true, error: null })),
    on(FilmsActions.loadFilmsSuccess, (state, { films }) => ({
      ...state,
      films,
      loaded: true,
      loading: false,
    })),
    on(FilmsActions.loadFilmsFailure, (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })),
  ),
});

export const {
  selectFilms,
  selectLoaded: selectFilmsLoaded,
  selectLoading: selectFilmsLoading,
  selectError: selectFilmsError,
} = filmsFeature;

export const selectFilmById = (id: string | null) =>
  createSelector(selectFilms, (films) => films.find((f) => f.id === id));
