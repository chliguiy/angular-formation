import { computed, inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { ServiceFilm } from '../film';

export const FilmsSignalStore = signalStore(
  { providedIn: 'root' },
  // La liste est chargée par httpResource (démarre à la création du store)
  withProps((_, filmService = inject(ServiceFilm)) => ({ _resource: filmService.filmsResource() })),
  withComputed(({ _resource }) => ({
    films: computed(() => _resource.value() ?? []),
    loaded: computed(() => _resource.hasValue()),
    loading: computed(() => _resource.isLoading()),
    error: computed(() => _resource.error()?.message ?? null),
  })),
  withMethods(({ _resource, films }, injector = inject(Injector)) => ({
    /** Attend la fin du chargement (succès ou erreur) puis renvoie la liste. */
    whenLoaded: async () => {
      await firstValueFrom(
        toObservable(_resource.status, { injector }).pipe(
          filter((s) => s === 'resolved' || s === 'local' || s === 'error'),
        ),
      );
      return films();
    },
    findById: (id: string | null) => films().find((f) => f.id === id),
    reload: () => _resource.reload(),
  })),

);
