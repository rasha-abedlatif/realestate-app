import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  saveToken(token: string, role: string, name: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('name', name);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    return this.getRole() === 'super_admin';
  }

  
  getUserComplexId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      
      return payload.complex_id ?? null;

    } catch (e) {
      console.error('Invalid token format', e);
      return null;
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}