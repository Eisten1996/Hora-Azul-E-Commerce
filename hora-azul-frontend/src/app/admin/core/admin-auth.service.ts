import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const SESSION_STORAGE_KEY = 'hora_azul_admin';

interface AdminSession {
  username: string;
  /** Valor de la cabecera {@code Authorization}. */
  authorization: string;
}

/** Cabecera HTTP Basic; los caracteres fuera de Latin-1 se codifican en UTF-8 porque {@code btoa} no los admite. */
export function basicAuthHeader(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  return `Basic ${btoa(String.fromCharCode(...bytes))}`;
}

/**
 * Sesión del administrador.
 *
 * <p>Las credenciales se guardan en {@code sessionStorage}: sobreviven a una recarga
 * y desaparecen al cerrar la pestaña. Sin {@code sessionStorage} la sesión solo vive en memoria.</p>
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AdminSession | null>(readStoredSession());

  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly username = computed(() => this.session()?.username ?? '');
  readonly authorization = computed(() => this.session()?.authorization ?? null);

  /** Valida las credenciales contra el backend y, si son correctas, inicia la sesión. */
  login(username: string, password: string): Observable<void> {
    const authorization = basicAuthHeader(username, password);
    return this.http
      .get<{ username: string }>(`${environment.apiUrl}/api/admin/session`, {
        headers: { Authorization: authorization },
      })
      .pipe(
        tap((response) => {
          const session = { username: response.username, authorization };
          this.session.set(session);
          storeSession(session);
        }),
        map(() => undefined),
      );
  }

  logout(): void {
    this.session.set(null);
    storeSession(null);
  }
}

function readStoredSession(): AdminSession | null {
  try {
    const stored: Partial<AdminSession> | null = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? 'null');
    return typeof stored?.username === 'string' && typeof stored.authorization === 'string'
      ? { username: stored.username, authorization: stored.authorization }
      : null;
  } catch {
    return null;
  }
}

function storeSession(session: AdminSession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Sin sessionStorage la sesión sigue en memoria hasta recargar
  }
}
