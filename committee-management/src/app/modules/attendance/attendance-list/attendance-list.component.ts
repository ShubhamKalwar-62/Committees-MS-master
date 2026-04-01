import { Component } from '@angular/core';
import { Attendance } from '../../../models/attendance.model';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {
  records: Attendance[] = [];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.attendanceService.getAttendanceList().subscribe((records) => {
      this.records = records;
    });
  }

}
