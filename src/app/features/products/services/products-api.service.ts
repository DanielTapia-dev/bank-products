import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import type { Observable } from 'rxjs';
import type { Product } from '../models/product.model';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  list(params?: {
    q?: string;
    page?: number;
    size?: number;
  }): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    return this.http.get<PaginatedResponse<Product>>(this.base, { params: httpParams });
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  verifyId(id: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.base}/verification/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
