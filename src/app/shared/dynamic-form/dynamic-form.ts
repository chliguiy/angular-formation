import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldConfig } from './dynamic-form.model';

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

/** Formulaire généré à partir d'une configuration (input, select, textarea, liste dynamique). */
@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic-form.html',
})
export class DynamicForm {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly fields = input.required<FieldConfig[]>();
  readonly submitLabel = input('Valider');
  /** Valeur brute du formulaire, émise uniquement s'il est valide. */
  readonly submitted = output<Record<string, unknown>>();

  protected readonly inputClass = INPUT_CLASS;
  protected wasSubmitted = false;

  /** Le groupe est reconstruit si la configuration change. */
  readonly form = computed(() => {
    const controls: Record<string, AbstractControl> = {};
    for (const f of this.fields()) {
      controls[f.name] =
        f.type === 'array'
          ? this.fb.array((f.value?.length ? f.value : ['']).map((v) => this.fb.control(v, Validators.required)))
          : this.fb.control(f.value ?? '', f.validators ?? []);
    }
    return new FormGroup(controls);
  });

  protected control(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }

  protected array(name: string): FormArray<FormControl<string>> {
    return this.form().get(name) as FormArray<FormControl<string>>;
  }

  protected addItem(name: string): void {
    this.array(name).push(this.fb.control('', Validators.required));
  }

  protected removeItem(name: string, i: number): void {
    this.array(name).removeAt(i);
  }

  protected showError(c: AbstractControl): boolean {
    return c.invalid && (c.touched || this.wasSubmitted);
  }

  /** Premier message d'erreur : config du champ, sinon message par défaut. */
  protected message(c: AbstractControl, custom?: Record<string, string>): string {
    const key = Object.keys(c.errors ?? {})[0];
    if (!key) return '';
    if (custom?.[key]) return custom[key];
    const e = c.errors?.[key];
    switch (key) {
      case 'required':
        return 'Champ obligatoire';
      case 'minlength':
        return `Trop court (min. ${e.requiredLength})`;
      case 'maxlength':
        return `Trop long (max. ${e.requiredLength})`;
      case 'min':
        return `Valeur minimale : ${e.min}`;
      case 'max':
        return `Valeur maximale : ${e.max}`;
      default:
        return 'Valeur invalide';
    }
  }

  protected submit(): void {
    this.wasSubmitted = true;
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.submitted.emit(form.getRawValue());
  }
}
