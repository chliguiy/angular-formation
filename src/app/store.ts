import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})  
export class Store {
    test = signal('test');
}
