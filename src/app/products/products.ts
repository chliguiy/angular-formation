import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products {
  products: Array<{ id: number; name: string; description: string; selected: boolean }> = [];
  toggleSelected(product: any): void {
    product.selected = !product.selected;
  }
  constructor() {}
  ngOnInit(): void {
    console.log('Products component initialized');
    this.products = [
      { id: 1, name: 'Product 1', description: 'Description of Product 1', selected: true },
      { id: 2, name: 'Product 2', description: 'Description of Product 2', selected: false },
      { id: 3, name: 'Product 3', description: 'Description of Product 3', selected: true },
      { id: 4, name: 'Product 4', description: 'Description of Product 4', selected: true },
      { id: 5, name: 'Product 5', description: 'Description of Product 5', selected: false },
      { id: 6, name: 'Product 6', description: 'Description of Product 6', selected: true },
      { id: 7, name: 'Product 7', description: 'Description of Product 7', selected: true },
      { id: 8, name: 'Product 8', description: 'Description of Product 8', selected: false },
      { id: 9, name: 'Product 9', description: 'Description of Product 9', selected: false },
      { id: 10, name: 'Product 10', description: 'Description of Product 10', selected: false },
    ];
  }
}
