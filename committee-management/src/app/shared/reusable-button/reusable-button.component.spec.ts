import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableButtonComponent } from './reusable-button.component';

describe('ReusableButtonComponent', () => {
  let component: ReusableButtonComponent;
  let fixture: ComponentFixture<ReusableButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReusableButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
