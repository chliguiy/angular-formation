import { Home } from './home/home';
import { Products } from './products/products';

describe('Composants dans des fichiers distincts', () => {
  it('Home est défini dans home/home.ts', () => {
    expect(Home).toBeDefined();
  });

  it('Products est défini dans products/products.ts', () => {
    expect(Products).toBeDefined();
  });

  it('Home et Products sont deux composants différents', () => {
    expect(Home).not.toBe(Products);
  });
});
