import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/payments`;

  initiatePayment(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/initiate`, { sessionId });
  }

  verifyPayment(data: {
    sessionId: number;
    gatewayOrderId: string;
    gatewayPaymentId: string;
    gatewaySignature: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify`, data);
  }

  getMyPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }
}