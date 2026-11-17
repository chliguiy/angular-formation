import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validateur ignorant les valeurs vides (à combiner avec Validators.required au besoin). */
function optional(test: (value: string) => boolean, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    return test(String(value)) ? null : { [errorKey]: true };
  };
}

/** URL absolue en http ou https. */
export const httpUrl: ValidatorFn = optional((v) => {
  try {
    const { protocol } = new URL(v);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}, 'httpUrl');

/** Année à 4 chiffres, plausible pour un film (1888 → année en cours + 5). */
export const filmYear: ValidatorFn = optional((v) => {
  if (!/^\d{4}$/.test(v)) return false;
  const year = Number(v);
  return year >= 1888 && year <= new Date().getFullYear() + 5;
}, 'filmYear');

/** Entier strictement positif (ex. durée en minutes). */
export const positiveInteger: ValidatorFn = optional(
  (v) => Number.isInteger(Number(v)) && Number(v) > 0 && !v.includes('.'),
  'positiveInteger',
);
