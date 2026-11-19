import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Film } from './film.model';
import { Seo } from '../seo/seo.service';

@Component({
  selector: 'app-film-detail',
  imports: [RouterLink],
  template: `
    @let f = film();
    <article class="overflow-hidden rounded-xl bg-white shadow-sm">
      <img
        [src]="f.movie_banner"
        [alt]="f.title"
        width="533"
        height="300"
        fetchpriority="high"
        class="aspect-[533/300] max-h-80 w-full bg-slate-100 object-cover"
      />
      <div class="space-y-3 p-6">
        <a routerLink="/films" class="text-sm text-blue-700 hover:underline">← Retour aux films</a>
        <h2 class="text-2xl font-bold text-slate-800">{{ f.title }}</h2>
        <p class="text-sm text-slate-500">
          {{ f.original_title }} · {{ f.release_date }} · {{ f.running_time }} min
        </p>
        <p class="text-slate-700">{{ f.description }}</p>
        <p class="text-sm text-slate-500">Réalisateur : {{ f.director }} · Score : {{ f.rt_score }}%</p>
      </div>
    </article>
  `,
})
export class FilmDetail {
  // Alimenté par le resolver (clé `film`) grâce à withComponentInputBinding()
  readonly film = input.required<Film>();
  private readonly seo = inject(Seo);

  /** SEO : title/description propres au film et données structurées Movie. */
  private readonly seoEffect = effect(() => {
    const f = this.film();
    const suffix = $localize`:@@seo.film.titleSuffix:seo.film.titleSuffix`;
    const description = f.description.length > 155 ? f.description.slice(0, 152) + '…' : f.description;
    this.seo.set({
      title: `${f.title}${suffix}`,
      description,
      path: `/films/${f.id}`,
      image: f.movie_banner,
      jsonLd: {
        '@type': 'Movie',
        name: f.title,
        alternateName: f.original_title,
        description: f.description,
        image: f.movie_banner,
        datePublished: f.release_date,
        director: { '@type': 'Person', name: f.director },
        duration: `PT${f.running_time}M`,
      },
    });
  });
}
