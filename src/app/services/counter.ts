import { Injectable, Service, signal } from '@angular/core';



@Service({ autoProvided: false })
export class Counter {
      readonly count = signal(0);

  increment(): void {
    this.count.update(value => value + 1);
  }

  decrement(): void {
    this.count.update(value => value - 1);
  }

  reset(): void {
    this.count.set(0);
  }
}
