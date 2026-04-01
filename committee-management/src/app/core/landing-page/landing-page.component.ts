import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  highlights = [
    'Manage committees and members',
    'Track events and registrations',
    'Monitor attendance and task progress'
  ];
}
