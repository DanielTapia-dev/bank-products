import type { Routes } from '@angular/router';
import { ProductsApiService } from './services/products-api.service';
import { catchError, of } from 'rxjs';
import { inject } from '@angular/core';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-list/products-list.page').then((m) => m.ProductsListPage),
    title: 'Products',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form/product-form.page').then((m) => m.ProductFormPage),
    title: 'Products',
    data: { mode: 'create' },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/product-form/product-form.page').then((m) => m.ProductFormPage),
    title: 'Edit product',
    data: { mode: 'edit' },
    resolve: {
      product: (route: import('@angular/router').ActivatedRouteSnapshot) => {
        const api = inject(ProductsApiService);
        const id = route.paramMap.get('id')!;
        return api.get(id).pipe(catchError(() => of(null)));
      },
    },
  },
  { path: ':id', pathMatch: 'full', redirectTo: ':id/edit' },
];
