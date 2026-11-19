import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  AccordionContent,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
} from '@angular/aria/accordion';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Grid, GridCell, GridCellWidget, GridRow } from '@angular/aria/grid';
import { Listbox, Option } from '@angular/aria/listbox';
import { Menu, MenuBar, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

/**
 * Page de démonstration de @angular/aria : un exemple de chaque famille de directives
 * (accordion, tabs, listbox, combobox, menu, toolbar, tree, grid).
 */
@Component({
  selector: 'app-aria',
  imports: [
    NgTemplateOutlet,
    AccordionGroup,
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Grid,
    GridRow,
    GridCell,
    GridCellWidget,
    Listbox,
    Option,
    Menu,
    MenuBar,
    MenuContent,
    MenuItem,
    MenuTrigger,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabContent,
    Toolbar,
    ToolbarWidget,
    ToolbarWidgetGroup,
    Tree,
    TreeItem,
    TreeItemGroup,
  ],
  templateUrl: './aria.html',
})
export class Aria {
  // Accordion
  readonly faq = [
    { titre: "Qu'est-ce que @angular/aria ?", texte: 'Des directives sans style qui ajoutent rôles ARIA, états et navigation clavier.' },
    { titre: 'Faut-il styliser ?', texte: 'Oui : aucune classe CSS n’est fournie, tout le style reste à vous (ici Tailwind).' },
    { titre: 'Le contenu est-il chargé à la demande ?', texte: 'Avec ngAccordionContent, le contenu n’est rendu qu’à l’ouverture du panneau.' },
  ];

  // Tabs
  readonly ongletActif = signal('resume');

  // Listbox
  readonly studios = ['Studio Ghibli', 'Pixar', 'Aardman', 'Cartoon Saloon'];
  readonly studiosChoisis = signal<string[]>(['Studio Ghibli']);

  // Combobox (autocomplétion)
  private readonly tousLesFilms = [
    'Le Château dans le ciel',
    'Le Tombeau des lucioles',
    'Mon voisin Totoro',
    'Kiki la petite sorcière',
    'Porco Rosso',
    'Princesse Mononoké',
    'Le Voyage de Chihiro',
    'Le Château ambulant',
    'Ponyo sur la falaise',
    'Le vent se lève',
  ];
  readonly recherche = signal('');
  readonly rechercheOuverte = signal(false);
  readonly filmChoisi = signal<string[]>([]);
  readonly suggestions = computed(() => {
    const q = this.recherche().trim().toLowerCase();
    return this.tousLesFilms.filter((f) => f.toLowerCase().includes(q));
  });

  // Menu
  readonly derniereAction = signal('—');
  readonly actions = ['Nouveau', 'Ouvrir', 'Enregistrer'];

  // Toolbar
  readonly gras = signal(false);
  readonly italique = signal(false);
  readonly alignement = signal<'gauche' | 'centre' | 'droite'>('gauche');

  // Tree
  readonly arbre: TreeNode[] = [
    {
      name: 'Hayao Miyazaki',
      children: [
        { name: 'Princesse Mononoké' },
        { name: 'Le Voyage de Chihiro' },
        { name: 'Le Château ambulant' },
      ],
    },
    { name: 'Isao Takahata', children: [{ name: 'Le Tombeau des lucioles' }, { name: 'Pompoko' }] },
    { name: 'Hiromasa Yonebayashi', children: [{ name: 'Arrietty' }, { name: 'Souvenirs de Marnie' }] },
  ];
  readonly arbreChoisi = signal<string[]>([]);

  // Grid
  readonly grille = [
    ['Titre', 'Année', 'Score'],
    ['Princesse Mononoké', '1997', '93'],
    ['Le Voyage de Chihiro', '2001', '97'],
    ['Ponyo sur la falaise', '2008', '92'],
  ];
}
