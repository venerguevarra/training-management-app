import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Account {
    name: string;
    value: string;
}

@Injectable({
    providedIn: 'root'
})
export class AccountDataService {
    private readonly API_HOST = environment.API_HOST;
    private readonly ACTIVE_RESOURCE_ENDPOINT: string = `${this.API_HOST}/references/accounts`;

    constructor(private http: HttpClient) { }

    getActive(term: string = null): Observable<any[]> {
        return this.http.get<any[]>(this.ACTIVE_RESOURCE_ENDPOINT);

    }

    getActiveById(id: string = null): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_HOST}/references/accounts?user=${id}`);

    }
}