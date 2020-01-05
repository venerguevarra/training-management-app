import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/Rx';
import { catchError, tap, map } from 'rxjs/operators';

import { AuthService } from '../../../shared/auth/auth.service';
import { StateService } from '../../../service/state.service';
import { User } from '../../../model/user';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

    loginForm: FormGroup;
    submitted = false;
    loginError = false;
    returnUrl: string;

    constructor(
        private authService: AuthService,
        private stateService: StateService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.loginForm.get("username").setValue('admin');
        this.loginForm.get("password").setValue('Work6ten');
        this.authService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    hasError(field: string) {
        return ((this.loginForm.get(field).dirty || this.loginForm.get(field).touched) && this.loginForm.get(field).invalid && 
                    this.loginForm.get(field).errors.required && !this.submitted) || 
                (
                    this.loginForm.get(field).untouched && 
                    this.loginForm.get(field).invalid && 
                    this.loginForm.get(field).errors.required && 
                    this.submitted
                );
    }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        this.authService.signinUser(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(data => {
                this.authService.setToken(data.token);
                let user: User = {
                    userId: data.userId,
                    profileId: data.profileId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    middleInitial: data.middleInitial,
                    email: data.email,
                    username: data.username,
                    token: data.token
                }
                this.stateService.setCurrentUser(user);
                this.router.navigateByUrl(this.returnUrl);
            },
            error => {
                console.log(error);
                this.loginError = true;
            });
    }

}
