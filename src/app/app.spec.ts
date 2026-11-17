import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    })
      .compileComponents();
      console.log('TestBed configured');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    console.log(compiled.querySelector('header')?.textContent);

    expect(compiled.querySelector('header')?.textContent).toContain('Films'); 
  });

  it('should not render the email', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('email');
  });

  describe('deconnexion()', () => {
    // deconnexion() est protected : on l'appelle via un cast pour tester App.ts directement
    const appelerDeconnexion = (app: App) => (app as unknown as { deconnexion(): void }).deconnexion();

    it('déconnecte l\'utilisateur via AuthService', () => {
      const auth = TestBed.inject(AuthService);
      TestBed.inject(Router).navigateByUrl = vi.fn().mockResolvedValue(true);
      auth.connexion('admin');
      console.log('Utilisateur connecté :', auth.user());
      const app = TestBed.createComponent(App).componentInstance;

      appelerDeconnexion(app);

      expect(auth.connecte()).toBe(false);
      expect(auth.user()).toBeNull();
    });

    it('appelle AuthService.deconnexion() une seule fois', () => {
      const auth = TestBed.inject(AuthService);
      TestBed.inject(Router).navigateByUrl = vi.fn().mockResolvedValue(true);
      const spy = vi.fn(auth.deconnexion.bind(auth));
      auth.deconnexion = spy;
      const app = TestBed.createComponent(App).componentInstance;

      appelerDeconnexion(app);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('redirige vers /films', () => {
      const navigate = TestBed.inject(Router).navigateByUrl = vi.fn().mockResolvedValue(true);
      const app = TestBed.createComponent(App).componentInstance;

      appelerDeconnexion(app);

      expect(navigate).toHaveBeenCalledWith('/films');
    });
  });
});
