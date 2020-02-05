import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { first } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/Rx';
import { catchError, tap, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { StateService } from '../../service/state.service';

@Injectable()
export class AuthService {
  private readonly API_HOST = environment.API_HOST;
  private readonly AUTHENTICATE_ENDPOINT: string = `${this.API_HOST}/authenticate`;
  private readonly VALIDATE_TOKEN_ENDPOINT: string = `${this.API_HOST}/validate-token`;
  private token: string;

  constructor(
    private stateService: StateService,
    private router: Router,
    private httpClient: HttpClient) {}

  signinUser(username: string, password: string) {
    this.token = null;
    this.stateService.removeCurrentUser();

    let loginRequest = {
      username,
      password
    };

    return this.httpClient.post<any>(this.AUTHENTICATE_ENDPOINT, loginRequest);
  }

  logout() {
    this.token = null;
    this.stateService.removeCurrentUser();
  }

  getToken() {
    return this.token;
  }

  setToken(authorizationToken) {
    this.token = authorizationToken;
  }

  isAuthenticated() {
    return this.stateService.hasCurrentUser();
  }
}
