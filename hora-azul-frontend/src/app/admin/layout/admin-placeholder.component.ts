import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Página provisional de las secciones del panel que aún no están implementadas. */
@Component({
  selector: 'app-admin-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-3xl uppercase text-hora-azul-900">{{ heading }}</h1>
    <p class="mt-4 text-slate-700">Esta sección estará disponible pronto.</p>
  `,
})
export default class AdminPlaceholderComponent {
  protected readonly heading: string = inject(ActivatedRoute).snapshot.data['heading'];
}
