import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ServiceFilm } from './film';

describe('Film', () => {
  let service: ServiceFilm;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ServiceFilm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch films', () => {
    let result: unknown;
    service.getFilms().subscribe((f) => (result = f));
    const req = TestBed.inject(HttpTestingController).expectOne('https://ghibliapi.vercel.app/films');
    req.flush([]);
    expect(result).toEqual([]);
  });
});
