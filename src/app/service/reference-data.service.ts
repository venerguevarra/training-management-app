import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ReferenceDataService {
  private readonly API_HOST = environment.API_HOST;
  private readonly ACTIVE_RESOURCE_ENDPOINT: string = `${this.API_HOST}/references`;
  private readonly REGISTRATION_EMAIL_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/send-registration-email`;

  constructor(private http: HttpClient) {}

  sendRegistrationEmail(courseRegistrationId: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.REGISTRATION_EMAIL_ENDPOINT}/${courseRegistrationId}`, {});
  }

  getActiveReferences(referenceEntity: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.ACTIVE_RESOURCE_ENDPOINT}/${referenceEntity}`);
  }

  getActiveReferencesByAccountId(referenceEntity: string, id: string = null): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.ACTIVE_RESOURCE_ENDPOINT}/${referenceEntity}?accountId=${id}`
    );
  }

  getActiveReferencesByCourseId(referenceEntity: string, id: string = null): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.ACTIVE_RESOURCE_ENDPOINT}/${referenceEntity}?courseId=${id}`
    );
  }

  getActiveReferenceData(entity: string): Observable<any[]> {
    const ACTIVE_ENDPOINT: string = `${this.API_HOST}/${entity}/actions/find-all-active?type=all`;

    return this.http.get<any[]>(ACTIVE_ENDPOINT);
  }

  findAll(entity: string): Observable<any[]> {
    const ACTIVE_ENDPOINT: string = `${this.API_HOST}/${entity}/actions/find-list`;

    return this.http.get<any[]>(ACTIVE_ENDPOINT);
  }

  findById(entity: string, id: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      const ACTIVE_ENDPOINT: string = `${this.API_HOST}/${entity}/${id}`;

      this.http
        .get<any[]>(ACTIVE_ENDPOINT, {})
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => {
            reject(msg);
          }
        );
    });

    return promise;
  }

  deleteById(entity: string, id: string): Observable<any[]> {
    const ACTIVE_ENDPOINT: string = `${this.API_HOST}/${entity}/${id}`;

    return this.http.delete<any[]>(ACTIVE_ENDPOINT);
  }

  getEntityData(entity: string, id: string): Observable<any[]> {
    const RESOURCE_ENDPOINT: string = `${this.API_HOST}/${entity}/${id}`;

    return this.http.get<any>(RESOURCE_ENDPOINT);
  }
}
