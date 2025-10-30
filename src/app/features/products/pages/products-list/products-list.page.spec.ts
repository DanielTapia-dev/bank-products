import type { ComponentFixture } from '@angular/core/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { ProductsListPage } from './products-list.page';
import { ProductsStore } from '../../../../state/products.state';

describe('ProductsListPage', () => {
  let component: ProductsListPage;
  let fixture: ComponentFixture<ProductsListPage>;

  const storeMock: any = {
    vm$: of({ items: [], size: 10, query: '', total: 0, error: null }),
    load: jest.fn(),
    setQuery: jest.fn(),
    setSize: jest.fn(),
    setPage: jest.fn(),
    remove: jest.fn(),
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

  it('ngOnInit should call store.load once', () => {
    component.ngOnInit();
    expect(storeMock.load).toHaveBeenCalledTimes(1);
  });

  it('onSearchInput should debounce and call setQuery with latest value', fakeAsync(() => {
    component.ngOnInit();
    component.onSearchInput('a');
    component.onSearchInput('ab');
    component.onSearchInput('abc');
    tick(2000);
    expect(storeMock.setQuery).toHaveBeenCalledTimes(2);
    expect(storeMock.setQuery).toHaveBeenCalledWith('abc');
  }));

  it('onSearchInput should map null to empty string', fakeAsync(() => {
    component.ngOnInit();
    component.onSearchInput(null as any);
    tick(400);
    expect(storeMock.setQuery).toHaveBeenCalledWith('');
  }));

  it('onSizeChange should call setSize with number', () => {
    component.onSizeChange('20');
    expect(storeMock.setSize).toHaveBeenCalledWith(20);
  });

  it('onPageChange should call setPage', () => {
    component.onPageChange(3);
    expect(storeMock.setPage).toHaveBeenCalledWith(3);
  });

  it('trackById should return item.id when present, else index', () => {
    const withId = { id: 'x1' } as any;
    const withoutId = { name: 'n' } as any;
    expect(component.trackById(5, withId)).toBe('x1');
    expect(component.trackById(7, withoutId)).toBe(7);
  });

  it('createProduct should navigate to products/new', () => {
    component.createProduct();
    expect(routerMock.navigate).toHaveBeenCalledWith(['products/new']);
  });

  it('toggleMenu should open and then close for same id', () => {
    const ev = { stopPropagation: jest.fn() } as any as MouseEvent;
    component.toggleMenu('p1', ev);
    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(component.openMenuId).toBe('p1');
    component.toggleMenu('p1', ev);
    expect(component.openMenuId).toBeNull();
  });

  it('onEdit should navigate to edit route and stop propagation', () => {
    const ev = { stopPropagation: jest.fn() } as any as MouseEvent;
    component.onEdit({ id: '42' } as any, ev);
    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/products', '42', 'edit']);
  });

  it('onDelete should only stop propagation', () => {
    const ev = { stopPropagation: jest.fn() } as any as MouseEvent;
    component.onDelete({ id: 'x' } as any, ev);
    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(storeMock.remove).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('openDelete should set confirm state and close menu', () => {
    component.openMenuId = 'p1';
    const ev = { stopPropagation: jest.fn() } as any as MouseEvent;
    const p = { id: 'id-1', name: 'Prod' } as any;
    component.openDelete(p, ev);
    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(component.confirmOpen).toBe(true);
    expect(component.confirmTargetId).toBe('id-1');
    expect(component.confirmTargetName).toBe('Prod');
    expect(component.openMenuId).toBeNull();
  });

  it('confirmDelete should remove when there is a target id and reset confirm', () => {
    component['confirmTargetId'] = 'rm-1';
    component['confirmTargetName'] = 'X';
    component['confirmOpen'] = true;
    component.confirmDelete();
    expect(storeMock.remove).toHaveBeenCalledWith('rm-1');
    expect(component['confirmOpen']).toBe(false);
    expect(component['confirmTargetId']).toBeNull();
    expect(component['confirmTargetName']).toBe('');
  });

  it('confirmDelete should just reset when no target id', () => {
    component['confirmTargetId'] = null;
    component['confirmOpen'] = true;
    component.confirmDelete();
    expect(storeMock.remove).not.toHaveBeenCalled();
    expect(component['confirmOpen']).toBe(false);
  });

  it('cancelDelete should reset confirm state', () => {
    component['confirmTargetId'] = 'a';
    component['confirmTargetName'] = 'b';
    component['confirmOpen'] = true;
    component.cancelDelete();
    expect(component['confirmOpen']).toBe(false);
    expect(component['confirmTargetId']).toBeNull();
    expect(component['confirmTargetName']).toBe('');
  });

  it('isDeleting should return false when store has no isDeleting', () => {
    storeMock.isDeleting = undefined;
    expect(component.isDeleting('z')).toBe(false);
  });

  it('isDeleting should delegate to store.isDeleting when present', () => {
    storeMock.isDeleting = jest.fn((id: string) => id === 'hit');
    expect(component.isDeleting('hit')).toBe(true);
    expect(component.isDeleting('miss')).toBe(false);
  });

  it('ngOnDestroy should complete without errors', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
