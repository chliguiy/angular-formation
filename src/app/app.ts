import { AuthService } from './auth/auth.service';
import { Component, LOCALE_ID, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from './store';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  /** Locale du build courant (fr ou en) et locale cible du lien de bascule. */
  protected readonly locale = inject(LOCALE_ID).slice(0, 2);
  protected readonly autreLocale = this.locale === 'fr' ? 'en' : 'fr';
  test = inject(Store).test;

  protected deconnexion(): void {
    this.auth.deconnexion();
    this.router.navigateByUrl('/films');
  }
  constructor() {
    setTimeout(() => {
      this.test.set('test updated message pour component film');
    }, 2000);
  }

}
