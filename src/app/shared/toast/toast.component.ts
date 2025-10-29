import { Component, inject, OnDestroy, NgZone } from '@angular/core';
import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastItem, ToastKind } from './enums/toast.types';
import { ToastService } from './services/toast.service';
import { TOAST_CONFIG, type ToastConfig } from './toast.config';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgFor, NgClass],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnDestroy {
  toasts: ToastItem[] = [];
  private sub: Subscription;

  private readonly toast = inject(ToastService);
  private readonly cfg: ToastConfig = inject(TOAST_CONFIG);
  private readonly zone = inject(NgZone);

  constructor() {
    this.sub = this.toast.toast$.subscribe((evt) => this.push(evt));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private push(evt: { type: ToastKind; message: string; durationMs?: number | string }) {
    const id = this.uuid();

    const base = evt.durationMs ?? this.cfg.perType?.[evt.type] ?? this.cfg.defaultMs;
    const durationMs = this.normalizeDuration(base);

    const item: ToastItem = {
      id,
      type: evt.type,
      message: evt.message,
      createdAt: Date.now(),
      durationMs,
    };

    this.toasts = [item, ...this.toasts].slice(0, this.cfg.maxToasts);

    window.setTimeout(() => {
      this.zone.run(() => this.close(id));
    }, durationMs);
  }

  private normalizeDuration(v: number | string): number {
    const n = Number(v);
    if (!isFinite(n) || n <= 0) return this.cfg.defaultMs;
    return n < 100 ? n * 1000 : n;
  }

  close(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  kindClass(kind: ToastKind) {
    return {
      'is-success': kind === ToastKind.Success,
      'is-error': kind === ToastKind.Error,
      'is-info': kind === ToastKind.Info,
      'is-warning': kind === ToastKind.Warning,
    };
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
