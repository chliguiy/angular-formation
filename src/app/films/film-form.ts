import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DynamicForm } from '../shared/dynamic-form/dynamic-form';
import { FieldConfig } from '../shared/dynamic-form/dynamic-form.model';
import { filmYear, httpUrl, positiveInteger } from './film-validators';
import { FilmSignalsStore } from './state/film.signals';

@Component({
  selector: 'app-film-form',
  imports: [DynamicForm, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './film-form.html',
})
export class FilmForm {
  private readonly films = inject(FilmSignalsStore);
  private readonly router = inject(Router);

  protected readonly fields: FieldConfig[] = [
    { type: 'input', name: 'title', label: 'Titre', wide: true, validators: [Validators.required, Validators.minLength(2)] },
    { type: 'input', name: 'original_title', label: 'Titre original', wide: true },
    { type: 'input', name: 'director', label: 'Réalisateur', validators: [Validators.required] }, 
  
    {
      type: 'select',
      name: 'language',
      label: 'Langue originale',
      placeholder: 'Choisir une langue…',
      options: [
        { value: 'Japonais', label: 'Japonais' },
        { value: 'Français', label: 'Français' },
        { value: 'Anglais', label: 'Anglais' },
      ],
    },
    {
      type: 'input',
      name: 'release_date',
      label: 'Année de sortie',
      validators: [Validators.required, filmYear],
      errors: { filmYear: 'Année invalide (ex. 1988)' },
    },
    {
      type: 'input',
      name: 'running_time',
      label: 'Durée (min)',
      validators: [Validators.required, positiveInteger],
      errors: { positiveInteger: 'Entier positif attendu' },
    },
    {
      type: 'input',
      inputType: 'number',
      name: 'rt_score',
      label: 'Score (0-100)',
      value: 80,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    },
    {
      type: 'input',
      inputType: 'url',
      name: 'movie_banner',
      label: 'URL de la bannière',
      wide: true,
      validators: [Validators.required, httpUrl],
      errors: { httpUrl: 'URL invalide (http:// ou https://)' },
    },
    {
      type: 'input',
      inputType: 'url',
      name: 'image',
      label: "URL de l'affiche (optionnel)",
      wide: true,
      validators: [httpUrl],
      errors: { httpUrl: 'URL invalide (http:// ou https://)' },
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Description',
      wide: true,
      validators: [Validators.required, Validators.minLength(10)],
    },
    { type: 'array', name: 'genres', label: 'Genres', placeholder: 'Ex. Fantasy', addLabel: '+ Ajouter un genre' },
  ];

  protected submit(v: Record<string, unknown>): void {
    const str = (k: string) => String(v[k] ?? '');
    this.films.add({
      title: str('title'),
      original_title: str('original_title') || str('title'),
      director: str('director'),
      language: str('language') || undefined,
      release_date: str('release_date'),
      running_time: str('running_time'),
      rt_score: str('rt_score'),
      movie_banner: str('movie_banner'),
      image: str('image') || str('movie_banner'),
      description: str('description'),
      genres: (v['genres'] as string[]).map((g) => g.trim()).filter(Boolean),
    });
    this.router.navigateByUrl('/films');
  }
}
