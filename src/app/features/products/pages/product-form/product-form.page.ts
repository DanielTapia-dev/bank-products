import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsApiService } from '../../services/products-api.service';
import { ProductsStore } from '../../../../state/products.state';
import { Product } from '../../models/product.model';
import { S3StorageService } from '../../../../shared/s3/s3-storage.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
})
export class ProductFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProductsApiService);
  private readonly store = inject(ProductsStore);
  private readonly directS3 = inject(S3StorageService);

  logoPreviewUrl: string | null = null;
  isEditMode = false;
  isUploading = false;
  todayStr = new Date().toISOString().substring(0, 10);

  form = this.fb.group({
    id: [{ value: '', disabled: true }],
    name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', [Validators.required]],
    date_release: ['', [Validators.required, this.releaseDateValidator()]],
    date_revision: [{ value: '', disabled: true }, [Validators.required]],
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.isEditMode = true;
      this.api.get(paramId).subscribe((product) => {
        this.form.patchValue({
          id: product.id,
          name: product.name,
          description: product.description,
          logo: product.logo,
          date_release: product.date_release,
          date_revision: product.date_revision,
        });
        this.logoPreviewUrl = product.logo || null;
      });
    } else {
      this.form.get('id')?.setValue(this.generateUUID());
    }

    this.form.get('date_release')?.valueChanges.subscribe((value) => {
      this.updateRevisionDate(value as string);
      this.form.get('date_release')?.markAsTouched();
    });
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private updateRevisionDate(releaseDateStr: string) {
    if (!releaseDateStr) return;
    const [y, m, d] = releaseDateStr.split('-').map(Number);
    const release = new Date(y, (m ?? 1) - 1, d ?? 1);
    if (isNaN(release.getTime())) return;

    const revision = new Date(release);
    revision.setFullYear(revision.getFullYear() + 1);
    this.form.get('date_revision')?.setValue(revision.toISOString().substring(0, 10));
  }

  private releaseDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const [y, m, d] = (control.value as string).split('-').map(Number);
      const input = new Date(y, (m ?? 1) - 1, d ?? 1);

      const today = new Date();
      const floorToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      return input >= floorToday ? null : { invalidReleaseDate: true };
    };
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploading = true;
    try {
      const url = await this.directS3.upload(file);
      this.form.get('logo')?.setValue(url);
      this.form.get('logo')?.markAsDirty();
      this.form.get('logo')?.markAsTouched();
      this.logoPreviewUrl = url;
    } catch (err) {
      console.error(err);
    } finally {
      this.isUploading = false;
      input.value = '';
    }
  }

  submitForm(): void {
    if (this.form.invalid || this.isUploading) return;

    const raw = this.form.getRawValue();
    const product: Product = {
      id: raw.id!,
      name: raw.name!,
      description: raw.description!,
      logo: raw.logo!,
      date_release: raw.date_release!,
      date_revision: raw.date_revision!,
    };

    const onDone = () => {
      this.store.load();
      this.router.navigate(['/products']);
    };

    if (this.isEditMode) {
      this.api.update(product.id, product).subscribe({
        next: onDone,
        error: () => {
          //TODO: manejar errores
        },
      });
    } else {
      this.api.create(product).subscribe({
        next: onDone,
        error: () => {
          //TODO: manejar errores
        },
      });
    }
  }

  resetForm(): void {
    if (this.isEditMode) return;
    const newUuid = this.generateUUID();
    this.form.reset();
    this.form.get('id')?.setValue(newUuid);
    this.form.get('date_revision')?.reset();
    this.logoPreviewUrl = null;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  get f() {
    return this.form.controls;
  }
}
