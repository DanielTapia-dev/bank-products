export enum ToastKind {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export interface ToastEvent {
  type: ToastKind;
  message: string;
}
