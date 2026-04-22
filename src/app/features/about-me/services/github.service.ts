// core/services/miapi.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MiapiService {

    private http = inject(HttpClient);
    private baseUrl = 'https://api.github.com/users/juanma7882';

    getData(): Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }
}
