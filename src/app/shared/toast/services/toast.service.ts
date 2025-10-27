import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastKind, type ToastEvent } from '../enums/toast.types';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toastSubject = new Subject<ToastEvent>();
  readonly toast$ = this._toastSubject.asObservable();

  success(message: string) {
    this._emit(ToastKind.Success, message);
  }

  error(message: string) {
    this._emit(ToastKind.Error, message);
  }

  info(message: string) {
    this._emit(ToastKind.Info, message);
  }

  warning(message: string) {
    this._emit(ToastKind.Warning, message);
  }

  private _emit(type: ToastKind, message: string) {
    this._toastSubject.next({ type, message });
  }
}
