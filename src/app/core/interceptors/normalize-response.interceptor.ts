import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

function hasArrayData(body: unknown): body is { data: unknown[] } {
  return (
    typeof body === 'object' && body !== null && Array.isArray((body as { data: unknown }).data)
  );
}

function hasObjectData(body: unknown): body is { data: Record<string, unknown> } {
  return (
    typeof body === 'object' &&
    body !== null &&
    !!(body as { data: unknown }).data &&
    !Array.isArray((body as { data: unknown }).data)
  );
}

export const normalizeResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body;

        if (hasArrayData(body)) {
          return event.clone({ body: body.data });
        }

        if (hasObjectData(body)) {
          return event.clone({ body: body.data });
        }
      }
      return event;
    }),
  );
};
