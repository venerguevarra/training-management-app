import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import swal from 'sweetalert2';

import { Observable, of, throwError } from 'rxjs';
import 'rxjs/Rx';
import { catchError, tap, map } from 'rxjs/operators';

import { AuthService } from '../../../shared/auth/auth.service';
import { StateService } from '../../../service/state.service';
import { User } from '../../../model/user.model';
import { Registration } from '../../../model/registration.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})
export class RegistrationPageComponent {
    private readonly API_HOST = environment.API_HOST;

    registrationForm: FormGroup;
    registrations: Registration[] = [];
    registrationModel: Registration;
    action: string = 'new';
    currentRow: number;

    courseRegistration: any;
    courseRegistrationCount = 0;
    courseRegistrationName = "";
    accountName = "";
    courseRegisrationToken = "";
    courseScheduleId = "";

    constructor(
        private authService: AuthService,
        private stateService: StateService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient) {

        this.route.queryParams.subscribe(params => {
            if(params.registrationToken) {
                this.validateToken(params.registrationToken).then(res => {
                    if(res['token'] && res['registration']) {
                        this.courseRegistration = res;
                        this.courseRegisrationToken = params.registrationToken;
                        console.log(res, this.courseRegistration);
                        this.courseScheduleId = this.courseRegistration.registration.id;
                        this.courseRegistrationCount = this.courseRegistration.registration.registrationCount;
                        this.courseRegistrationName = this.courseRegistration.course.name;
                        this.accountName = this.courseRegistration.accountName;

                        if(res['registration']['status'] != 'PENDING') {
                            this.router.navigateByUrl("/error?message=invalid_token");
                        }
                    }
                });
            } else {
                this.router.navigateByUrl("/error?message=invalid_token");
            }

        });
    }

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
        this.emailTaken = false;
        this.mobileNumberTaken = false;
    }

    get f() {
        return this.registrationForm.controls;
    }

    isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}

    submitted = false;
    emailTaken = false;
    mobileNumberTaken = false;
    addRegistrationHandler($event) {
        this.submitted = true;

        if (this.registrationForm.invalid) {
            return;
        }

        let registration = this.registrationInstance();
        let index: number = this.registrations.filter(e => e.email == registration.email || e.mobileNumber == registration.mobileNumber).length;
        this.emailTaken = this.registrations.filter(e => e.email == registration.email).length > 0;
        this.mobileNumberTaken = this.registrations.filter(e => e.mobileNumber == registration.mobileNumber).length > 0;

        if(this.emailTaken || this.mobileNumberTaken) {
            return;
        }

        this.addRegistration(registration);
        this.initializeForm();

        if(!(this.registrations.length < this.courseRegistrationCount)) {
            this.hideRegistrationForm();
        }
    }

    validateEmailAndMobileNumber() {
        this.emailTaken = this.registrations.filter(e => e.email == this.f.email.value).length > 0;
        this.mobileNumberTaken = this.registrations.filter(e => e.mobileNumber == this.f.mobileNumber.value).length > 0;
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
        this.submitted = true;

        if (this.registrationForm.invalid) {
            return;
        }

        let registration = this.registrationInstance();

        this.registrations.splice(this.currentRow, 1, registration);
        this.hideRegistrationForm();
    }

    deleteRegistrationHandler(index: number) {
        this.action = 'delete';

        this.showConfirmationDialog('Unregister', `Unregister ${this.registrations[index].email}?`, 'question').then(e=>{
            if(e.value) {
                this.registrations.splice(index, 1);
            }
        });
    }

    showConfirmationDialog(title, text, type) {
        return swal.fire({
            title,
            text,
            type,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit',
            allowOutsideClick: false
		});
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

    validateToken(registrationToken: string) {
        let promise = new Promise((resolve, reject) => {
        const VALIDATE_TOKEN_ENDPOINT: string = `${this.API_HOST}/course-registration/validate`;

        let params = new HttpParams().set('token', registrationToken);

        this.http
            .post<any[]>(VALIDATE_TOKEN_ENDPOINT, {}, {params})
            .toPromise()
            .then(
            res => {
                resolve(res);
            },
            msg => {
                reject(msg);
                this.router.navigateByUrl("/error");
            }
            );
        });

        return promise;
    }

    register($event) {
        this.showConfirmationDialog('Confirm Registration', `Register participants to ${this.courseRegistrationName}?`, 'question').then(e=>{
            if(e.value) {
                this.registerCourseParticipants().then(e=> {
                    this.router.navigateByUrl("/registration-success");
                }).catch(err => {
                     this.router.navigateByUrl("/error");
                });
            }
        });
    }
    registerCourseParticipants() {
        let promise = new Promise((resolve, reject) => {
        const COURSE_REGISTRATION_ENDPOINT: string = `${this.API_HOST}/course-registration`;

        let requestBody = {
            participants: this.registrations,
            courseScheduleId: this.courseScheduleId,
            token: this.courseRegisrationToken
        }

        this.http
            .post<any[]>(COURSE_REGISTRATION_ENDPOINT, requestBody)
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

    get registrationCount() {
        return this.registrations.length;
    }
}
