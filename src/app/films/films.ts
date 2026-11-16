import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, interval, map } from 'rxjs';
import { Film } from './film.model';

@Component({
  selector: 'app-films',
  imports: [FormsModule, RouterLink],
  templateUrl: './films.html',
})
export class Films {
  readonly films = httpResource<Film[]>(() => 'https://ghibliapi.vercel.app/films');

  constructor() {
    // Rafraîchissement toutes les 30 s ; désabonnement auto à la destruction du composant
    interval(30_000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.films.reload());
  }

  readonly search = signal('');

  // signal -> observable (debounce) -> signal
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300),
      map((value) => value.trim().toLowerCase()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  readonly filteredFilms = computed(() => {
    const term = this.debouncedSearch();
    const films = this.films.value() ?? [];
    if (!term) return films;
    return films.filter(
      (f) =>
        f.title.toLowerCase().includes(term) ||
        f.original_title.toLowerCase().includes(term) ||
        f.director.toLowerCase().includes(term),
    );
  });
}
