import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: { id: string; username: string; email: string; role: 'user' | 'admin' };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password });
  }

  register(payload: { username: string; email: string; password: string; role?: string }) {
    return this.http.post<any>(`${this.base}/register`, payload);
  }

  logout() {
    localStorage.removeItem('user');
  }

  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn() {
    return !!this.getUser();
  }
}
