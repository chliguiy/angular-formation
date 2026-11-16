// home.ts

import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { User } from './user.model';

type UserState =
  | { status: 'loading' }
  | { status: 'success'; user: User }
  | { status: 'error' };

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly http = inject(HttpClient);

  readonly userId = signal(1);

  private readonly reloadTrigger = signal(0);

  private readonly userId$ = toObservable(this.userId);
  private readonly reload$ = toObservable(this.reloadTrigger);

  private readonly userRequest$ = combineLatest([
    this.userId$,
    this.reload$,
  ]).pipe(
    switchMap(([id]) =>
      this.http
        .get<User>(`https://jsonplaceholder.typicode.com/users/${id}`)
        .pipe(
          map((user): UserState => ({
            status: 'success',
            user,
          })),
          startWith<UserState>({
            status: 'loading',
          }),
          catchError(() =>
            of<UserState>({
              status: 'error',
            })
          )
        )
    )
  );
  readonly userState = toSignal(this.userRequest$, {
    initialValue: { status: 'loading' } as UserState,
  });

  previousUser(): void {
    this.userId.update(id => Math.max(1, id - 1));
  }

  nextUser(): void {
    this.userId.update(id => Math.min(10, id + 1));
  }

  reload(): void {
    this.reloadTrigger.update(value => value + 1);
  }
}