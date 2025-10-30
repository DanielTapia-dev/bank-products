import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductFormPage } from './product-form.page';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsApiService } from '../../services/products-api.service';
import { ProductsStore } from '../../../../state/products.state';
import { S3StorageService } from '../../../../shared/utils/s3/s3-storage.service';

describe('ProductCreatePage (full simple coverage)', () => {
  let component: ProductFormPage;
  let fixture: ComponentFixture<ProductFormPage>;

  const mockRouter = { navigate: jest.fn() };
  const mockRoute = { snapshot: { paramMap: { get: jest.fn().mockReturnValue(null) } } };
  const mockApi = {
    get: jest.fn().mockReturnValue(of({})),
    create: jest.fn().mockReturnValue(of({})),
    update: jest.fn().mockReturnValue(of({})),
  };
  const mockStore = { load: jest.fn() };
  const mockS3 = { upload: jest.fn().mockResolvedValue('https://cdn.example.com/logo.png') };

  const create = () => {
    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: ProductsApiService, useValue: mockApi },
        { provide: ProductsStore, useValue: mockStore },
        { provide: S3StorageService, useValue: mockS3 },
      ],
    }).compileComponents();

    jest.clearAllMocks();
    (mockRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue(null);
    create();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Generate a new UUID', () => {
    const idValue = component.form.get('id')?.value as string;
    expect(typeof idValue).toBe('string');
    expect(idValue.length).toBeGreaterThan(0);
  });

  it('valueChanges de date_release actualiza date_revision y marca touched', () => {
    const releaseCtrl = component.form.get('date_release')!;
    const markSpy = jest.spyOn(releaseCtrl, 'markAsTouched');

    component.form.get('date_release')?.setValue('2025-10-29');
    const revision = component.form.get('date_revision')?.value as string;

    expect(revision).toBe('2026-10-29');
    expect(markSpy).toHaveBeenCalled();
  });

  it('releaseDateValidator: fecha pasada es inválida, hoy es válida', () => {
    component.form.get('date_release')?.setValue('2025-10-28');
    expect(component.form.get('date_release')?.errors).toEqual({ invalidReleaseDate: true });

    component.form.get('date_release')?.setValue('2025-10-29');
    expect(component.form.get('date_release')?.errors).toBeNull();
  });

  it('onFileSelected: sube y asigna logo + preview y limpia input', async () => {
    const fakeInput: any = {
      files: [new File(['x'], 'logo.png', { type: 'image/png' })],
      value: 'xxx',
    };
    const event = { target: fakeInput } as unknown as Event;

    await component.onFileSelected(event);

    expect(mockS3.upload).toHaveBeenCalledTimes(1);
    expect(component.form.get('logo')?.value).toBe('https://cdn.example.com/logo.png');
    expect(component.logoPreviewUrl).toBe('https://cdn.example.com/logo.png');
    expect(fakeInput.value).toBe('');
    expect(component.isUploading).toBe(false);
  });

  it('onFileSelected: si no hay archivo, no llama a upload', async () => {
    const fakeInput: any = { files: null, value: 'xxx' };
    const event = { target: fakeInput } as unknown as Event;

    await component.onFileSelected(event);

    expect(mockS3.upload).not.toHaveBeenCalled();
  });

  it('submitForm: no hace nada si el formulario es inválido', () => {
    component.submitForm();
    expect(mockApi.create).not.toHaveBeenCalled();
    expect(mockApi.update).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('submitForm: no hace nada si isUploading = true', () => {
    component.form.get('name')?.setValue('Producto válido');
    component.form.get('description')?.setValue('Descripción válida y suficientemente larga');
    component.form.get('logo')?.setValue('https://cdn.example.com/logo.png');
    component.form.get('date_release')?.setValue('2025-10-29');
    component.isUploading = true;

    component.submitForm();

    expect(mockApi.create).not.toHaveBeenCalled();
    expect(mockApi.update).not.toHaveBeenCalled();
  });

  it('submitForm (crear): llama api.create, store.load y navega', () => {
    component.form.get('name')?.setValue('Producto válido');
    component.form.get('description')?.setValue('Descripción válida y suficientemente larga');
    component.form.get('logo')?.setValue('https://cdn.example.com/logo.png');
    component.form.get('date_release')?.setValue('2025-10-29');

    component.submitForm();

    expect(mockApi.create).toHaveBeenCalledTimes(1);
    expect(mockStore.load).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('ngOnInit en modo editar: carga producto, parchea form y setea logoPreviewUrl', () => {
    const product = {
      id: 'P1',
      name: 'Nombre',
      description: 'Desc larga suficiente',
      logo: 'https://cdn.example.com/prev.png',
      date_release: '2025-10-29',
      date_revision: '2026-10-29',
    };
    (mockRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('P1');
    mockApi.get.mockReturnValue(of(product));

    create();

    expect(component.isEditMode).toBe(true);
    expect(mockApi.get).toHaveBeenCalledWith('P1');

    expect(component.form.get('id')?.value).toBe('P1');
    expect(component.form.get('name')?.value).toBe('Nombre');
    expect(component.form.get('description')?.value).toBe('Desc larga suficiente');
    expect(component.form.get('logo')?.value).toBe('https://cdn.example.com/prev.png');
    expect(component.form.get('date_release')?.value).toBe('2025-10-29');
    expect(component.form.get('date_revision')?.value).toBe('2026-10-29');

    expect(component.logoPreviewUrl).toBe('https://cdn.example.com/prev.png');
  });

  it('submitForm (editar): llama api.update, store.load y navega', () => {
    component.isEditMode = true;

    component.form.get('id')?.setValue('P2');
    component.form.get('name')?.setValue('Producto válido');
    component.form.get('description')?.setValue('Descripción válida y suficientemente larga');
    component.form.get('logo')?.setValue('https://cdn.example.com/logo.png');
    component.form.get('date_release')?.setValue('2025-10-29');
    component.form.get('date_revision')?.setValue('2026-10-29');

    component.submitForm();

    expect(mockApi.update).toHaveBeenCalledWith('P2', {
      id: 'P2',
      name: 'Producto válido',
      description: 'Descripción válida y suficientemente larga',
      logo: 'https://cdn.example.com/logo.png',
      date_release: '2025-10-29',
      date_revision: '2026-10-29',
    });
    expect(mockStore.load).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('resetForm en modo crear: limpia form, genera nuevo UUID y borra preview', () => {
    component.form.get('name')?.setValue('x');
    component.form.get('description')?.setValue('y'.repeat(20));
    component.form.get('logo')?.setValue('https://cdn.example.com/logo.png');
    component.logoPreviewUrl = 'https://cdn.example.com/logo.png';

    const prevId = component.form.get('id')?.value as string;
    component.resetForm();

    const newId = component.form.get('id')?.value as string;
    expect(newId).toBeTruthy();
    expect(newId).not.toBe(prevId);
    expect(component.form.get('name')?.value).toBeNull();
    expect(component.form.get('logo')?.value).toBeNull();
    expect(component.form.get('date_revision')?.value).toBeNull();
    expect(component.logoPreviewUrl).toBeNull();
  });

  it('resetForm no hace nada en modo editar', () => {
    component.isEditMode = true;

    component.form.get('id')?.setValue('PX');
    component.form.get('name')?.setValue('A');
    component.logoPreviewUrl = 'x';

    component.resetForm();

    expect(component.form.get('id')?.value).toBe('PX');
    expect(component.form.get('name')?.value).toBe('A');
    expect(component.logoPreviewUrl).toBe('x');
  });

  it('goBack navega a /products', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('getter f expone los controles del formulario', () => {
    const controls = component.f;
    expect(controls).toHaveProperty('id');
    expect(controls).toHaveProperty('name');
    expect(controls).toHaveProperty('description');
    expect(controls).toHaveProperty('logo');
    expect(controls).toHaveProperty('date_release');
    expect(controls).toHaveProperty('date_revision');
  });
});
