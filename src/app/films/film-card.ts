import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Film } from './film.model';


@Component({
  selector: 'app-film-card',
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    @let f = film();
    <article
      class="flex h-[24rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- width/height + aspect-ratio : espace réservé avant le chargement de l'image (CLS) -->
      <img
        [src]="f.movie_banner"
        [alt]="f.title"
        width="533"
        height="300"
        decoding="async"
        [attr.loading]="priority() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="priority() ? 'high' : null"
        class="aspect-[533/300] w-full shrink-0 bg-slate-100 object-cover"
      />
      <div class="flex min-h-0 flex-1 flex-col p-4">
        <h3 class="line-clamp-1 font-semibold text-slate-800">
          <a [routerLink]="['/films', f.id]" class="hover:text-blue-700 hover:underline">{{
            f.title
          }}</a>
        </h3>
        <p class="line-clamp-1 text-xs text-slate-500">
          {{ f.original_title }} · {{ f.release_date }}
        </p>
        <p class="mt-2 line-clamp-3 text-sm text-slate-600">{{ f.description }}</p>
        <div class="mt-auto flex items-center justify-between pt-3 text-xs text-slate-500">
          <span class="truncate">{{ f.director }}</span>
          <span class="rounded-full bg-green-100 px-2 py-1 font-medium text-green-700">
            {{ f.rt_score }}%
          </span>
        </div>
      </div>
    </article>
  `,
})
export class FilmCard {
  readonly film = input.required<Film>();
  /** Vrai pour les cartes visibles au premier affichage (LCP). */
  readonly priority = input(false);
}
