import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AnnouncementCreateComponent } from './announcement-create.component';

describe('AnnouncementCreateComponent', () => {
  let component: AnnouncementCreateComponent;
  let fixture: ComponentFixture<AnnouncementCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnouncementCreateComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



