import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Film } from './film.model';

@Component({
  selector: 'app-film-card',
  imports: [RouterLink],
  host: { class: 'block' },
  templateUrl: './film-card.html',
})
export class FilmCard {
  readonly film = input.required<Film>();
  /** Vrai pour les cartes visibles au premier affichage (LCP). */
  readonly priority = input(false);
}
