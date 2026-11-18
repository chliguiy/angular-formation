import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

interface Film {
  id: string;
  title: string;
  director: string;
}

// Mêmes données que les tests unitaires : l'API Ghibli est interceptée côté navigateur
const FILMS: Film[] = JSON.parse(readFileSync('src/app/films/testing/films.mock.json', 'utf-8'));

async function mockApi(page: Page) {
  await page.route('https://ghibliapi.vercel.app/films**', (route) => {
    const id = new URL(route.request().url()).pathname.split('/').filter(Boolean)[1];
    const body = id ? FILMS.find((f) => f.id === id) : FILMS;
    return route.fulfill({
      json: body,
      headers: { 'access-control-allow-origin': '*' },
    });
  });
}

async function seConnecter(page: Page, identifiant: string) {
  // /connexion est rendue côté client : la liste des films est ensuite chargée par le navigateur (mockée)
  await page.goto('/connexion');
  await page.getByPlaceholder('admin ou user').fill(identifiant);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/films$/);
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test.describe('Connexion', () => {
  test('refuse un identifiant inconnu', async ({ page }) => {
    await page.goto('/connexion');
    await page.getByPlaceholder('admin ou user').fill('inconnu');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Identifiant inconnu.')).toBeVisible();
    await expect(page).toHaveURL(/\/connexion$/);
  });

  test('connecte puis déconnecte', async ({ page }) => {
    await seConnecter(page, 'admin');
    await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeVisible();

    await page.getByRole('button', { name: 'Déconnexion' }).click();
    await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();
  });
});

test.describe('Scénario complet', () => {
  test('connexion → liste → détail → ajout d\'un film', async ({ page }) => {
    // 1. Connexion
    await seConnecter(page, 'admin');
    await expect(page.getByText('Admin', { exact: true })).toBeVisible();

    // 2. Liste des films
    const cartes = page.locator('app-film-card');
    await expect(cartes).toHaveCount(FILMS.length);
    await expect(cartes.first()).toContainText(FILMS[0].title);

    // 3. Détail d'un film
    await cartes.first().getByRole('link', { name: `Détails du film ${FILMS[0].title}` }).click();
    await expect(page).toHaveURL(new RegExp(`/films/${FILMS[0].id}$`));
    await expect(page.getByRole('heading', { level: 2, name: FILMS[0].title })).toBeVisible();
    await expect(page.getByText(FILMS[0].director)).toBeVisible();

    // 4. Retour à la liste, puis ajout d'un film
    await page.getByRole('link', { name: /Retour aux films/ }).click();
    await page.getByRole('link', { name: '+ Ajouter un film' }).click();
    await expect(page).toHaveURL(/\/films\/new$/);

    // un formulaire vide est refusé
    await page.getByRole('button', { name: 'Ajouter un film' }).click();
    await expect(page.getByText('Champ obligatoire').first()).toBeVisible();
    await expect(page).toHaveURL(/\/films\/new$/);

    await page.getByLabel('Titre', { exact: true }).fill('Mon nouveau film');
    await page.getByLabel('Réalisateur').fill('Jane Doe');
    await page.getByLabel('Acteur').fill('John Doe');
    await page.getByLabel('Langue originale').selectOption('Français');
    await page.getByLabel('Année de sortie').fill('2024');
    await page.getByLabel('Durée (min)').fill('95');
    await page.getByLabel('URL de la bannière').fill('https://example.com/banner.jpg');
    await page.getByLabel('Description').fill('Une description assez longue pour être valide.');
    await page.getByRole('textbox', { name: 'Genres 1' }).fill('Fantasy');
    await page.getByRole('button', { name: 'Ajouter un film' }).click();

    // 5. Le film est dans la liste, en première position
    await expect(page).toHaveURL(/\/films$/);
    await expect(cartes).toHaveCount(FILMS.length + 1);
    await expect(cartes.first()).toContainText('Mon nouveau film');
    await expect(cartes.first()).toContainText('Jane Doe');
  });
});
