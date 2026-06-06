import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getBuildings(complexId?: number): Observable<any> {
    let params = new HttpParams();
    if (complexId) {
      params = params.set('complex_id', complexId.toString());
    }
    return this.http.get(`${this.apiUrl}/buildings`, { params });
  }

  createBuilding(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/buildings`, data);
  }

  deleteBuilding(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/buildings/${id}`);
  }
}