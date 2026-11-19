import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { FilmCard } from './film-card';
import { FilmsHero } from './films-hero';
import { FilmSignalsStore } from './state/film.signals';
import { Seo } from '../seo/seo.service';
import { SITE_URL } from '../seo/site';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
@Component({
  selector: 'app-films',
  imports: [RouterLink, FormsModule, FilmCard, FilmsHero],
  templateUrl: './films.html',
})
export class Films {
  private readonly store = inject(FilmSignalsStore);
  readonly films = this.store.films;
  readonly loaded = this.store.loaded;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  nbFilms = computed(() => this.films().length);
  nbImages = computed(() => this.store.films().filter((f) => f.image).length);
  readonly search = signal('');
  private readonly seo = inject(Seo);

  /** SEO : title, description, canonical/hreflang et liste structurée (ItemList) des films. */
  private readonly seoEffect = effect(() => {
    const films = this.films();
    this.seo.set({
      title: $localize`:@@seo.films.title:seo.films.title`,
      description: $localize`:@@seo.films.description:seo.films.description`,
      path: '/films',
      image: films[0]?.movie_banner,
      jsonLd: {
        '@type': 'ItemList',
        itemListElement: films.map((f, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: f.title,
          url: `${SITE_URL}/fr/films/${f.id}`,
        })),
      },
    });
  });

  constructor() {
   this.store.loadFilms();
   console.log('Films constructor : films =', this.films());
  }
  
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
    const films = this.films();
    if (!term) return films;
    // Le texte saisi est un id de film : on n'affiche que ce film
    const byId = this.store.findById(term);
    if (byId) return [byId];
    return films.filter(
      (f) =>
        f.title.toLowerCase().includes(term) ||
        f.original_title.toLowerCase().includes(term) ||
        f.director.toLowerCase().includes(term),
    );
  });
}
