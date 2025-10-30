// src/app/shared/services/toast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastKind, type ToastEvent } from '../enums/toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toastSubject = new Subject<ToastEvent>();
  readonly toast$ = this._toastSubject.asObservable();

  success(message: string, durationMs?: number) {
    this._emit(ToastKind.Success, message, durationMs);
  }

  error(message: string, durationMs?: number) {
    this._emit(ToastKind.Error, message, durationMs);
  }

  info(message: string, durationMs?: number) {
    this._emit(ToastKind.Info, message, durationMs);
  }

  warning(message: string, durationMs?: number) {
    this._emit(ToastKind.Warning, message, durationMs);
  }

  private _emit(type: ToastKind, message: string, durationMs?: number) {
    this._toastSubject.next({ type, message, durationMs });
  }
}
