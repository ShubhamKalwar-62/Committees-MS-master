import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-reusable-button',
  standalone: false,
  templateUrl: './reusable-button.component.html',
  styleUrl: './reusable-button.component.css'
})
export class ReusableButtonComponent {
  @Input() label = 'Submit';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Output() buttonClick = new EventEmitter<void>();

  get buttonClass(): string {
    const normalizedVariant = (this.variant || 'primary').toLowerCase();
    if (normalizedVariant === 'secondary') {
      return 'border border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-800';
    }

    if (normalizedVariant === 'outline') {
      return 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50';
    }

    return 'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700';
  }

  onClick(): void {
    this.buttonClick.emit();
  }
}
