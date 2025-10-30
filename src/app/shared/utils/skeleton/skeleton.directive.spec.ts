import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SkeletonDirective } from './skeleton.directive';

@Component({
  standalone: true,
  imports: [SkeletonDirective],
  template: `
    <div
      id="host"
      [appSkeleton]="loading"
      [skelType]="type"
      [skelWidth]="width"
      [skelHeight]="height"
    >
      <span id="content">content</span>
    </div>
  `,
})
class HostDivComponent {
  loading = false;
  type: 'line' | 'circle' | 'block' = 'line';
  width?: string;
  height?: string;
}

@Component({
  standalone: true,
  imports: [SkeletonDirective],
  template: `
    <table>
      <tbody>
        <tr>
          <td id="td-host" [appSkeleton]="loading" [skelType]="type" [skelWidth]="width"></td>
        </tr>
      </tbody>
    </table>
  `,
})
class HostTableComponent {
  loading = false;
  type: 'line' | 'circle' | 'block' = 'line';
  width?: string;
}

describe('SkeletonDirective on div host', () => {
  let fixture: ComponentFixture<HostDivComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostDivComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostDivComponent);
  });

  it('no skeleton when loading=false', () => {
    fixture.detectChanges();
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    expect(host.querySelector('.skel')).toBeNull();
    expect(host.classList.contains('skel-hide-content')).toBe(false);
  });

  it('renders skeleton when loading=true', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    const skel = host.querySelector('.skel') as HTMLElement | null;
    expect(skel).not.toBeNull();
    expect(host.classList.contains('skel-hide-content')).toBe(true);
  });

  it('removes skeleton when loading goes false', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    expect(host.querySelector('.skel')).toBeNull();
    expect(host.classList.contains('skel-hide-content')).toBe(false);
  });

  it('applies circle type', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.type = 'circle';
    fixture.detectChanges();
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    const skel = host.querySelector('.skel') as HTMLElement | null;
    expect(skel?.classList.contains('skel--circle')).toBe(true);
  });

  it('applies width and height styles', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.width = '55%';
    fixture.componentInstance.height = '24px';
    fixture.detectChanges();
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    const skel = host.querySelector('.skel') as HTMLElement | null;
    expect(skel?.style.width).toBe('55%');
    expect(skel?.style.height).toBe('24px');
  });

  it('does not duplicate skeleton on repeated true', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    const skels = host.querySelectorAll('.skel');
    expect(skels.length).toBe(1);
  });
});

describe('SkeletonDirective on td host', () => {
  let fixture: ComponentFixture<HostTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostTableComponent);
  });

  it('renders inside td with hide-content class', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.type = 'line';
    fixture.componentInstance.width = '40%';
    fixture.detectChanges();
    const td = fixture.debugElement.query(By.css('#td-host')).nativeElement as HTMLElement;
    const skel = td.querySelector('.skel') as HTMLElement | null;
    expect(skel).not.toBeNull();
    expect(td.classList.contains('skel-hide-content')).toBe(true);
  });

  it('removes from td when loading=false', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    const td = fixture.debugElement.query(By.css('#td-host')).nativeElement as HTMLElement;
    expect(td.querySelector('.skel')).toBeNull();
    expect(td.classList.contains('skel-hide-content')).toBe(false);
  });
});
