import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() message = '¿Estás seguro de esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() cancel = new EventEmitter<void>();
}
