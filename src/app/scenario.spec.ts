
import { signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { ServiceFilm } from './films/film';
import { Film } from './films/film.model';
import filmsMock from './films/testing/films.mock.json';

const FILMS = filmsMock as Film[];

/**
 * Scénario utilisateur : connexion → liste des films → détail d'un film → ajout d'un film.
 * L'API est remplacée par le mock JSON ; tout le reste (routes, guards, composants, stores) est réel.
 */
describe('Scénario : connexion, films, détail, ajout', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let page: HTMLElement;

  const flush = () => fixture.whenStable();
  const $ = (sel: string) => page.querySelector<HTMLElement>(sel);
  const $$ = (sel: string) => Array.from(page.querySelectorAll<HTMLElement>(sel));
  const lien = (texte: string) => $$('a').find((a) => a.textContent?.includes(texte));
  const saisir = (sel: string, valeur: string) => {
    const el = $(sel) as HTMLInputElement | HTMLTextAreaElement;
    expect(el, `champ ${sel}`).toBeTruthy();
    el.value = valeur;
    el.dispatchEvent(new Event('input'));
  };
  const cartes = () => $$('app-film-card');

  beforeEach(async () => {
    // jsdom n'implémente pas matchMedia (utilisé par le slider pour prefers-reduced-motion)
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        {
          provide: ServiceFilm,
          useValue: {
            getFilms: () => of(FILMS),
            getFilm: (id: string) => of(FILMS.find((f) => f.id === id)),
            // utilisée par le resolver (FilmsSignalStore) : ressource vide factice
            filmsResource: () => ({
              value: signal<Film[] | undefined>(undefined),
              hasValue: signal(false),
              isLoading: signal(false),
              error: signal(undefined),
              reload: () => true,
            }),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(App);
    page = fixture.nativeElement;
    await router.navigateByUrl('/films');
    await flush();
  });

  it('1. visiteur : voit les films sans être connecté', () => {
    expect(router.url).toBe('/films');
    expect(cartes()).toHaveLength(FILMS.length);
    expect(page.textContent).toContain('Connexion');
    expect(page.textContent).not.toContain('Déconnexion');
  });

  it('2. connexion refusée avec un identifiant inconnu', async () => {
    lien('Connexion')!.click();
    await flush();
    expect(router.url).toBe('/connexion');

    saisir('input[name="identifiant"]', 'inconnu');
    $('form')!.dispatchEvent(new Event('submit'));
    await flush();

    expect(router.url).toBe('/connexion');
    expect(page.textContent).toContain('Identifiant inconnu');
  });

  it('3. parcours complet : connexion → liste → détail → ajout', async () => {
    // --- Connexion
    lien('Connexion')!.click();
    await flush();
    saisir('input[name="identifiant"]', 'admin');
    $('form')!.dispatchEvent(new Event('submit'));
    await flush();

    expect(router.url).toBe('/films');
    expect(page.textContent).toContain('Admin');
    expect(page.textContent).toContain('Déconnexion');

    // --- Liste des films
    expect(cartes()).toHaveLength(FILMS.length);
    expect(cartes()[0].textContent).toContain(FILMS[0].title);

    // --- Détail du premier film
    const detail = cartes()[0].querySelector<HTMLAnchorElement>('a[aria-label^="Détails"]')!;
    detail.click();
    await flush();

    expect(router.url).toBe(`/films/${FILMS[0].id}`);
    expect($('app-film-detail h2')?.textContent).toContain(FILMS[0].title);
    expect($('app-film-detail')?.textContent).toContain(FILMS[0].director);

    // --- Retour à la liste
    lien('Retour aux films')!.click();
    await flush();
    expect(router.url).toBe('/films');

    // --- Ajout d'un film
    lien('Ajouter un film')!.click();
    await flush();
    expect(router.url).toBe('/films/new');

    // un formulaire vide est refusé
    $('form')!.dispatchEvent(new Event('submit'));
    await flush();
    expect(router.url).toBe('/films/new');
    expect(page.textContent).toContain('Champ obligatoire');

    saisir('#title', 'Nouveau film');
    saisir('#director', 'Jane Doe');
    saisir('#Actor', 'John Doe');
    saisir('#release_date', '2024');
    saisir('#running_time', '95');
    saisir('#movie_banner', 'https://example.com/banner.jpg');
    saisir('#description', 'Une description assez longue pour être valide.');
    saisir('input[aria-label="Genres 1"]', 'Fantasy');
    $('form')!.dispatchEvent(new Event('submit'));
    await flush();

    // --- Le film apparaît en tête de la liste
    expect(router.url).toBe('/films');
    expect(cartes()).toHaveLength(FILMS.length + 1);
    expect(cartes()[0].textContent).toContain('Nouveau film');
    expect(cartes()[0].textContent).toContain('Jane Doe');
  });

  it('4. déconnexion : retour visiteur sur /films', async () => {
    lien('Connexion')!.click();
    await flush();
    saisir('input[name="identifiant"]', 'user');
    $('form')!.dispatchEvent(new Event('submit'));
    await flush();
    expect(page.textContent).toContain('Déconnexion');

    $$('button').find((b) => b.textContent?.includes('Déconnexion'))!.click();
    await flush();

    expect(router.url).toBe('/films');
    expect(page.textContent).not.toContain('Déconnexion');
    expect(page.textContent).toContain('Connexion');
  });
});
