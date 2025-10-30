import { inject, Injectable } from '@angular/core';
import { ProductsApiService } from '../features/products/services/products-api.service';
import { BehaviorSubject, delay, finalize, map } from 'rxjs';
import type { Product } from '../features/products/models/product.model';

type Nullable<T> = T | null;

interface ProductsState {
  items: Product[];
  total: number;
  q: string;
  page: number;
  size: number;
  loading: boolean;
  error: Nullable<string>;
}

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly api = inject(ProductsApiService);
  private firstLoad = true;

  private readonly state$ = new BehaviorSubject<ProductsState>({
    items: [],
    total: 0,
    q: '',
    page: 1,
    size: 10,
    loading: false,
    error: null,
  });

  readonly vm$ = this.state$.pipe(
    map((state) => {
      const query = state.q?.toLowerCase().trim();
      const filtered = query
        ? state.items.filter(
            (p) =>
              p.name?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query),
          )
        : state.items;

      return {
        ...state,
        items: filtered,
        total: filtered.length,
      };
    }),
  );

  get snapshot(): ProductsState {
    return this.state$.value;
  }

  load(): void {
    const { q, page, size } = this.snapshot;

    this.patch({ loading: true, error: null });

    this.api
      .list({ q, page, size })
      .pipe(
        this.firstLoad ? delay(2000) : (source) => source,
        finalize(() => {
          this.patch({ loading: false });
          this.firstLoad = false;
        }),
      )
      .subscribe({
        next: (items) => {
          this.patch({
            items,
            total: items.length,
          });
        },
        error: () => {
          this.patch({ items: [], total: 0, error: 'No se pudo cargar la lista' });
        },
      });
  }

  setQuery(q: string): void {
    this.patch({ q, page: 1 });
  }

  setPage(page: number): void {
    this.patch({ page });
    this.load();
  }

  setSize(size: number): void {
    const parsed = Number(size) || 10;
    this.patch({ size: parsed, page: 1 });
    this.load();
  }

  private patch(partial: Partial<ProductsState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  remove(id: string): void {
    const { items, page, size } = this.snapshot;

    const prevItems = [...items];
    const nextItems = items.filter((item) => item.id !== id);

    this.patch({
      items: nextItems,
      total: nextItems.length,
      error: null,
    });

    const currentPageCount = nextItems.slice((page - 1) * size, page * size).length;
    const shouldGoBackPage = currentPageCount === 0 && page > 1;

    this.api.remove(id).subscribe({
      next: () => {
        if (shouldGoBackPage) {
          this.setPage(page - 1);
        }
      },
      error: () => {
        this.patch({
          items: prevItems,
          total: prevItems.length,
          error: 'No se pudo eliminar el producto',
        });
      },
    });
  }
}
