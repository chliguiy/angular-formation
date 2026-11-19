import { TestBed } from '@angular/core/testing';
import { Aria } from './aria';

describe('Page @angular/aria', () => {
  const rendre = async () => {
    const fixture = TestBed.createComponent(Aria);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };
  const roles = (page: HTMLElement, role: string) => page.querySelectorAll(`[role="${role}"]`);

  it('expose les rôles ARIA de chaque famille', async () => {
    const page = await rendre();
    expect(roles(page, 'tablist').length).toBe(1);
    expect(roles(page, 'tab').length).toBe(3);
    expect(roles(page, 'listbox').length).toBeGreaterThanOrEqual(1);
    expect(roles(page, 'option').length).toBeGreaterThanOrEqual(4);
    expect(roles(page, 'menubar').length).toBe(1);
    expect(roles(page, 'toolbar').length).toBe(1);
    expect(roles(page, 'tree').length).toBe(1);
    expect(roles(page, 'treeitem').length).toBeGreaterThanOrEqual(3);
    expect(roles(page, 'grid').length).toBe(1);
    expect(roles(page, 'combobox').length).toBe(1);
    expect(page.querySelectorAll('[aria-expanded]').length).toBeGreaterThanOrEqual(3);
  });

  it("n'affiche que le panneau d'onglet sélectionné", async () => {
    const page = await rendre();
    expect(page.textContent).toContain("s'égare dans un monde d'esprits");
    expect(page.textContent).not.toContain('Réalisation : Hayao Miyazaki');
  });
});
