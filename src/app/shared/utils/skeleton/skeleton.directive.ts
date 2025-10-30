import { Directive, ElementRef, Renderer2, Input, OnChanges, inject } from '@angular/core';

@Directive({
  selector: '[appSkeleton]',
  standalone: true,
})
export class SkeletonDirective implements OnChanges {
  @Input('appSkeleton') loading = false;
  @Input() skelType: 'line' | 'circle' | 'block' = 'line';
  @Input() skelWidth?: string;
  @Input() skelHeight?: string;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly r = inject(Renderer2);

  private placeholder?: HTMLElement;

  ngOnChanges() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.loading ? this.enable() : this.disable();
  }

  private enable() {
    const host = this.el.nativeElement;
    this.r.addClass(host, 'skel-host');
    this.r.addClass(host, 'skel-hide-content');

    if (!this.placeholder) {
      this.placeholder = this.r.createElement('span');
      this.r.addClass(this.placeholder, 'skel');
      this.r.addClass(this.placeholder, `skel--${this.skelType}`);
      if (this.skelWidth) this.r.setStyle(this.placeholder, 'width', this.skelWidth);
      if (this.skelHeight) this.r.setStyle(this.placeholder, 'height', this.skelHeight);
      if (host.tagName === 'TD' || host.tagName === 'TH')
        this.r.addClass(this.placeholder, 'skel--in-td');
      this.r.insertBefore(host, this.placeholder, host.firstChild);
    }
  }

  private disable() {
    const host = this.el.nativeElement;
    this.r.removeClass(host, 'skel-host');
    this.r.removeClass(host, 'skel-hide-content');
    if (this.placeholder) {
      this.r.removeChild(host, this.placeholder);
      this.placeholder = undefined;
    }
  }
}
