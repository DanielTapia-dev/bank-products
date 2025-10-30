import { TestBed } from '@angular/core/testing';
import { type ComponentFixture } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';

import { ToastComponent } from './toast.component';
import { TOAST_CONFIG, type ToastConfig } from './toast.config';
import { ToastKind, type ToastEvent } from './enums/toast.types';
import { ToastService } from './services/toast.service';

class MockToastService {
  private _subj = new Subject<ToastEvent>();
  readonly toast$ = this._subj.asObservable();
  emit(e: ToastEvent) {
    this._subj.next(e);
  }
}

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let component: ToastComponent;
  let zone: NgZone;
  let mockService: MockToastService;

  const cfg: ToastConfig = {
    defaultMs: 3000,
    perType: {
      [ToastKind.Success]: 1500,
      [ToastKind.Info]: 3500,
      [ToastKind.Warning]: 4500,
      [ToastKind.Error]: 6000,
    },
    maxToasts: 2,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: TOAST_CONFIG, useValue: cfg },
        { provide: ToastService, useClass: MockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    zone = TestBed.inject(NgZone);
    mockService = TestBed.inject(ToastService) as unknown as MockToastService;

    jest.useFakeTimers();
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function emit(evt: Partial<ToastEvent> & { type: ToastKind; message: string }) {
    mockService.emit({
      type: evt.type,
      message: evt.message,
      durationMs: evt.durationMs as any,
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds a toast on service event and auto-closes after ms', () => {
    const runSpy = jest.spyOn(zone, 'run').mockImplementation((fn: any) => fn());

    emit({ type: ToastKind.Success, message: 'ok', durationMs: 1000 });

    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(999);
    expect(component.toasts.length).toBe(1);

    jest.advanceTimersByTime(1);
    expect(runSpy).toHaveBeenCalled();
    expect(component.toasts.length).toBe(0);
  });

  it('treats durationMs < 100 as seconds (2 => 2000ms)', () => {
    emit({ type: ToastKind.Success, message: 'two-sec', durationMs: 2 });

    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(1999);
    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(1);
    expect(component.toasts.length).toBe(0);
  });

  it('uses perType fallback when no durationMs provided', () => {
    emit({ type: ToastKind.Success, message: 'fallback-per-type' });

    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(1499);
    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(1);
    expect(component.toasts.length).toBe(0);
  });

  it('falls back to defaultMs for invalid or non-positive durations', () => {
    emit({ type: ToastKind.Info, message: 'invalid', durationMs: -5 as any });

    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(2999);
    expect(component.toasts.length).toBe(1);
    jest.advanceTimersByTime(1);
    expect(component.toasts.length).toBe(0);
  });

  it('caps the list at cfg.maxToasts and keeps most recent first', () => {
    emit({ type: ToastKind.Info, message: 't1', durationMs: 5000 });
    emit({ type: ToastKind.Info, message: 't2', durationMs: 5000 });
    emit({ type: ToastKind.Info, message: 't3', durationMs: 5000 });

    expect(component.toasts.length).toBe(2);
    expect(component.toasts[0].message).toBe('t3');
    expect(component.toasts[1].message).toBe('t2');
  });

  it('close() removes the specified toast id', () => {
    emit({ type: ToastKind.Info, message: 'one', durationMs: 5000 });
    emit({ type: ToastKind.Info, message: 'two', durationMs: 5000 });

    const [first, second] = component.toasts;
    expect(component.toasts.length).toBe(2);

    component.close(first.id);
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].id).toBe(second.id);
  });

  it('kindClass maps correctly to CSS classes', () => {
    expect(component.kindClass(ToastKind.Success)).toEqual({
      'is-success': true,
      'is-error': false,
      'is-info': false,
      'is-warning': false,
    });
    expect(component.kindClass(ToastKind.Error)).toEqual({
      'is-success': false,
      'is-error': true,
      'is-info': false,
      'is-warning': false,
    });
    expect(component.kindClass(ToastKind.Info)).toEqual({
      'is-success': false,
      'is-error': false,
      'is-info': true,
      'is-warning': false,
    });
    expect(component.kindClass(ToastKind.Warning)).toEqual({
      'is-success': false,
      'is-error': false,
      'is-info': false,
      'is-warning': true,
    });
  });
});
