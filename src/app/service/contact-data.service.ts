import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContactDataService {
    private readonly API_HOST = environment.API_HOST;
    private readonly ACTIVE_RESOURCE_ENDPOINT: string = `${this.API_HOST}/references/contacts`;

    constructor(private http: HttpClient) { }

    getActive(): Observable<any[]> {
        return this.http.get<any[]>(this.ACTIVE_RESOURCE_ENDPOINT);

    }

    getActiveByAccountId(id: string = null): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_HOST}/references/contacts?accountId=${id}`);

    }
}