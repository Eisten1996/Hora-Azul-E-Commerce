import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { safeReturnUrl } from '../core/admin-auth.guard';
import { AdminAuthService } from '../core/admin-auth.service';

type FieldName = 'username' | 'password';

/** Formulario de acceso al panel administrativo. */
@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen items-center justify-center bg-hora-azul-50 px-4 py-10">
      <form
        class="w-full max-w-sm space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        aria-labelledby="admin-login-title"
      >
        <div class="text-center">
          <img src="brand/hora-azul-logo-112.webp" alt="" width="123" height="112" class="mx-auto h-16 w-auto rounded-md" />
          <h1 id="admin-login-title" class="mt-3 font-display text-2xl uppercase tracking-wider text-hora-azul-900">Panel de Hora Azul</h1>
        </div>

        @if (sessionExpired() && !error()) {
          <p class="rounded-lg border border-hora-azul-200 bg-hora-azul-50 px-4 py-3 text-sm text-hora-azul-900" role="status">
            Tu sesión expiró. Vuelve a ingresar.
          </p>
        }

        <div>
          <label for="username" class="block text-sm font-semibold text-slate-900">Usuario</label>
          <input id="username" type="text" formControlName="username" autocomplete="username" autocapitalize="none" spellcheck="false"
            class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 focus:outline-2 focus:outline-hora-azul-600/30"
            [class]="showError('username') ? 'border-red-700' : 'border-slate-300'"
            [attr.aria-invalid]="showError('username')"
            [attr.aria-describedby]="showError('username') ? 'username-error' : null" />
          @if (showError('username')) {
            <p id="username-error" class="mt-1 text-sm text-red-800">Ingresa tu usuario.</p>
          }
        </div>

        <div>
          <label for="password" class="block text-sm font-semibold text-slate-900">Contraseña</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password"
            class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 focus:outline-2 focus:outline-hora-azul-600/30"
            [class]="showError('password') ? 'border-red-700' : 'border-slate-300'"
            [attr.aria-invalid]="showError('password')"
            [attr.aria-describedby]="showError('password') ? 'password-error' : null" />
          @if (showError('password')) {
            <p id="password-error" class="mt-1 text-sm text-red-800">Ingresa tu contraseña.</p>
          }
        </div>

        @if (error()) {
          <p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{{ error() }}</p>
        }

        <button
          type="submit"
          class="w-full rounded-xl bg-hora-azul-700 px-6 py-3 font-semibold text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-wait disabled:opacity-70"
          [disabled]="sending()"
        >
          {{ sending() ? 'Ingresando…' : 'Ingresar' }}
        </button>
        @if (sending()) {
          <p class="text-center text-sm text-slate-600" role="status">Si el servidor estaba en reposo, puede tardar hasta un minuto.</p>
        }
      </form>
    </main>
  `,
})
export default class AdminLoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');
  protected readonly sessionExpired = signal(this.route.snapshot.queryParamMap.get('sesion') === 'expirada');

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected showError(field: FieldName): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted()) && !this.error();
  }

  protected submit(): void {
    this.submitted.set(true);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focus(this.form.controls.username.invalid ? 'username' : 'password');
      return;
    }
    if (this.sending()) {
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.sending.set(true);
    this.auth
      .login(username.trim(), password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
        },
        error: (error: HttpErrorResponse) => {
          this.sending.set(false);
          if (error.status === 401 || error.status === 403) {
            this.error.set('Usuario o contraseña incorrectos.');
            this.form.controls.password.reset();
            this.submitted.set(false);
            this.focus('password');
          } else {
            this.error.set('El servidor no está disponible. Inténtalo de nuevo en unos segundos.');
          }
        },
      });
  }

  private focus(field: FieldName): void {
    this.host.nativeElement.querySelector<HTMLElement>(`#${field}`)?.focus();
  }
}
