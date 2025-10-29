import type { ComponentFixture } from '@angular/core/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ProductsListPage } from './products-list.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProductsStore } from '../../../../state/products.state';
import { Router } from '@angular/router';

describe('ProductsListComponent', () => {
  let component: ProductsListPage;
  let fixture: ComponentFixture<ProductsListPage>;

  const storeMock = {
    vm$: of({ items: [], size: 10, query: '', total: 0, error: null }),
    load: jest.fn(),
    setQuery: jest.fn(),
    setSize: jest.fn(),
    setPage: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListPage, HttpClientTestingModule],
      providers: [
        { provide: ProductsStore, useValue: storeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call store.load', () => {
    component.ngOnInit();
    expect(storeMock.load).toHaveBeenCalledTimes(1);
  });

  it('onSearchInput should debounce and call store.setQuery once', fakeAsync(() => {
    component.ngOnInit();
    component.onSearchInput('adc');
    component.onSearchInput('adc');
    component.onSearchInput('abdc');

    tick(400);

    expect(storeMock.setQuery).toHaveBeenCalledTimes(2);
    expect(storeMock.setQuery).toHaveBeenCalledWith('abdc');
  }));

  it('onSizeChange should call store.setSize with parsed number', () => {
    component.onSizeChange('20');
    expect(storeMock.setSize).toHaveBeenCalledWith(20);
  });

  it('onPageChange should call store.setPage', () => {
    component.onPageChange(3);
    expect(storeMock.setPage).toHaveBeenCalledWith(3);
  });

  it('trackById should return item.id when present, else index', () => {
    const itemWithId = { name: 'A' } as any as { id?: number | string };
    itemWithId.id = 'xyz';
    expect(component.trackById(5, itemWithId as any)).toBe('xyz');

    const itemWithoutId = { name: 'B' } as any;
    expect(component.trackById(7, itemWithoutId as any)).toBe(7);
  });

  it('createProduct should navigate to products/new', () => {
    component.createProduct();
    expect(routerMock.navigate).toHaveBeenCalledWith(['products/new']);
  });

  it('ngOnDestroy should complete streams without throwing', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
