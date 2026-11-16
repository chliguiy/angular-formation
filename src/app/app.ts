import { AuthService } from './auth/auth.service';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected deconnexion(): void {
    this.auth.deconnexion();
    this.router.navigateByUrl('/films');
  }

  protected readonly title = signal('test');
  protected readonly email = signal('test@example.com');
}
