import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProductsStore } from '../../../../state/products.state';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-list.page.html',
  styleUrl: './products-list.page.scss',
})
export class ProductsListPage implements OnInit, OnDestroy {
  private readonly store = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  vm$ = this.store.vm$;
  readonly pageSizes = [5, 10, 20];

  pageSized = [5, 10, 20];

  ngOnInit(): void {
    this.store.load();

    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => this.store.setQuery(q));
  }

  onSearchInput(value: string): void {
    this.search$.next(value ?? '');
  }

  onSizeChange(size: string): void {
    this.store.setSize(Number(size));
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
  }

  trackById(_: number, item: Product): number | string {
    return (item as Product & { id?: number | string }).id ?? _;
  }

  createProduct() {
    this.router.navigate(['products/new']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
