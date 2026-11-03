import { Pipe, PipeTransform } from '@angular/core';

/** Formatea un importe en soles con dos decimales: {@code 120.5 → "S/. 120.50"}. */
export function formatSoles(amount: number): string {
  return `S/. ${amount.toFixed(2)}`;
}

/** Uso en plantillas: {@code {{ card.price | soles }}}. */
@Pipe({ name: 'soles' })
export class SolesPipe implements PipeTransform {
  transform(amount: number): string {
    return formatSoles(amount);
  }
}
