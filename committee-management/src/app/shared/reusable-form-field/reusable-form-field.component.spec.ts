import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableFormFieldComponent } from './reusable-form-field.component';

describe('ReusableFormFieldComponent', () => {
  let component: ReusableFormFieldComponent;
  let fixture: ComponentFixture<ReusableFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReusableFormFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
