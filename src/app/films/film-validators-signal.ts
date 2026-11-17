import { SchemaPath, validate } from '@angular/forms/signals';

/** Validateurs Signal Forms (ignorent les valeurs vides). */

export function httpUrl(path: SchemaPath<string>): void {
  validate(path, ({ value }) => {
    const v = value();
    if (!v) return null;
    try {
      const { protocol } = new URL(v);
      return protocol === 'http:' || protocol === 'https:' ? null : { kind: 'httpUrl' };
    } catch {
      return { kind: 'httpUrl' };
    }
  });
}

export function filmYear(path: SchemaPath<string>): void {
  validate(path, ({ value }) => {
    const v = value();
    if (!v) return null;
    const year = Number(v);
    const ok = /^\d{4}$/.test(v) && year >= 1888 && year <= new Date().getFullYear() + 5;
    return ok ? null : { kind: 'filmYear' };
  });
}

export function positiveInteger(path: SchemaPath<string>): void {
  validate(path, ({ value }) => {
    const v = value();
    if (!v) return null;
    return /^\d+$/.test(v) && Number(v) > 0 ? null : { kind: 'positiveInteger' };
  });
}
