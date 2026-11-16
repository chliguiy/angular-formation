import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Film } from './film.model';

/** Liste des films partagée entre la liste et le resolver du détail (évite un aller-retour réseau). */
@Injectable({ providedIn: 'root' })
export class FilmsStore {
  readonly films = httpResource<Film[]>(() => 'https://ghibliapi.vercel.app/films');

  findById(id: string | null): Film | undefined {
    return this.films.value()?.find((f) => f.id === id);
  }
}
