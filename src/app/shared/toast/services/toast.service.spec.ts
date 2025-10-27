import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('success function emit', () => {
    const received: any[] = [];

    const sub = service.toast$.subscribe((event) => received.push(event));

    service.success('Hello');
    service.error('Hello');
    service.info('Hello');
    service.warning('Hello');

    expect(received).toHaveLength(4);
    expect(received[0]).toEqual({ type: 'success', message: 'Hello' });
    expect(received[1]).toEqual({ type: 'error', message: 'Hello' });
    expect(received[2]).toEqual({ type: 'info', message: 'Hello' });
    expect(received[3]).toEqual({ type: 'warning', message: 'Hello' });

    sub.unsubscribe();
  });
});
