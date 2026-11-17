import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Film } from './film.model';

/** Hero slider : diaporama plein largeur des bannières de films (auto-play, flèches, points). */
@Component({
  selector: 'app-films-hero',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (slides().length) {
      <section
        class="relative mb-6 h-64 overflow-hidden rounded-xl bg-slate-900 sm:h-80 lg:h-[26rem]"
        aria-roledescription="carousel"
        aria-label="Films à l'affiche"
        (mouseenter)="paused.set(true)"
        (mouseleave)="paused.set(false)"
        (focusin)="paused.set(true)"
        (focusout)="paused.set(false)"
      >
        @for (f of slides(); track f.id; let i = $index) {
          <div
            class="absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none"
            [class.opacity-0]="i !== index()"
            [class.pointer-events-none]="i !== index()"
            role="group"
            aria-roledescription="slide"
            [attr.aria-label]="i + 1 + ' sur ' + slides().length"
            [attr.aria-hidden]="i !== index()"
          >
            <img
              [src]="f.movie_banner"
              [alt]="f.title"
              width="1920"
              height="800"
              decoding="async"
              [attr.loading]="i === 0 ? 'eager' : 'lazy'"
              [attr.fetchpriority]="i === 0 ? 'high' : null"
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute inset-x-0 bottom-0 p-6 pb-12 text-white sm:p-10 sm:pb-14">
              <p class="text-xs uppercase tracking-wider text-white/70">
                {{ f.release_date }} · {{ f.director }}
              </p>
              <h2 class="mt-1 text-2xl font-bold sm:text-4xl">{{ f.title }}</h2>
              <p class="mt-2 line-clamp-2 max-w-2xl text-sm text-white/85 sm:text-base">
                {{ f.description }}
              </p>
              <a
                [routerLink]="['/films', f.id]"
                [attr.tabindex]="i === index() ? 0 : -1"
                class="mt-4 inline-block rounded-lg bg-white px-5 py-2 text-sm font-medium text-slate-900
                       hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                Voir le film
              </a>
            </div>
          </div>
        }

        <button
          type="button"
          (click)="prev()"
          aria-label="Film précédent"
          class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white
                 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="next()"
          aria-label="Film suivant"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white
                 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7.3 15.7a1 1 0 0 1 0-1.4L11.6 10 7.3 5.7a1 1 0 0 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4 0Z" />
          </svg>
        </button>

        <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          @for (f of slides(); track f.id; let i = $index) {
            <button
              type="button"
              (click)="go(i)"
              [attr.aria-label]="'Aller au film ' + f.title"
              [attr.aria-current]="i === index()"
              class="h-2 rounded-full transition-all"
              [class]="i === index() ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'"
            ></button>
          }
        </div>
      </section>
    }
  `,
})
export class FilmsHero {
  readonly films = input.required<Film[]>();
  /** Nombre de slides et délai d'auto-play (ms). */
  readonly count = input(5);
  readonly interval = input(5000);

  protected readonly paused = signal(false);
  protected readonly index = signal(0);

  /** Les films les mieux notés. */
  protected readonly slides = computed(() =>
    [...this.films()]
      .sort((a, b) => Number(b.rt_score) - Number(a.rt_score))
      .slice(0, this.count()),
  );

  constructor() {
    // Auto-play côté navigateur uniquement (pas de timer pendant le SSR)
    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      const id = setInterval(() => {
        if (!this.paused()) this.next();
      }, this.interval());
      inject(DestroyRef).onDestroy(() => clearInterval(id));
    });
  }

  protected next(): void {
    this.index.update((i) => (i + 1) % this.slides().length);
  }
  protected prev(): void {
    this.index.update((i) => (i - 1 + this.slides().length) % this.slides().length);
  }
  protected go(i: number): void {
    this.index.set(i);
  }
}
