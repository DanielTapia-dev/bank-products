import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsApiService } from './products-api.service';
import { environment } from '../../../../environments/environment';
import type { Product } from '../models/product.model';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsApiService],
    });
    service = TestBed.inject(ProductsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('List service without params', () => {
    const mockResponse: Product[] = [];
    let result: Product[] | undefined;

    service.list().subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url === `${environment.apiUrl}/products`,
    );

    expect(req.request.params.keys().length).toBe(0);

    req.flush(mockResponse);

    expect(result).toEqual(mockResponse);
  });

  it('List service with params', () => {
    const mockResponse: Product[] = [{ id: '1' } as Product];
    let result: Product[] | undefined;

    service.list({ q: 'visa', page: 2, size: 20 }).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url === `${environment.apiUrl}/products`,
    );

    expect(req.request.params.get('q')).toBe('visa');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('20');

    req.flush(mockResponse);
    expect(result).toEqual(mockResponse);
  });

  it('Get by id', () => {
    const mockProduct = { id: 'abc', name: 'X' } as Product;
    let result: Product | undefined;

    service.get('abc').subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url === `${environment.apiUrl}/products/abc`,
    );

    expect(req.request.body).toBeNull();

    req.flush(mockProduct);
    expect(result).toEqual(mockProduct);
  });

  it('verify products by id', () => {
    let result: boolean | undefined;

    service.verifyId('XYZ').subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'GET' && r.url === `${environment.apiUrl}/products/verification/XYZ`,
    );

    const payload = true;
    req.flush(payload);

    expect(result).toEqual(payload);
  });

  it('create product', () => {
    const input = { id: 'p1', name: 'Prod 1' } as Product;
    const server = { ...input, createdAt: '2025-01-01' } as any;
    let result: Product | undefined;

    service.create(input).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'POST' && r.url === `${environment.apiUrl}/products`,
    );

    expect(req.request.body).toEqual(input);

    req.flush(server);
    expect(result).toEqual(server);
  });

  it('update product', () => {
    const patch = { name: 'Nuevo nombre' };
    const server = { id: 'p1', name: 'Nuevo nombre' } as Product;
    let result: Product | undefined;

    service.update('p1', patch).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'PUT' && r.url === `${environment.apiUrl}/products/p1`,
    );

    expect(req.request.body).toEqual(patch);

    req.flush(server);
    expect(result).toEqual(server);
  });

  it('remove product', () => {
    let result: void | undefined;

    service.remove('p9').subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.method === 'DELETE' && r.url === `${environment.apiUrl}/products/p9`,
    );

    expect(req.request.body).toBeNull();

    req.flush(null);
    expect(result).toBeNull();
  });
});
