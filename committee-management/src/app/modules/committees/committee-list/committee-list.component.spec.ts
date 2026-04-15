import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommitteeListComponent } from './committee-list.component';

describe('CommitteeListComponent', () => {
  let component: CommitteeListComponent;
  let fixture: ComponentFixture<CommitteeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitteeListComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommitteeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



