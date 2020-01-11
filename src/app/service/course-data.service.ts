import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Course {
    id: string;
    createdDate?: string;
    createdBy?: string;
    modifiedDate?: string;
    active?: string;
    name?: string;
    description?: string;
    courseFee?: number;
    numberOfDays: number
}

@Injectable({
    providedIn: 'root'
})
export class CourseDataService {
    private readonly API_HOST = environment.API_HOST;
    private readonly ACTIVE_COURSES_ENDPOINT: string = `${this.API_HOST}/courses/actions/find-all-active?type=all`;

    constructor(private http: HttpClient) { }

    getActiveCourses(term: string = null): Observable<any[]> {
        return this.http.get<any[]>(this.ACTIVE_COURSES_ENDPOINT);

    }
}