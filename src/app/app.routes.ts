import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products-routing.module').then((m) => m.PRODUCTS_ROUTES),
  },
  { path: '**', redirectTo: 'products' },
];
