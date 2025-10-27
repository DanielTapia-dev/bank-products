import type { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/products-list/products-list.page').then((m) => m.ProductsListPage),
    title: 'Products',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/create/product-create/product-create.page').then((m) => m.ProductCreatePage),
    title: 'Products',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/edit/product-edit/product-edit.page').then((m) => m.ProductEditPage),
    title: 'Products',
  },
];
