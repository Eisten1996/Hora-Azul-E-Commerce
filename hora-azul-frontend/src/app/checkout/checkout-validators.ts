import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Fecha local de hoy en formato ISO {@code YYYY-MM-DD} (no UTC, para no adelantar el día en Perú). */
export function todayIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Error {@code pastDate} si la fecha {@code YYYY-MM-DD} es anterior a hoy. */
export function notPastDate(today: () => string = todayIsoDate): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null =>
    control.value && control.value < today() ? { pastDate: true } : null;
}

/** Como {@code Validators.required}, pero también rechaza textos de solo espacios. */
export const requiredText: ValidatorFn = (control: AbstractControl<string>) =>
  (control.value ?? '').trim() === '' ? { required: true } : null;

export const PHONE_PATTERN = /^\d{9}$/;
export const PHONE_ERROR_MESSAGE = 'Ingresa un número de teléfono peruano válido de 9 dígitos.';
