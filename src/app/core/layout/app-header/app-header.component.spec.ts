import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  const reloadMock = jest.fn();

  const originalLocation = window.location;

  beforeAll(() => {
    delete (window as any).location;
    (window as any).location = {
      ...originalLocation,
      reload: reloadMock,
    };
  });

  afterAll(() => {
    (window as any).location = originalLocation;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    reloadMock.mockClear();
  });

  it('reloadPage should call window.location.reload once', () => {
    component.reloadPage();
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
