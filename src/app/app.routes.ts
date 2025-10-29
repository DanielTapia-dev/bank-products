import type { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products-routing.module').then((m) => m.PRODUCTS_ROUTES),
      },
      { path: '**', redirectTo: 'products' },
    ],
  },
];
