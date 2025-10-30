import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductFormPage } from './product-form.page';
import { ProductsApiService } from '../../services/products-api.service';
import { ProductsStore } from '../../../../state/products.state';
import { ToastService } from '../../../../shared/components/toast/services/toast.service';
import { S3StorageService } from '../../../../shared/utils/s3/s3-storage.service';

describe('ProductFormPage', () => {
  let component: ProductFormPage;

  const mockApi = {
    verifyId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
  };

  const mockStore = { load: jest.fn() };
  const mockRouter = { navigate: jest.fn() };
  const mockToast = { success: jest.fn() };
  const mockS3 = { upload: jest.fn() };

  function isoToday(offsetYears = 0) {
    const t = new Date();
    t.setFullYear(t.getFullYear() + offsetYears);
    return t.toISOString().slice(0, 10);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        { provide: ProductsApiService, useValue: mockApi },
        { provide: ProductsStore, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToast },
        { provide: S3StorageService, useValue: mockS3 },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('submitForm (editar): llama api.update, store.load y navega', fakeAsync(() => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map([['id', 'P2']]) } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;

    const rel = isoToday(0);
    const rev = isoToday(1);

    mockApi.get.mockReturnValue(
      of({
        id: 'P2',
        name: 'Producto válido',
        description: 'Descripción válida y suficientemente larga',
        logo: 'https://cdn.example.com/logo.png',
        date_release: rel,
        date_revision: rev,
      }),
    );
    mockApi.update.mockReturnValue(of({}));

    fixture.detectChanges();
    tick();

    component.submitForm();
    fixture.detectChanges();

    expect(mockApi.update).toHaveBeenCalledTimes(1);
    expect(mockApi.update).toHaveBeenCalledWith('P2', {
      id: 'P2',
      name: 'Producto válido',
      description: 'Descripción válida y suficientemente larga',
      logo: 'https://cdn.example.com/logo.png',
      date_release: rel,
      date_revision: rev,
    });
    expect(mockStore.load).toHaveBeenCalledTimes(1);
    expect(mockToast.success).toHaveBeenCalledWith('Producto guardado correctamente', 2000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('id async validator: marca idTaken cuando verifyId=true', fakeAsync(() => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map() } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;

    mockApi.verifyId.mockReturnValue(of(true));

    fixture.detectChanges();

    component.idCtrl.setValue('DUP');
    component.idCtrl.updateValueAndValidity();
    tick(300);

    expect(component.idCtrl.errors).toEqual({ idTaken: true });
  }));

  it('actualiza date_revision un año después de date_release', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map() } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const rel = isoToday(0);
    const expected = isoToday(1);

    component.form.get('date_release')?.setValue(rel);

    expect(component.form.get('date_revision')?.value).toBe(expected);
  });

  it('onFileSelected: sube a S3 y actualiza logo y preview', async () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map() } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    mockS3.upload.mockResolvedValue('https://s3.test/logo.png');

    const ev = {
      target: {
        files: [file],
        value: 'something',
      },
    } as any as Event;

    await component.onFileSelected(ev);

    expect(mockS3.upload).toHaveBeenCalledTimes(1);
    expect(component.form.get('logo')?.value).toBe('https://s3.test/logo.png');
    expect(component.logoPreviewUrl).toBe('https://s3.test/logo.png');
    expect(component.isUploading).toBe(false);
    expect((ev as any).target.value).toBe('');
  });

  it('resetForm: limpia y habilita id solo en modo creación', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map() } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      id: 'X',
      name: 'Producto válido',
      description: 'Descripción válida y suficientemente larga',
      logo: 'url',
      date_release: isoToday(0),
    });
    component['logoPreviewUrl'] = 'url';

    component.resetForm();

    expect(component.idCtrl.disabled).toBe(false);
    expect(component.form.get('date_revision')?.value).toBeNull();
    expect(component.logoPreviewUrl).toBeNull();
  });

  it('resetForm: no hace nada en modo edición y mantiene id deshabilitado', fakeAsync(() => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map([['id', 'E1']]) } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;

    mockApi.get.mockReturnValue(
      of({
        id: 'E1',
        name: 'Name',
        description: 'Descripción válida y suficientemente larga',
        logo: 'url',
        date_release: isoToday(0),
        date_revision: isoToday(1),
      }),
    );

    fixture.detectChanges();
    tick();

    expect(component.isEditMode).toBe(true);
    expect(component.idCtrl.disabled).toBe(true);

    component.resetForm();

    expect(component.idCtrl.disabled).toBe(true);
  }));

  it('goBack: navega a /products', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: new Map() } },
    });

    const fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });
});
