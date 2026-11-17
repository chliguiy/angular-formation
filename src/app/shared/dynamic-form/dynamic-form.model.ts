import { ValidatorFn } from '@angular/forms';

interface BaseField {
  /** Nom du contrôle dans le FormGroup. */
  name: string;
  label: string;
  /** Occupe toute la largeur de la grille. */
  wide?: boolean;
  validators?: ValidatorFn[];
  /** Messages d'erreur par clé de validateur (surchargent les messages par défaut). */
  errors?: Record<string, string>;
}

export interface InputField extends BaseField {
  type: 'input';
  inputType?: 'text' | 'number' | 'url' | 'email' | 'date';
  placeholder?: string;
  value?: string | number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
  placeholder?: string;
  value?: string;
}

/** Liste dynamique de champs texte (FormArray) : ajout / suppression de lignes. */
export interface ArrayField extends BaseField {
  type: 'array';
  placeholder?: string;
  addLabel?: string;
  value?: string[];
}

export type FieldConfig = InputField | SelectField | TextareaField | ArrayField;
