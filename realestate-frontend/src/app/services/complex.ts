import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplexService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getComplexes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/complexes`);
  }

  getComplex(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/complexes/${id}`);
  }

  createComplex(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/complexes`, data);
  }
}