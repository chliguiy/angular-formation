import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from '../app';
import { AuthService } from './auth.service';

describe('Déconnexion', () => {
  describe('AuthService.deconnexion()', () => {
    let auth: AuthService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      auth = TestBed.inject(AuthService);
      auth.connexion('admin');
    });

    it('vide l\'utilisateur et le rôle', () => {
      expect(auth.connecte()).toBe(true);

      auth.deconnexion();

      expect(auth.user()).toBeNull();
      expect(auth.connecte()).toBe(false);
      expect(auth.role()).toBeNull();
    });

    it('retire tous les droits (aRole)', () => {
      expect(auth.aRole('admin')).toBe(true);

      auth.deconnexion();

      expect(auth.aRole('admin')).toBe(false);
      expect(auth.aRole('user')).toBe(false);
    });

    it('est sans effet si personne n\'est connecté', () => {
      auth.deconnexion();
      expect(() => auth.deconnexion()).not.toThrow();
      expect(auth.connecte()).toBe(false);
    });
  });

  describe('bouton Déconnexion de App', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [provideRouter([])],
      }).compileComponents();
    });

    it('déconnecte et redirige vers /films', async () => {
      const auth = TestBed.inject(AuthService);
      const router = TestBed.inject(Router);
      const navigate = vi.fn().mockResolvedValue(true);
      router.navigateByUrl = navigate;
      auth.connexion('user');

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const bouton = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ).find((b) => b.textContent?.includes('Déconnexion'));
      expect(bouton).toBeTruthy();

      bouton!.click();
      await fixture.whenStable();

      expect(auth.connecte()).toBe(false);
      expect(navigate).toHaveBeenCalledWith('/films');
      expect(
        Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).some((b) =>
          b.textContent?.includes('Déconnexion'),
        ),
      ).toBe(false); 
      expect(
        Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).some((b) =>
          b.textContent?.includes('Connexion'),
        ),
      ).toBe(true);
    });
  });
});
