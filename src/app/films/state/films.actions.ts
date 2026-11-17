import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Film } from '../film.model';

export const FilmsActions = createActionGroup({
  source: 'Films',
  events: {
    'Load Films': emptyProps(),
    'Load Films Success': props<{ films: Film[] }>(),
    'Load Films Failure': props<{ error: string }>(),
  },
});
