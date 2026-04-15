import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ReusableButtonComponent } from './reusable-button.component';

describe('ReusableButtonComponent', () => {
  let component: ReusableButtonComponent;
  let fixture: ComponentFixture<ReusableButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReusableButtonComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
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



