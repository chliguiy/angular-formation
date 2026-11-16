import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule],
  template: `
    <form
      (ngSubmit)="valider()"
      class="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm"
    >
      <h2 class="text-2xl font-bold text-slate-800">Connexion</h2>
      <p class="text-sm text-slate-500">
        Mock : <code>admin</code> (accès à tout) ou <code>user</code> (films et produits).
      </p>
      <input
        name="identifiant"
        [ngModel]="identifiant()"
        (ngModelChange)="identifiant.set($event)"
        placeholder="admin ou user"
        class="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
      />
      @if (erreur()) {
        <p class="text-sm text-red-600">Identifiant inconnu.</p>
      }
      <button
        type="submit"
        class="w-full rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
      >
        Se connecter
      </button>
    </form>
  `,
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly identifiant = signal('');
  readonly erreur = signal(false);

  valider(): void {
    if (!this.auth.connexion(this.identifiant())) {
      this.erreur.set(true);
      return;
    }
    const retour = this.route.snapshot.queryParamMap.get('retour');
    // N'accepte que des chemins internes (évite une redirection ouverte)
    const cible = retour?.startsWith('/') && !retour.startsWith('//') ? retour : '/films';
    this.router.navigateByUrl(cible);
  }
}
