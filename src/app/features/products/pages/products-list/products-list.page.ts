import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProductsStore } from '../../../../state/products.state';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SkeletonDirective } from '../../../../shared/utils/skeleton/skeleton.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonDirective, ConfirmModalComponent],
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

  openMenuId: string | null = null;
  confirmOpen = false;
  confirmTargetId: string | null = null;
  confirmTargetName = '';

  toggleMenu(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  onEdit(product: Product, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/products', product.id, 'edit']);
  }

  onDelete(product: Product, event: MouseEvent) {
    event.stopPropagation();
  }

  openDelete(p: Product, ev: MouseEvent) {
    ev.stopPropagation();
    this.confirmTargetId = p.id;
    this.confirmTargetName = p.name ?? '';
    this.confirmOpen = true;
    this.openMenuId = null;
  }

  confirmDelete() {
    if (this.confirmTargetId) {
      this.store.remove(this.confirmTargetId);
    }
    this.resetConfirm();
  }

  cancelDelete() {
    this.resetConfirm();
  }

  private resetConfirm() {
    this.confirmOpen = false;
    this.confirmTargetId = null;
    this.confirmTargetName = '';
  }

  isDeleting(id: string): boolean {
    return (this.store as any).isDeleting ? (this.store as any).isDeleting(id) : false;
  }

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
