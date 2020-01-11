import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AccountManager {
    name: string;
    value: string;
}

@Injectable({
    providedIn: 'root'
})
export class AccountManagerDataService {
    private readonly API_HOST = environment.API_HOST;
    private readonly ACTIVE_SALES_USERS_ENDPOINT: string = `${this.API_HOST}/references/sales-users`;

    constructor(private http: HttpClient) { }

    getActive(term: string = null): Observable<any[]> {
        return this.http.get<any[]>(this.ACTIVE_SALES_USERS_ENDPOINT);

    }
}