import { AuthService } from './auth/auth.service';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from './store';
import { Counter } from './services/counter';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
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
