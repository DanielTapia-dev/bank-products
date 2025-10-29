import { InjectionToken } from '@angular/core';
import { ToastKind } from './enums/toast.types';

export interface ToastConfig {
  defaultMs: number;
  perType?: Partial<Record<ToastKind, number>>;
  maxToasts: number;
}

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('TOAST_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    defaultMs: 3500,
    perType: {
      [ToastKind.Success]: 2500,
      [ToastKind.Info]: 3500,
      [ToastKind.Warning]: 4500,
      [ToastKind.Error]: 6000,
    },
    maxToasts: 5,
  }),
});
