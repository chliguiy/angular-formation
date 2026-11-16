import { computed, Injectable, signal } from '@angular/core';

export type Role = 'admin' | 'user';

export interface AuthUser {
  name: string;
  role: Role;
}

// Utilisateurs mock
const MOCK_USERS: Record<string, AuthUser> = {
  admin: { name: 'Admin', role: 'admin' },
  user: { name: 'Utilisateur', role: 'user' },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly connecte = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  /** Connexion mock : identifiant "admin" ou "user" (le mot de passe est ignoré). */
  connexion(identifiant: string): boolean {
    const user = MOCK_USERS[identifiant.trim().toLowerCase()];
    if (!user) return false;
    this._user.set(user);
    return true;
  }

  deconnexion(): void {
    this._user.set(null);
  }

  aRole(...roles: Role[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }
}
