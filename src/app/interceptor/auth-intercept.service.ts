import {
    HttpEvent,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
    HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';

export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // add authorization header with basic auth credentials if available
        const token = this.authService.getToken();
        if (token) {
            request = request.clone({
                setHeaders: {
                    'Content-Type' : 'application/json; charset=utf-8',
                    'Accept'       : 'application/json',
                    'Authorization': `Bearer ${this.authService.getToken()}`,
                },
            });

        } else {
            request = request.clone({
                setHeaders: {
                    'Content-Type' : 'application/json; charset=utf-8',
                    'Accept'       : 'application/json'
                },
            });
        }

        return next.handle(request);
    }
}