import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Html5Qrcode } from 'html5-qrcode';
import { QrScanResult } from '../../../models/qr-attendance.model';
import { AttendanceService } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-attendance-scan',
  standalone: false,
  templateUrl: './attendance-scan.component.html',
  styleUrl: './attendance-scan.component.css'
})
export class AttendanceScanComponent {
  readonly scannerElementId = 'attendance-qr-reader';

  scanForm: FormGroup<{ qrToken: FormControl<string> }>;

  scannerActive = false;
  cameraStarting = false;
  cameraErrorMessage = '';
  loadingProfile = true;
  submitting = false;
  result: QrScanResult | null = null;
  resultMessage = '';
  resultType: 'success' | 'error' | null = null;

  private scanner: Html5Qrcode | null = null;
  private currentUserId: number | null = null;
  private scanConsumed = false;

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.scanForm = this.createScanForm();
  }

  private createScanForm(): FormGroup<{ qrToken: FormControl<string> }> {
    return this.fb.group({
      qrToken: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(4)])
    });
  }

  ngOnInit(): void {
    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        this.loadingProfile = false;
        this.currentUserId = profile.userId ?? null;
      },
      error: () => {
        this.loadingProfile = false;
        this.currentUserId = null;
      }
    });
  }

  ngOnDestroy(): void {
    void this.stopCameraScan();
  }

  async startCameraScan(): Promise<void> {
    if (this.scannerActive || this.cameraStarting) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraErrorMessage = 'Camera access is not supported in this browser. Use manual token entry.';
      return;
    }

    this.cameraStarting = true;
    this.cameraErrorMessage = '';
    this.scanConsumed = false;

    if (!this.scanner) {
      this.scanner = new Html5Qrcode(this.scannerElementId);
    }

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        this.cameraErrorMessage = 'No camera found. Use manual token entry.';
        this.cameraStarting = false;
        return;
      }

      const preferredCamera = cameras.find((camera) => /back|rear|environment/i.test(camera.label)) || cameras[0];
      await this.scanner.start(
        preferredCamera.id,
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText: string) => {
          if (this.scanConsumed || this.submitting) {
            return;
          }

          const trimmedToken = (decodedText || '').trim();
          if (!trimmedToken) {
            return;
          }

          this.scanConsumed = true;
          this.scanForm.patchValue({ qrToken: trimmedToken });
          void this.stopCameraScan();
          this.submitScan(trimmedToken);
        },
        () => {
          // Ignored scan errors while camera keeps running.
        }
      );

      this.scannerActive = true;
      this.cameraStarting = false;
    } catch {
      this.cameraStarting = false;
      this.scannerActive = false;
      this.cameraErrorMessage = 'Unable to start camera scanning. Check permission and try again.';
    }
  }

  async stopCameraScan(): Promise<void> {
    if (!this.scanner || !this.scannerActive) {
      return;
    }

    try {
      await this.scanner.stop();
      await this.scanner.clear();
    } catch {
      // Ignore teardown failures to avoid blocking scanner restart.
    } finally {
      this.scannerActive = false;
    }
  }

  submitManualToken(): void {
    if (this.scanForm.invalid) {
      this.scanForm.markAllAsTouched();
      return;
    }

    const token = (this.scanForm.controls.qrToken.value || '').trim();
    this.submitScan(token);
  }

  formatDateTime(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private submitScan(token: string): void {
    const normalizedToken = token.trim();
    if (!normalizedToken || this.submitting) {
      return;
    }

    this.submitting = true;
    this.result = null;
    this.resultMessage = '';
    this.resultType = null;

    this.attendanceService.scanQrAttendance(normalizedToken, this.currentUserId ?? undefined).subscribe({
      next: (result) => {
        this.submitting = false;
        this.result = result;
        this.resultType = 'success';
        this.resultMessage = 'Attendance marked successfully.';
        this.notificationService.add({
          title: 'Attendance Marked',
          message: `${result.eventName || 'Event'} check-in completed.`,
          level: 'success',
          actionRoute: '/student/attendance'
        });
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.result = null;
        this.resultType = 'error';
        this.resultMessage = this.extractErrorMessage(error, 'Unable to mark attendance with this QR token.');
        this.notificationService.add({
          title: 'Attendance Scan Failed',
          message: this.resultMessage,
          level: 'error',
          actionRoute: '/student/attendance/scan'
        });
      }
    });
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    return (
      (error?.error && typeof error.error === 'object' && (error.error.message || error.error.error)) ||
      (typeof error?.error === 'string' ? error.error : '') ||
      error?.message ||
      fallback
    );
  }
}
