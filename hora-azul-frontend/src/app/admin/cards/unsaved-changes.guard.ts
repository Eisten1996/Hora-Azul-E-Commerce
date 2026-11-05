import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AdminAuthService } from '../core/admin-auth.service';
import AdminCardFormComponent from './admin-card-form.component';

/** Pide confirmación antes de abandonar el formulario, salvo si la sesión ya se cerró por un 401. */
export const unsavedChangesGuard: CanDeactivateFn<AdminCardFormComponent> = (component) =>
  inject(AdminAuthService).isLoggedIn() ? component.confirmLeave() : true;
