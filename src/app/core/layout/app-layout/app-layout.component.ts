import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent, AppFooterComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {}
