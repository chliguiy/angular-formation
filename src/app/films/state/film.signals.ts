import { inject, Service, signal } from "@angular/core";
import { ServiceFilm } from "../film";
import { firstValueFrom } from "rxjs";
import { Film } from "../film.model";

@Service()
export class FilmSignalsStore {
    services = inject(ServiceFilm);
    films = signal<Film[]>([]);
    /** Films créés localement : conservés quand la liste de l'API est (re)chargée. */
    private added: Film[] = [];
    loaded = signal(false);
    loading = signal(false);
    error = signal<string | null>(null);
    /** Charge la liste et attend la réponse (la promesse se résout une fois les signaux à jour). */
    async loadFilms(): Promise<Film[]> {
        this.setLoading(true);
        try {
            this.setFilms(await firstValueFrom(this.services.getFilms()));
        } catch (e) {
            this.setError(e instanceof Error ? e.message : 'Impossible de charger les films');
        }
        return this.films();
    }

    /** Ajoute un film en local (l'API Ghibli est en lecture seule). */
    add(film: Omit<Film, 'id'>): Film {
        const created: Film = { ...film, id: crypto.randomUUID() };
        this.added = [created, ...this.added];
        this.films.update((list) => [created, ...list]);
        return created;
    }

    setFilms(films: Film[]) {
        this.films.set([...this.added, ...films]);
        this.loaded.set(true);
        this.loading.set(false);
        this.error.set(null);
    }

    setLoading(loading: boolean) {
        this.loading.set(loading);
    }

    setError(error: string | null) {
        this.error.set(error);
        this.loading.set(false);
    }   
    findById(id: string | null) {
        return this.films().find((f) => f.id === id);
    }
}