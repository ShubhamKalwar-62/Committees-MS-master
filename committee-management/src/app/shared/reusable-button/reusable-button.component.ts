import { Component } from '@angular/core';
import { Input } from '@angular/core';

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

  get buttonClass(): string {
    const normalizedVariant = (this.variant || 'primary').toLowerCase();
    const variantClassMap: Record<string, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-slate-600 text-white hover:bg-slate-700',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
      warning: 'bg-amber-500 text-slate-900 hover:bg-amber-600',
      info: 'bg-cyan-500 text-white hover:bg-cyan-600',
      light: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
      dark: 'bg-slate-900 text-white hover:bg-slate-800',
      'outline-primary': 'border border-blue-500 bg-white text-blue-600 hover:bg-blue-50',
      'outline-secondary': 'border border-slate-400 bg-white text-slate-700 hover:bg-slate-50',
      'outline-success': 'border border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50',
      'outline-danger': 'border border-rose-500 bg-white text-rose-700 hover:bg-rose-50'
    };

    return variantClassMap[normalizedVariant] || variantClassMap['primary'];
  }
}
