import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  applyEach,
  form,
  FormField,
  FormRoot,
  max,
  min,
  minLength,
  required,
  ValidationError,
} from '@angular/forms/signals';
import { filmYear, httpUrl, positiveInteger } from './film-validators-signal';
import { FilmSignalsStore } from './state/film.signals';

interface FilmFormModel {
  title: string;
  original_title: string;
  director: string;
  language: string;
  release_date: string;
  running_time: string;
  rt_score: number;
  movie_banner: string;
  image: string;
  description: string;
  genres: string[];
}

const MESSAGES: Record<string, string> = {
  required: 'Champ obligatoire',
  httpUrl: 'URL invalide (http:// ou https://)',
  filmYear: 'Année invalide (ex. 1988)',
  positiveInteger: 'Entier positif attendu',
  min: 'Valeur entre 0 et 100',
  max: 'Valeur entre 0 et 100',
};

/** Formulaire d'ajout de film basé sur les Signal Forms (modèle en signal + form()). */
@Component({
  selector: 'app-film-form-signal',
  imports: [FormField, FormRoot, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './film-form-signal.html',
})
export class FilmFormSignal {
  private readonly films = inject(FilmSignalsStore);
  private readonly router = inject(Router);

  protected readonly languages = ['Japonais', 'Français', 'Anglais'];

  /** Source de vérité du formulaire. */
  protected readonly model = signal<FilmFormModel>({
    title: '',
    original_title: '',
    director: '',
    language: '',
    release_date: '',
    running_time: '',
    rt_score: 80,
    movie_banner: '',
    image: '',
    description: '',
    genres: [''],
  });

  protected readonly f = form(
    this.model,
    (p) => {
      required(p.title);
      minLength(p.title, 2);
      required(p.director);
      required(p.release_date);
      filmYear(p.release_date);
      required(p.running_time);
      positiveInteger(p.running_time);
      required(p.rt_score);
      min(p.rt_score, 0);
      max(p.rt_score, 100);
      required(p.movie_banner);
      httpUrl(p.movie_banner);
      httpUrl(p.image);
      required(p.description);
      minLength(p.description, 10);
      applyEach(p.genres, (g) => required(g));
    },
    {
      // [formRoot] : marque tout touché, valide, puis n'appelle l'action que si le formulaire est valide
      submission: { action: async () => this.save() },
    },
  );

  protected addGenre(): void {
    this.model.update((m) => ({ ...m, genres: [...m.genres, ''] }));
  }

  protected removeGenre(i: number): void {
    this.model.update((m) => ({ ...m, genres: m.genres.filter((_, k) => k !== i) }));
  }

  /** Message du premier erreur d'un champ, ou chaîne vide. */
  protected error(errors: readonly ValidationError[]): string {
    const e = errors[0];
    if (!e) return '';
    if (e.kind === 'minLength') return `Trop court (min. ${(e as any).minLength})`;
    return e.message ?? MESSAGES[e.kind] ?? 'Valeur invalide';
  }

  private save(): void {
    const v = this.model();
    this.films.add({
      title: v.title,
      original_title: v.original_title || v.title,
      director: v.director,
      language: v.language || undefined,
      release_date: v.release_date,
      running_time: v.running_time,
      rt_score: String(v.rt_score),
      movie_banner: v.movie_banner,
      image: v.image || v.movie_banner,
      description: v.description,
      genres: v.genres.map((g) => g.trim()).filter(Boolean),
    });
    this.router.navigateByUrl('/films');
  }
}
