import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Film as FilmModel } from './film.model';

const API_URL = 'https://ghibliapi.vercel.app/films';

/** Accès à l'API Ghibli. */
@Service()
export class ServiceFilm {
  private readonly http = inject(HttpClient);

  // 'no-store' : évite les 304 sans en-tête CORS renvoyés par l'API
  getFilms(): Observable<FilmModel[]> {
    return this.http.get<FilmModel[]>(API_URL, { cache: 'no-store' });
  }

  /** Resource réactive (signals) de la liste ; à appeler dans un contexte d'injection. */
  filmsResource() {
    return httpResource<FilmModel[]>(() => ({ url: API_URL, cache: 'no-store' }));
  }

  getFilm(id: string | null): Observable<FilmModel> {
    return this.http.get<FilmModel>(`${API_URL}/${id}`, { cache: 'no-store' });
  }
}
