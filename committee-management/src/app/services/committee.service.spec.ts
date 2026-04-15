import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CommitteeService } from './committee.service';

describe('CommitteeService', () => {
  let service: CommitteeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CommitteeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

