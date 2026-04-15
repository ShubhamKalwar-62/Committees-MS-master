import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

