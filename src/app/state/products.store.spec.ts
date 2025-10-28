import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductsApiService } from '../features/products/services/products-api.service';
import type { Product } from '../features/products/models/product.model';
import { ProductsStore } from './products.state';

describe('ProductsStore', () => {
  let store: ProductsStore;
  let api: jest.Mocked<ProductsApiService>;

  const makeItems = (n = 1): Product[] =>
    Array.from({ length: n }).map(
      (_, i) => ({ id: i + 1, name: `P${i + 1}` }) as unknown as Product,
    );

  beforeEach(() => {
    api = {
      list: jest.fn(),
    } as unknown as jest.Mocked<ProductsApiService>;

    TestBed.configureTestingModule({
      providers: [ProductsStore, { provide: ProductsApiService, useValue: api }],
    });

    store = TestBed.inject(ProductsStore);
    jest.clearAllMocks();
  });

  it('Expose initial state', () => {
    expect(store.snapshot).toEqual({
      items: [],
      total: 0,
      q: '',
      page: 1,
      size: 10,
      loading: false,
      error: null,
    });
  });

  it('load items, total and turn down loading', () => {
    const items = makeItems(2);
    api.list.mockReturnValue(of(items));

    store.load();

    expect(api.list).toHaveBeenCalledWith({ q: '', page: 1, size: 10 });
    expect(store.snapshot.loading).toBe(false);
    expect(store.snapshot.items).toEqual(items);
    expect(store.snapshot.total).toBe(2);
    expect(store.snapshot.error).toBeNull();
  });

  it('load error: empty items', () => {
    api.list.mockReturnValue(throwError(() => new Error('boom')));

    store.load();

    expect(api.list).toHaveBeenCalledWith({ q: '', page: 1, size: 10 });
    expect(store.snapshot.loading).toBe(false);
    expect(store.snapshot.items).toEqual([]);
    expect(store.snapshot.total).toBe(0);
    expect(store.snapshot.error).toBe('No se pudo cargar la lista');
  });

  it('setQuery with q, reset, page=1 and call load', () => {
    api.list.mockReturnValue(of([] as Product[]));

    const spyLoad = jest.spyOn(store, 'load');
    store.setQuery('abc');

    expect(store.snapshot.q).toBe('abc');
    expect(store.snapshot.page).toBe(1);
    expect(spyLoad).toHaveBeenCalledTimes(1);
    expect(api.list).toHaveBeenCalledWith({ q: 'abc', page: 1, size: 10 });
  });

  it('setPage change page and call load with current parameters', () => {
    api.list.mockReturnValue(of([] as Product[]));

    const spyLoad = jest.spyOn(store, 'load');
    store.setPage(3);

    expect(store.snapshot.page).toBe(3);
    expect(spyLoad).toHaveBeenCalledTimes(1);
    expect(api.list).toHaveBeenCalledWith({ q: '', page: 3, size: 10 });
  });

  it('setSize normalize size', () => {
    api.list.mockReturnValue(of([] as Product[]));

    store.setSize(25 as unknown as number);
    expect(store.snapshot.size).toBe(25);
    expect(store.snapshot.page).toBe(1);
    expect(api.list).toHaveBeenLastCalledWith({ q: '', page: 1, size: 25 });

    store.setSize('NaN' as unknown as number);
    expect(store.snapshot.size).toBe(10);
    expect(store.snapshot.page).toBe(1);
    expect(api.list).toHaveBeenLastCalledWith({ q: '', page: 1, size: 10 });
  });
});
