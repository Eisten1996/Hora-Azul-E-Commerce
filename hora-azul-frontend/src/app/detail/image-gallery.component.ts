import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { CardImage, ImageType } from '../models';

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  COVER: 'portada',
  OPEN: 'tarjeta desplegada',
  ENVELOPE: 'sobre',
};

/** Galería de la ficha: imagen activa a todo el ancho y miniaturas para cambiarla. */
@Component({
  selector: 'app-image-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-hora-azul-50 ring-1 ring-slate-200">
        @if (active(); as image) {
          <img
            [src]="image.url"
            [alt]="altFor(image)"
            width="800"
            height="600"
            class="h-full w-full object-cover"
            data-testid="gallery-main"
          />
        } @else {
          <div class="flex h-full items-center justify-center text-hora-azul-800" role="img" [attr.aria-label]="cardName() + ', sin imagen'">
            Sin imagen
          </div>
        }
      </div>

      @if (sortedImages().length > 1) {
        <ul class="mt-3 flex gap-3" aria-label="Imágenes de la tarjeta">
          @for (image of sortedImages(); track image.url; let i = $index) {
            <li class="w-20 sm:w-24">
              <button
                type="button"
                class="block aspect-[4/3] w-full overflow-hidden rounded-lg ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
                [class.ring-hora-azul-700]="image === active()"
                [class.ring-transparent]="image !== active()"
                [attr.aria-pressed]="image === active()"
                [attr.aria-label]="'Ver ' + typeLabel(image)"
                (click)="active.set(image)"
              >
                <img [src]="image.url" alt="" width="96" height="72" loading="lazy" class="h-full w-full object-cover" />
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ImageGalleryComponent {
  readonly images = input<CardImage[]>([]);
  readonly cardName = input('');

  protected readonly sortedImages = computed(() =>
    [...this.images()].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  /** Imagen activa: la portada al cargar (o la primera si no hay portada). */
  protected readonly active = linkedSignal<CardImage | undefined>(() => {
    const images = this.sortedImages();
    return images.find((image) => image.imageType === 'COVER') ?? images[0];
  });

  protected typeLabel(image: CardImage): string {
    return IMAGE_TYPE_LABELS[image.imageType];
  }

  protected altFor(image: CardImage): string {
    return `Tarjeta pop-up 3D "${this.cardName()}": ${this.typeLabel(image)}`;
  }
}
