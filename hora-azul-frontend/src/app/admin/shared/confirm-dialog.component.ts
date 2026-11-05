import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/**
 * Diálogo de confirmación. Usa `<dialog>` nativo, que retiene el foco, se cierra con
 * Escape y al cerrarse devuelve el foco al elemento desde el que se abrió.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/50"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      (close)="onNativeClose()"
    >
      <h2 id="confirm-dialog-title" class="text-lg font-semibold text-hora-azul-900">{{ heading() }}</h2>
      <p id="confirm-dialog-message" class="mt-2 text-slate-700">{{ message() }}</p>
      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          autofocus
          class="rounded-lg px-4 py-2 font-medium text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
          (click)="cancelled.emit()"
        >
          {{ cancelLabel() }}
        </button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
          [class]="danger() ? 'bg-red-700 hover:bg-red-800' : 'bg-hora-azul-700 hover:bg-hora-azul-800'"
          (click)="confirmed.emit()"
        >
          {{ confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly danger = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  /** Escape cierra el diálogo sin pasar por los botones. */
  protected onNativeClose(): void {
    if (this.open()) {
      this.cancelled.emit();
    }
  }
}
