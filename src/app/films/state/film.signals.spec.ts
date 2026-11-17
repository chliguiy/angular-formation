import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ServiceFilm } from '../film';
import { Film } from '../film.model';
import filmsMock from '../testing/films.mock.json';
import { FilmSignalsStore } from './film.signals';

const FILMS = filmsMock as Film[];

describe('FilmSignalsStore', () => {
  const getFilms = vi.fn<() => Observable<Film[]>>();
  let store: FilmSignalsStore;

  beforeEach(() => {
    getFilms.mockReset();
    getFilms.mockReturnValue(of(FILMS));
    TestBed.configureTestingModule({
      providers: [{ provide: ServiceFilm, useValue: { getFilms } }],
    });
    store = TestBed.inject(FilmSignalsStore);
  });

  it('démarre vide, non chargé, sans erreur', () => {
    expect(store.films()).toEqual([]);
    expect(store.loaded()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadFilms()', () => {
    it('charge les films et met à jour les signaux', async () => {
      const result = await store.loadFilms();

      expect(getFilms).toHaveBeenCalledTimes(1);
      expect(result).toEqual(FILMS);
      expect(store.films()).toHaveLength(2);
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('passe loading à true pendant la requête', async () => {
      const promesse = store.loadFilms();
      expect(store.loading()).toBe(true);
      await promesse;
      expect(store.loading()).toBe(false);
    });

    it('renseigne error si la requête échoue', async () => {
      getFilms.mockReturnValue(throwError(() => new Error('Réseau indisponible')));

      const result = await store.loadFilms();

      expect(result).toEqual([]);
      expect(store.error()).toBe('Réseau indisponible');
      expect(store.loaded()).toBe(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('findById()', () => {
    it('retrouve un film chargé', async () => {
      await store.loadFilms();
      expect(store.findById(FILMS[1].id)?.title).toBe('Grave of the Fireflies');
    });

    it('renvoie undefined si inconnu ou null', async () => {
      await store.loadFilms();
      expect(store.findById('999')).toBeUndefined();
      expect(store.findById(null)).toBeUndefined();
    });
  });

  describe('add()', () => {
    const { id: _id, ...base } = FILMS[0];
    const nouveau = { ...base, title: 'Nouveau' };

    it('ajoute le film en tête avec un id généré', async () => {
      await store.loadFilms();

      const created = store.add(nouveau);

      expect(created.id).toBeTruthy();
      expect(store.films()[0]).toEqual(created);
      expect(store.films()).toHaveLength(3);
      expect(store.findById(created.id)?.title).toBe('Nouveau');
    });

    it('conserve le film ajouté quand la liste est rechargée', async () => {
      const created = store.add(nouveau);

      await store.loadFilms();

      expect(store.films()).toHaveLength(3);
      expect(store.films()[0].id).toBe(created.id);
    });
  });
});
