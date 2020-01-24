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
import { User } from '../../../model/user.model';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration.component.html'
})
export class RegistrationPageComponent {


    constructor(
        private authService: AuthService,
        private stateService: StateService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) { }

    ngOnInit() {

    }

    // convenience getter for easy access to form fields
    //get f() { return this.loginForm.controls; }

}
