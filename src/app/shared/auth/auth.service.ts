import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { first } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/Rx';
import { catchError, tap, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
@Injectable()
export class AuthService {
  private readonly API_HOST = environment.API_HOST;
  private readonly AUTHENTICATE_URL: string = `${this.API_HOST}/authenticate`;
  private readonly VALIDATE_TOKEN_URL: string = `${this.API_HOST}/validate-token`;
  private token: string;

  constructor(
    private router: Router,
    private httpClient: HttpClient) {}

  readonly HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  signinUser(username: string, password: string) {
    let loginRequest = {
      username,
      password
    };

    return this.httpClient.post<any>(this.AUTHENTICATE_URL, loginRequest, this.HTTP_OPTIONS);    
  }

  logout() {
    this.token = null;
  }

  getToken() {
    return this.token;
  }

  setToken(authorizationToken) {
    this.token = authorizationToken;
  }

  isAuthenticated() {    
    if(this.getToken() == null || this.getToken() === 'undefined') {
      return false;
    }
    
    let tokenRequest = {
      token: this.getToken()
    };

    return this.httpClient.post<any>(this.VALIDATE_TOKEN_URL, tokenRequest, this.HTTP_OPTIONS)
        .pipe(map(response => {
            return response;
        })).pipe(first())
            .subscribe(data => {
                return true;
            },
            error => {
                return false;
            });;
    
  }
}
