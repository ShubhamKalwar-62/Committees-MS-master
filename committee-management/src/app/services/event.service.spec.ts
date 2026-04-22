import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST /api/registrations with snake_case payload', () => {
    service.registerForEvent(9, 42).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.message).toBe('Participant registered successfully');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/registrations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user_id: 42, event_id: 9 });

    req.flush({ success: true, message: 'Participant registered successfully', data: {} });
  });

  it('should map and de-duplicate user registered events', () => {
    service.getRegisteredEventsForUser(5).subscribe((events) => {
      expect(events.length).toBe(2);
      expect(events[0].id).toBe(7);
      expect(events[0].eventName).toBe('Tech Summit');
      expect(events[0].registrationStatus).toBe('APPROVED');
      expect(events[1].id).toBe(8);
      expect(events[1].registrationStatus).toBe('REJECTED');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/registrations/user/5');
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Registrations retrieved successfully',
      data: [
        {
          status: 'APPROVED',
          event: {
            eventId: 7,
            eventName: 'Tech Summit',
            eventDate: '2026-04-20T09:00:00',
            description: 'A student event',
            venue: 'Hall A'
          }
        },
        {
          status: 'PENDING',
          event: {
            eventId: 7,
            eventName: 'Tech Summit',
            eventDate: '2026-04-20T09:00:00',
            description: 'Duplicate row',
            venue: 'Hall A'
          }
        },
        {
          status: 'REJECTED',
          event: {
            eventId: 8,
            eventName: 'Rejected Event',
            eventDate: '2026-04-22T11:00:00'
          }
        }
      ]
    });
  });
});
