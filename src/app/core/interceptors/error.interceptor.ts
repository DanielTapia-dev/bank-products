import type { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../../shared/toast/services/toast.service';
import { catchError, throwError } from 'rxjs';

function actionFrom(
  req: HttpRequest<unknown>,
): 'create' | 'update' | 'delete' | 'verify' | 'other' {
  const url = req.url;
  const method = req.method.toUpperCase();

  if (url.includes('/bp/products/verification/')) return 'verify';
  if (url.includes('/bp/products')) {
    if (method === 'POST') return 'create';
    if (method === 'PUT') return 'update';
    if (method === 'DELETE') return 'delete';
  }
  return 'other';
}

function friendlyPrefix(action: ReturnType<typeof actionFrom>) {
  switch (action) {
    case 'create':
      return 'No se pudo crear el producto';
    case 'update':
      return 'No se pudo actualizar el producto';
    case 'delete':
      return 'No se pudo eliminar el producto';
    case 'verify':
      return 'No se pudo verificar el ID';
    default:
      return 'Ocurrio un error';
  }
}

function extractBackendMessage(err: HttpErrorResponse): string | null {
  const body = err?.error;

  if (!body) return null;

  if (typeof body === 'string') return body;

  if (typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message as string;
  }

  if (typeof body === 'object' && 'errors' in body) {
    const errors = (body as any).errors;
    if (Array.isArray(errors)) {
      const joined = errors
        .map((e: any) => (typeof e === 'string' ? e : e?.message))
        .filter(Boolean)
        .join(' . ');
      if (joined) return joined;
    } else if (errors && Object.values(errors)) {
      const joined = Object.values(errors)
        .map((v: any) => (typeof v === 'string' ? v : v?.message))
        .filter(Boolean)
        .join(' · ');
      if (joined) return joined;
    }
  }
  return null;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const action = actionFrom(req);
      const prefix = friendlyPrefix(action);

      let detail =
        extractBackendMessage(err) ||
        (err.status === 0 ? 'Sin conexion con el servidor' : err.statusText || 'Error inesperado');

      if (err.status === 400 && action === 'create') {
        detail = 'No se pudo crear el producto. Datos inválidos.';
      }

      if (err.status === 404 && (action === 'update' || action === 'delete')) {
        detail = 'Producto no encontrado con ese identificador.';
      }

      toast.error(`${prefix}. ${detail}`);

      return throwError(() => err);
    }),
  );
};
