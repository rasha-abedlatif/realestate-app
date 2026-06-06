import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getAdmins(page: number = 1, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', '10')
      .set('search', search);
    return this.http.get(`${this.apiUrl}/admins`, { params });
  }

  getAdmin(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins/${id}`);
  }

  createAdmin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admins`, data);
  }
}