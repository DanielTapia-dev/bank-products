import type { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../../shared/components/toast/services/toast.service';
import { catchError, throwError } from 'rxjs';

interface BackendError {
  message?: string;
  errors?: Record<string, string | { message: string }>;
}

const MESSAGES = {
  network: 'Sin conexión con el servidor',
  unexpected: 'Error inesperado',
  notFound: 'No se encontró el recurso solicitado.',
  invalidData: 'Datos inválidos.',
  unknown: 'Ocurrió un error',
};

function actionFrom(
  req: HttpRequest<unknown>,
): 'create' | 'update' | 'delete' | 'verify' | 'other' {
  const { url, method } = req;
  const m = method.toUpperCase();
  if (url.includes('/bp/products/verification/')) return 'verify';
  if (url.includes('/bp/products')) {
    if (m === 'POST') return 'create';
    if (m === 'PUT') return 'update';
    if (m === 'DELETE') return 'delete';
  }
  return 'other';
}

function friendlyPrefix(action: ReturnType<typeof actionFrom>): string {
  const base = 'No se pudo';
  switch (action) {
    case 'create':
      return `${base} crear el producto`;
    case 'update':
      return `${base} actualizar el producto`;
    case 'delete':
      return `${base} eliminar el producto`;
    case 'verify':
      return `${base} verificar el ID`;
    default:
      return MESSAGES.unknown;
  }
}

function extractBackendMessage(err: HttpErrorResponse): string | null {
  const body = err?.error as BackendError | string | null;
  if (!body) return null;

  if (typeof body === 'string') return body;

  if (body.message) return body.message;

  if (body.errors) {
    const values = Object.values(body.errors);
    const messages = values
      .map((v) => (typeof v === 'string' ? v : v?.message))
      .filter((t): t is string => Boolean(t));

    return messages.join(' · ') || null;
  }

  return null;
}

function composeMessage(prefix: string, detail?: string | null): string {
  const p = prefix.trim().replace(/[.:]+$/, '');
  const d = (detail ?? '').trim();
  return !d || d.toLowerCase().startsWith(p.toLowerCase()) ? p : `${p}. ${d}`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const action = actionFrom(req);
      const prefix = friendlyPrefix(action);

      let detail =
        extractBackendMessage(err) ||
        (err.status === 0 ? MESSAGES.network : err.statusText || MESSAGES.unexpected);

      if (err.status === 400 && action === 'create') {
        detail = MESSAGES.invalidData;
      }
      if (err.status === 404 && (action === 'update' || action === 'delete')) {
        detail = MESSAGES.notFound;
      }

      toast.error(composeMessage(prefix, detail));

      return throwError(() => err);
    }),
  );
};
