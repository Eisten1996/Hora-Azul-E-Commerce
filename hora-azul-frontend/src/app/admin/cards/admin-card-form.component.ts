import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { formatSoles } from '../../core/money';
import { CARD_CATEGORY_LABELS, CardCategory, CardDetail, CardImage, ImageType } from '../../models';
import { AdminCardService, CardPayload, nextCatalogNumber } from '../core/admin-card.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

export const MAX_IMAGES = 10;

const PRICES = [15, 17, 20, 30];
const MAX_CATALOG_NUMBER = 2147483647;
/** Rechaza textos formados solo por espacios, igual que `@NotBlank` en el backend. */
const NOT_BLANK = Validators.pattern(/\S/);

const IMAGE_TYPES: { value: ImageType; label: string }[] = [
  { value: 'COVER', label: 'Vista principal' },
  { value: 'OPEN', label: 'Tarjeta abierta' },
  { value: 'ENVELOPE', label: 'Tarjeta cerrada' },
];

type ImageRow = FormGroup<{ url: FormControl<string>; imageType: FormControl<ImageType> }>;
type FieldName = 'catalogNumber' | 'name' | 'categories' | 'price' | 'dimensions' | 'description3d';

const FIELD_MESSAGES: Record<FieldName, Record<string, string>> = {
  catalogNumber: {
    conflict: 'Este número de catálogo ya está en uso. Elige otro.',
    default: 'Indica un número entero mayor o igual a 1.',
  },
  name: { maxlength: 'El nombre no puede superar 150 caracteres.', default: 'Indica el nombre de la tarjeta.' },
  categories: { default: 'Elige al menos una categoría.' },
  price: { default: 'Elige un precio.' },
  dimensions: { default: 'Las dimensiones no pueden superar 50 caracteres.' },
  description3d: { default: 'La descripción no puede superar 300 caracteres.' },
};

/** Formulario de alta y edición de una tarjeta. */
@Component({
  selector: 'app-admin-card-form',
  imports: [ConfirmDialogComponent, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'warnBeforeUnload($event)' },
  template: `
    <a
      routerLink="/admin/tarjetas"
      class="inline-block rounded-lg px-2 py-1.5 font-medium text-hora-azul-700 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-hora-azul-600"
    >
      ← Volver a tarjetas
    </a>

    @switch (status()) {
      @case ('loading') {
        <p class="mt-6 text-slate-700" role="status" aria-busy="true">Cargando tarjeta…</p>
      }
      @case ('not-found') {
        <div class="mt-6 rounded-xl bg-white px-6 py-10 text-center ring-1 ring-slate-200">
          <h1 class="text-xl font-semibold text-hora-azul-900">Tarjeta no encontrada</h1>
          <a routerLink="/admin/tarjetas" class="mt-4 inline-block font-medium text-hora-azul-700 underline">Ir al listado</a>
        </div>
      }
      @case ('error') {
        <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
          <p class="font-medium text-red-900">No pudimos cargar esta tarjeta.</p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
            (click)="load()"
          >
            Reintentar
          </button>
        </div>
      }
      @default {
        <div class="mt-2 flex flex-wrap items-center gap-3">
          <h1 class="font-display text-3xl uppercase text-hora-azul-900">{{ cardId ? 'Editar tarjeta' : 'Nueva tarjeta' }}</h1>
          @if (inactive()) {
            <span class="rounded-full bg-slate-200 px-2.5 py-1 text-sm font-medium text-slate-800">Inactiva: no se ve en la tienda</span>
          }
        </div>

        <form class="mt-6 max-w-3xl space-y-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="grid gap-6 sm:grid-cols-[10rem_1fr]">
            <div>
              <label for="catalogNumber" class="block text-sm font-semibold text-slate-900">Número de catálogo</label>
              <input id="catalogNumber" type="number" min="1" step="1" formControlName="catalogNumber"
                class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 disabled:bg-slate-100 disabled:text-slate-700"
                [class]="errorFor('catalogNumber') ? 'border-red-700' : 'border-slate-300'"
                [attr.aria-invalid]="!!errorFor('catalogNumber')"
                [attr.aria-describedby]="errorFor('catalogNumber') ? 'catalogNumber-error' : null" />
              @if (errorFor('catalogNumber'); as message) {
                <p id="catalogNumber-error" class="mt-1 text-sm text-red-800">{{ message }}</p>
              }
            </div>
            <div>
              <label for="name" class="block text-sm font-semibold text-slate-900">Nombre</label>
              <input id="name" type="text" maxlength="150" formControlName="name"
                class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900"
                [class]="errorFor('name') ? 'border-red-700' : 'border-slate-300'"
                [attr.aria-invalid]="!!errorFor('name')"
                [attr.aria-describedby]="errorFor('name') ? 'name-error' : null" />
              @if (errorFor('name'); as message) {
                <p id="name-error" class="mt-1 text-sm text-red-800">{{ message }}</p>
              }
            </div>
          </div>

          <fieldset [attr.aria-describedby]="errorFor('categories') ? 'categories-error' : null">
            <legend class="text-sm font-semibold text-slate-900">Categorías</legend>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              @for (category of categoryOptions; track category.value) {
                <label class="flex items-center gap-2 text-slate-900">
                  <input type="checkbox" class="h-5 w-5 accent-hora-azul-700"
                    [id]="'category-' + category.value"
                    [checked]="form.controls.categories.value.includes(category.value)"
                    (change)="toggleCategory(category.value, $any($event.target).checked)" />
                  {{ category.label }}
                </label>
              }
            </div>
            @if (errorFor('categories'); as message) {
              <p id="categories-error" class="mt-1 text-sm text-red-800">{{ message }}</p>
            }
          </fieldset>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="price" class="block text-sm font-semibold text-slate-900">Precio</label>
              <select id="price" formControlName="price"
                class="mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900"
                [class]="errorFor('price') ? 'border-red-700' : 'border-slate-300'"
                [attr.aria-invalid]="!!errorFor('price')"
                [attr.aria-describedby]="errorFor('price') ? 'price-error' : null">
                <option [ngValue]="null">Elige un precio</option>
                @for (price of priceOptions; track price.value) {
                  <option [ngValue]="price.value">{{ price.label }}</option>
                }
              </select>
              @if (errorFor('price'); as message) {
                <p id="price-error" class="mt-1 text-sm text-red-800">{{ message }}</p>
              }
            </div>
            <div>
              <label for="dimensions" class="block text-sm font-semibold text-slate-900">Dimensiones (opcional)</label>
              <input id="dimensions" type="text" formControlName="dimensions"
                class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900"
                [class]="errorFor('dimensions') ? 'border-red-700' : 'border-slate-300'"
                [attr.aria-invalid]="!!errorFor('dimensions')"
                [attr.aria-describedby]="errorFor('dimensions') ? 'dimensions-error' : null" />
              @if (errorFor('dimensions'); as message) {
                <p id="dimensions-error" class="mt-1 text-sm text-red-800">{{ message }}</p>
              }
            </div>
          </div>

          <div>
            <label for="description3d" class="block text-sm font-semibold text-slate-900">Descripción 3D (opcional)</label>
            <textarea id="description3d" rows="3" formControlName="description3d"
              class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900"
              [class]="errorFor('description3d') ? 'border-red-700' : 'border-slate-300'"
              [attr.aria-invalid]="!!errorFor('description3d')"
              [attr.aria-describedby]="errorFor('description3d') ? 'description3d-error' : null"></textarea>
            @if (errorFor('description3d'); as message) {
              <p id="description3d-error" class="mt-1 text-sm text-red-800">{{ message }}</p>
            }
          </div>

          <label class="flex items-center gap-2 text-slate-900">
            <input type="checkbox" formControlName="envelopeIncluded" class="h-5 w-5 accent-hora-azul-700" />
            Incluye sobre
          </label>

          <section aria-labelledby="images-title">
            <h2 id="images-title" class="text-sm font-semibold text-slate-900">Imágenes ({{ form.controls.images.length }} de {{ maxImages }})</h2>
            <p class="mt-1 text-sm text-slate-700">
              Pega la dirección de cada foto, por ejemplo <code>/cards/01-0.webp</code> o <code>https://…</code>. La tienda las muestra en este orden.
            </p>

            <ul formArrayName="images" class="mt-3 space-y-3">
              @for (row of form.controls.images.controls; track row; let i = $index; let last = $last) {
                <li class="flex flex-wrap gap-4 rounded-xl bg-white p-4 ring-1 ring-slate-200" [formGroupName]="i">
                  <div class="h-[72px] w-24 shrink-0 overflow-hidden rounded-lg bg-hora-azul-50">
                    @if (previewOf(row); as url) {
                      <img [src]="url" [alt]="'Vista previa de la imagen ' + (i + 1)" width="96" height="72"
                        class="h-full w-full object-cover" (error)="markBroken(url)" (load)="markLoaded(url)" />
                    }
                  </div>
                  <div class="min-w-0 flex-1 basis-56 space-y-3">
                    <div>
                      <label [for]="'image-url-' + i" class="block text-sm font-semibold text-slate-900">Dirección de la imagen {{ i + 1 }}</label>
                      <input [id]="'image-url-' + i" type="text" inputmode="url" maxlength="500" autocapitalize="none" spellcheck="false" formControlName="url"
                        class="mt-1 w-full rounded-lg border px-3 py-2 text-slate-900"
                        [class]="urlInvalid(row) ? 'border-red-700' : 'border-slate-300'"
                        [attr.aria-invalid]="urlInvalid(row)"
                        [attr.aria-describedby]="urlInvalid(row) ? 'image-error-' + i : null"
                        (blur)="commitPreview(row)" />
                      @if (urlInvalid(row)) {
                        <p [id]="'image-error-' + i" class="mt-1 text-sm text-red-800">Indica la dirección de la imagen o quítala.</p>
                      } @else if (isBroken(row)) {
                        <p class="mt-1 text-sm text-amber-900" role="status">Esta imagen no carga. Puedes guardar igual, pero revisa la dirección.</p>
                      }
                    </div>
                    <div class="flex flex-wrap items-end gap-2">
                      <div class="min-w-40 flex-1">
                        <label [for]="'image-type-' + i" class="block text-sm font-semibold text-slate-900">Tipo</label>
                        <select [id]="'image-type-' + i" formControlName="imageType" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900">
                          @for (type of imageTypes; track type.value) {
                            <option [value]="type.value">{{ type.label }}</option>
                          }
                        </select>
                      </div>
                      <button type="button" [id]="'image-up-' + i" [disabled]="i === 0" [attr.aria-label]="'Subir imagen ' + (i + 1)"
                        class="rounded-lg px-3 py-2 text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-not-allowed disabled:opacity-40"
                        (click)="moveImage(i, -1)">↑</button>
                      <button type="button" [id]="'image-down-' + i" [disabled]="last" [attr.aria-label]="'Bajar imagen ' + (i + 1)"
                        class="rounded-lg px-3 py-2 text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-not-allowed disabled:opacity-40"
                        (click)="moveImage(i, 1)">↓</button>
                      <button type="button" [attr.aria-label]="'Quitar imagen ' + (i + 1)"
                        class="rounded-lg px-3 py-2 text-red-800 ring-1 ring-slate-300 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
                        (click)="removeImage(i)">Quitar</button>
                    </div>
                  </div>
                </li>
              }
            </ul>

            <button type="button" id="add-image" [disabled]="form.controls.images.length >= maxImages"
              class="mt-3 rounded-lg px-4 py-2 font-medium text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-not-allowed disabled:opacity-50"
              (click)="addImage()">
              {{ form.controls.images.length >= maxImages ? 'Máximo de ' + maxImages + ' imágenes' : 'Agregar imagen' }}
            </button>
          </section>

          @if (formError()) {
            <p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{{ formError() }}</p>
          }

          <div class="flex flex-wrap gap-3">
            <button type="submit" [disabled]="saving()"
              class="rounded-xl bg-hora-azul-700 px-6 py-3 font-semibold text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-wait disabled:opacity-70">
              {{ saving() ? 'Guardando…' : 'Guardar' }}
            </button>
            <a routerLink="/admin/tarjetas"
              class="rounded-xl px-6 py-3 font-semibold text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600">
              Cancelar
            </a>
          </div>
        </form>
      }
    }

    <app-confirm-dialog
      [open]="leaving()"
      heading="¿Salir sin guardar?"
      message="Se perderán los cambios que hiciste en esta tarjeta."
      confirmLabel="Salir sin guardar"
      cancelLabel="Seguir editando"
      [danger]="true"
      (confirmed)="resolveLeave(true)"
      (cancelled)="resolveLeave(false)"
    />
  `,
})
export default class AdminCardFormComponent {
  private readonly service = inject(AdminCardService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cardId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  protected readonly maxImages = MAX_IMAGES;
  protected readonly imageTypes = IMAGE_TYPES;
  protected readonly priceOptions = PRICES.map((value) => ({ value, label: formatSoles(value) }));
  protected readonly categoryOptions = (Object.keys(CARD_CATEGORY_LABELS) as CardCategory[]).map((value) => ({
    value,
    label: CARD_CATEGORY_LABELS[value],
  }));

  protected readonly status = signal<'loading' | 'ready' | 'not-found' | 'error'>(this.cardId ? 'loading' : 'ready');
  protected readonly inactive = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal('');
  protected readonly leaving = signal(false);
  private readonly previews = signal<ReadonlyMap<ImageRow, string>>(new Map());
  private readonly brokenUrls = signal<ReadonlySet<string>>(new Set());
  private resolveLeaving: ((leave: boolean) => void) | null = null;

  protected readonly form = this.fb.group({
    catalogNumber: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(MAX_CATALOG_NUMBER),
      Validators.pattern(/^\d+$/),
    ]),
    name: this.fb.control('', [Validators.required, NOT_BLANK, Validators.maxLength(150)]),
    categories: this.fb.control<CardCategory[]>([], Validators.required),
    price: this.fb.control<number | null>(null, Validators.required),
    dimensions: this.fb.control('', Validators.maxLength(50)),
    description3d: this.fb.control('', Validators.maxLength(300)),
    envelopeIncluded: this.fb.control(true),
    images: this.fb.array<ImageRow>([]),
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    if (this.cardId) {
      this.loadCard(this.cardId);
    } else {
      this.proposeCatalogNumber();
    }
  }

  private loadCard(id: string): void {
    this.status.set('loading');
    this.form.controls.catalogNumber.disable();
    this.service
      .get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (card) => {
          this.fill(card);
          this.status.set('ready');
        },
        error: (error: HttpErrorResponse) => {
          this.status.set(error.status === 404 || error.status === 400 ? 'not-found' : 'error');
        },
      });
  }

  /** Si no se puede consultar el catálogo, el campo queda vacío para escribir el número a mano. */
  private proposeCatalogNumber(): void {
    this.service
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cards) => {
          const control = this.form.controls.catalogNumber;
          if (!control.dirty) {
            control.setValue(nextCatalogNumber(cards));
          }
        },
        error: () => undefined,
      });
  }

  private fill(card: CardDetail): void {
    this.inactive.set(!card.active);
    this.form.patchValue({
      catalogNumber: card.catalogNumber,
      name: card.name,
      categories: card.categories,
      price: card.price,
      dimensions: card.dimensions ?? '',
      description3d: card.description3d ?? '',
      envelopeIncluded: card.envelopeIncluded,
    });
    const images = this.form.controls.images;
    images.clear();
    [...card.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((image) => images.push(this.imageRow(image.url, image.imageType)));
    this.form.markAsPristine();
  }

  private imageRow(url: string, imageType: ImageType): ImageRow {
    const row: ImageRow = this.fb.group({
      url: this.fb.control(url, [Validators.required, NOT_BLANK, Validators.maxLength(500)]),
      imageType: this.fb.control(imageType),
    });
    this.commitPreview(row);
    return row;
  }

  // ---------------------------------------------------------------------------
  // Errores
  // ---------------------------------------------------------------------------

  protected errorFor(field: FieldName): string {
    const control = this.form.controls[field];
    if (!control.invalid || !(control.touched || this.submitted())) {
      return '';
    }
    const messages = FIELD_MESSAGES[field];
    const key = Object.keys(control.errors ?? {}).find((error) => error in messages);
    return messages[key ?? 'default'];
  }

  protected urlInvalid(row: ImageRow): boolean {
    const control = row.controls.url;
    return control.invalid && (control.touched || this.submitted());
  }

  private focusFirstInvalid(): void {
    const { catalogNumber, name, categories, price, dimensions, description3d, images } = this.form.controls;
    const invalidRow = images.controls.findIndex((row) => row.controls.url.invalid);
    const id = catalogNumber.invalid
      ? 'catalogNumber'
      : name.invalid
        ? 'name'
        : categories.invalid
          ? `category-${this.categoryOptions[0].value}`
          : price.invalid
            ? 'price'
            : dimensions.invalid
              ? 'dimensions'
              : description3d.invalid
                ? 'description3d'
                : `image-url-${invalidRow}`;
    this.focusById(id);
  }

  private focusById(id: string): void {
    this.host.nativeElement.querySelector<HTMLElement>(`[id="${id}"]`)?.focus();
  }

  // ---------------------------------------------------------------------------
  // Categorías e imágenes
  // ---------------------------------------------------------------------------

  protected toggleCategory(category: CardCategory, checked: boolean): void {
    const control = this.form.controls.categories;
    const selected = new Set(control.value);
    if (checked) {
      selected.add(category);
    } else {
      selected.delete(category);
    }
    control.setValue(this.categoryOptions.map((option) => option.value).filter((value) => selected.has(value)));
    control.markAsDirty();
    control.markAsTouched();
  }

  protected addImage(): void {
    const images = this.form.controls.images;
    if (images.length >= MAX_IMAGES) {
      return;
    }
    // La primera imagen suele ser la portada
    images.push(this.imageRow('', images.length === 0 ? 'COVER' : 'OPEN'));
    images.markAsDirty();
    this.afterRender(() => this.focusById(`image-url-${images.length - 1}`));
  }

  protected removeImage(index: number): void {
    const images = this.form.controls.images;
    images.removeAt(index);
    images.markAsDirty();
    this.afterRender(() => this.focusById('add-image'));
  }

  protected moveImage(index: number, offset: -1 | 1): void {
    const images = this.form.controls.images;
    const target = index + offset;
    const row = images.at(index);
    images.removeAt(index);
    images.insert(target, row);
    images.markAsDirty();
    // Mover el elemento en el DOM le quita el foco; en los extremos su botón queda deshabilitado
    const atEdge = offset === -1 ? target === 0 : target === images.length - 1;
    const direction = offset === -1 === !atEdge ? 'up' : 'down';
    this.afterRender(() => this.focusById(`image-${direction}-${target}`));
  }

  private afterRender(callback: () => void): void {
    afterNextRender(callback, { injector: this.injector });
  }

  /** La vista previa se actualiza al salir del campo, para no pedir la imagen con cada tecla. */
  protected commitPreview(row: ImageRow): void {
    this.previews.update((previews) => new Map(previews).set(row, row.controls.url.value.trim()));
  }

  protected previewOf(row: ImageRow): string {
    return this.previews().get(row) ?? '';
  }

  protected isBroken(row: ImageRow): boolean {
    return this.brokenUrls().has(this.previewOf(row));
  }

  protected markBroken(url: string): void {
    this.brokenUrls.update((urls) => new Set(urls).add(url));
  }

  protected markLoaded(url: string): void {
    this.brokenUrls.update((urls) => {
      const next = new Set(urls);
      next.delete(url);
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // Guardado
  // ---------------------------------------------------------------------------

  protected submit(): void {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    if (this.saving()) {
      return;
    }

    const payload = this.payload();
    const name = payload.name;
    const request = this.cardId
      ? this.service.update(this.cardId, payload)
      : this.service.create({ ...payload, catalogNumber: this.form.controls.catalogNumber.value! });

    this.saving.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.form.markAsPristine();
        this.service.setNotice(`"${name}" se ${this.cardId ? 'actualizó' : 'creó'} correctamente.`);
        void this.router.navigateByUrl('/admin/tarjetas');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.handleSaveError(error);
      },
    });
  }

  private payload(): CardPayload {
    const value = this.form.getRawValue();
    const images: CardImage[] = value.images.map((image, sortOrder) => ({
      url: image.url.trim(),
      imageType: image.imageType,
      sortOrder,
    }));
    return {
      name: value.name.trim(),
      categories: value.categories,
      price: value.price!,
      dimensions: value.dimensions.trim() || null,
      description3d: value.description3d.trim() || null,
      envelopeIncluded: value.envelopeIncluded,
      images,
    };
  }

  private handleSaveError(error: HttpErrorResponse): void {
    if (error.status === 409) {
      this.form.controls.catalogNumber.setErrors({ conflict: true });
      this.focusById('catalogNumber');
    } else if (error.status === 422 || error.status === 400) {
      this.formError.set(error.error?.message ?? 'Revisa los datos de la tarjeta.');
    } else if (error.status === 404) {
      this.formError.set('Esta tarjeta ya no existe.');
    } else if (error.status !== 401) {
      this.formError.set('No se pudo guardar. Comprueba la conexión e inténtalo de nuevo; lo que escribiste sigue aquí.');
    }
  }

  // ---------------------------------------------------------------------------
  // Salir con cambios sin guardar
  // ---------------------------------------------------------------------------

  /** Usado por {@code unsavedChangesGuard}: pregunta solo si hay cambios sin guardar. */
  confirmLeave(): boolean | Promise<boolean> {
    if (!this.form.dirty) {
      return true;
    }
    this.leaving.set(true);
    return new Promise((resolve) => (this.resolveLeaving = resolve));
  }

  protected resolveLeave(leave: boolean): void {
    this.leaving.set(false);
    this.resolveLeaving?.(leave);
    this.resolveLeaving = null;
  }

  protected warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.form.dirty) {
      event.preventDefault();
    }
  }
}
