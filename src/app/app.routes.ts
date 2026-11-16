import { Routes } from '@angular/router';
import { filmResolver } from './films/film.resolver';
import { authGuard, roleGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'films',
    pathMatch: 'full',
  },
  {
    path: 'connexion',
    loadComponent: () =>
      import('./connexion/connexion').then((m) => m.Connexion),
  },
  {
    // Réservé aux admins
    path: 'home',
    canActivate: [authGuard],
    canActivateChild: [roleGuard('admin')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home').then((m) => m.Home),
      },
    ],
  },
  {
    // Admins et tous les autres utilisateurs connectés
    path: 'products',
    canActivate: [authGuard],
    canActivateChild: [roleGuard('admin', 'user')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./products/products').then((m) => m.Products),
      },
    ],
  },
  {
    path: 'films',
    loadComponent: () =>
      import('./films/films').then((m) => m.Films),
  },
  {
    path: 'films/:id',
    resolve: { film: filmResolver },
    loadComponent: () =>
      import('./films/film-detail').then((m) => m.FilmDetail),
  },
];
