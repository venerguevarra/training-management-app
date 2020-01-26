import { Component, ViewChild, OnInit } from '@angular/core';
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
import { Registration } from '../../../model/registration.model';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration.component.html'
})
export class RegistrationPageComponent {

    registrationForm: FormGroup;
    registrations: Registration[] = [];
    registrationModel: Registration;
    action: string = 'new';
    currentRow: number;

    constructor(
        private authService: AuthService,
        private stateService: StateService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.initializeForm();
    }

    showModal: boolean = false;
    showRegistrationForm(action: string = 'new') {
        this.action = action;
        this.showModal = true;
    }

    hideRegistrationForm() {
        this.showModal = false;
        this.initializeForm();
    }

    initializeForm() {
        this.registrationForm = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            middleInitial: [''],
            email: ['', [Validators.required]],
            designation: ['', [Validators.required]],
            mobileNumber: ['', [Validators.required]]
        });
        this.registrationForm.markAsPristine();
        this.registrationForm.markAsUntouched();
        this.submitted = false;
        this.action = 'new';
        this.currentRow = -1;
    }

    get f() {
        return this.registrationForm.controls;
    }

    isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}

    submitted = false;
    addRegistrationHandler($event) {
        this.submitted = true;

        if (this.registrationForm.invalid) {
            return;
        }

        let registration = this.registrationInstance();
        this.addRegistration(registration);
        this.initializeForm();
    }

    private addRegistration(registration: Registration) {
        if(registration) {
            this.registrations.push(registration);
        }
    }

    editRegistrationHandler(index: number) {
        this.currentRow = index;
        this.registrationModel = this.registrations[this.currentRow];
        this.registrationForm = this.formBuilder.group({
            firstName: [this.registrationModel.firstName, [Validators.required]],
            lastName: [this.registrationModel.lastName, [Validators.required]],
            middleInitial: [this.registrationModel.middleInitial],
            email: [this.registrationModel.email, [Validators.required]],
            designation: [this.registrationModel.designation, [Validators.required]],
            mobileNumber: [this.registrationModel.mobileNumber, [Validators.required]]
        });

        this.showRegistrationForm('edit');
    }

    updateRegistrationHandler($event) {
        alert(this.currentRow);

        this.submitted = true;

        if (this.registrationForm.invalid) {
            return;
        }

        let registration = this.registrationInstance();

        this.registrations.splice(this.currentRow, 1, registration);
    }

    deleteRegistrationHandler(index: number) {
        this.action = 'delete';
        this.registrations.splice(index, 1);
    }

    registrationInstance(): Registration {
        let registration = new Registration(
            this.f.firstName.value,
            this.f.lastName.value,
            this.f.middleInitial.value,
            this.f.email.value,
            this.f.designation.value,
            this.f.mobileNumber.value
        );
        return registration;
    }
}
