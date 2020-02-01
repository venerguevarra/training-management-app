import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user.model';
import { environment } from '../../../../../environments/environment';
import { RoutingStateService } from '../../../../service/routing-state.service';

@Component({
	selector: 'app-course-registration',
	templateUrl: './course-registration.component.html',
	styleUrls: ['./course-registration.component.scss']
})
export class CourseRegistrationComponent {
	private readonly API_HOST = environment.API_HOST;

	registeredList;
	searchForm: FormGroup;
	selectedCourse;
	selectedAccount;

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
		private routingStateService: RoutingStateService)
	{
		this.getRegisteredList('REGISTERED').then(data =>{
			this.registeredList = data;
		});
		this.initForm();
		this.initializeRegistrationForm();
	}

	initForm() {
		this.searchForm = this.formBuilder.group({
			status: [""],
			startDate: [""],
			endDate: [""],
			accountId: [""],
			courseId: [""]
		});
		this.selectedAccount = 'undefined';
		this.selectedCourse = 'undefined';
	}

	getRegisteredList(status: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/find-by-status?status=${status}`;

		this.httpClient
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

	confirmRegistration(id: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/confirm?id=${id}`;

		this.httpClient
			.post<any[]>(ACTIVE_ENDPOINT, {})
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

	cancelRegistration(id: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/cancel?id=${id}`;

		this.httpClient
			.post<any[]>(ACTIVE_ENDPOINT, {})
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

	confirmRegistrationHandler(entity) {
		let registrationHtml =
		`
			<div class="card">
				<div class="box">
					<h2>${entity.account.name}</span></h2>
					<span>
						<table class="reg-table col-md-12">
							<tr class="pb-2">
								<td class="pr-2">
									<strong>Course</strong><br/>
									<span class="text-muted">${entity.course.name}</span><br/>
									<span class="text-muted">(${entity.course.numberOfDays} days)</span>
								</td>
							</tr>
							<tr class="pb-2">
								<td class="pr-2">
									<strong>Schedule</strong><br/>
									<span class="text-muted">
										Start Date: ${entity.courseSchedule.startDate} <br/>
										End Date: ${entity.courseSchedule.endDate}
									</span>
								</td>
							</tr>
						</table>
					</span>
					<br/>
				</div>
			</div>
		`;

		this.showConfirmationDialog('Confirm Registration', registrationHtml, 'question').then(e => {
			if(e.value) {
				this.confirmRegistration(entity.registration.id).then(e => {
					this.toastr.success(`Course registration confirmed for ${entity.account.name}.`, 'Success', { timeOut: 3000 });
					this.getRegisteredList('REGISTERED').then(data =>{
						this.registeredList = data;
					});
				}).catch(err => {
					this.toastr.error('Failed to confirm registration for ${entity.account.name}.', 'Failed Request', { timeOut: 3000 });
				});
			}
		});
	}

	cancelRegistrationHandler(entity) {

		let cancellationStatus = '';
		if((entity.registration.status == 'REGISTERED' || entity.registration.status == 'CONFIRMED') && entity.courseSchedule.status == 'SCHEDULE_WAITING') {
			cancellationStatus = 'This action will cancel the registration and delete registered participants.';
		} else if((entity.registration.status == 'REGISTERED' || entity.registration.status == 'CONFIRMED') && entity.courseSchedule.status == 'SCHEDULE_CONFIRMED') {
			cancellationStatus = 'This action will cancel the registration and registered participants will be retained.';
		}
		alert(cancellationStatus);
		let registrationHtml =
		`
			<div class="card">
				<div class="box">
					<h2>${entity.account.name}</span></h2>
					<strong>${cancellationStatus}</strong>
					<span>
						<table class="reg-table col-md-12">
							<tr class="pb-2">
								<td class="pr-2">
									<strong>Course</strong><br/>
									<span class="text-muted">${entity.course.name}</span><br/>
									<span class="text-muted">(${entity.course.numberOfDays} days)</span>
								</td>
							</tr>
							<tr class="pb-2">
								<td class="pr-2">
									<strong>Schedule</strong><br/>
									<span class="text-muted">
										Start Date: ${entity.courseSchedule.startDate} <br/>
										End Date: ${entity.courseSchedule.endDate}
									</span>
								</td>
							</tr>
						</table>
					</span>
					<br/>
				</div>
			</div>
		`;

		this.showConfirmationDialog('Cancel Registration', registrationHtml, 'question').then(e => {
			if(e.value) {
				this.cancelRegistration(entity.registration.id).then(e => {
					this.toastr.success(`${entity.account.name} registration cancelled.`, 'Success', { timeOut: 3000 });

					this.getRegisteredList('REGISTERED').then(data =>{
						this.registeredList = data;
					});
				}).catch(err => {
					this.toastr.error('Failed to cancel registration for ${entity.account.name}.', 'Failed Request', { timeOut: 3000 });
				});
			}
		});
	}

	showConfirmationDialog(title, html, type) {
        return swal.fire({
            title,
            html,
            type,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit',
            allowOutsideClick: false
		});
    }

	get f() { return this.searchForm.controls; }

	get registrationForm() { return this.registrationFormGroup.controls; }

	selectedAccountHandler($event) {
		if($event) {
			this.f.accountId.setValue($event.id);
		} else {
			this.f.accountId.setValue("");
		}
	}

	selectedCourseHandler($event) {
		if($event) {
			this.f.courseId.setValue($event.id);
		} else {
			this.f.courseId.setValue("");
		}
	}

	search($event) {
		this.searchCourseRegistration().then(data =>{
			console.log(data);
			this.registeredList = data;
		});
	}

	searchCourseRegistration(): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/find-by-status`;

		let queryParams: any = {};
		if(this.f.accountId.value != '') {
			queryParams.accountId = this.f.accountId.value;
		}
		if(this.f.courseId.value != '') {
			queryParams.courseId = this.f.courseId.value;
		}
		if(this.f.status.value != '') {
			queryParams.status = this.f.status.value;
		}
		if(this.f.startDate.value != '') {
			let month = `0${this.searchForm.get('startDate').value.month}`.slice(-2);
			let day = `0${this.searchForm.get('startDate').value.day}`.slice(-2);
			let year = `${this.searchForm.get('startDate').value.year}`;
			let scheduleDateFrom = `${year}-${month}-${day}`;
			queryParams.startDate = scheduleDateFrom;
		}
		if(this.f.endDate.value != '') {
			let month = `0${this.searchForm.get('endDate').value.month}`.slice(-2);
			let day = `0${this.searchForm.get('endDate').value.day}`.slice(-2);
			let year = `${this.searchForm.get('endDate').value.year}`;
			let scheduleDateTo = `${year}-${month}-${day}`;
			queryParams.endDate = scheduleDateTo;
		}

		console.log(queryParams);
		this.httpClient
			.get<any[]>(ACTIVE_ENDPOINT, {params: {...queryParams}})
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

	clear($event) {
		this.initForm();
		this.registeredList = [];
	}

	showModal: boolean = false;
    showRegistrationForm(participant, registration) {
        this.showModal = true;
		this.registrationFormGroup = this.formBuilder.group({
			id: [participant.id, [Validators.required]],
			courseRegistrationId: [registration.registration.id, [Validators.required]],
			courseScheduleId: [registration.courseSchedule.id, [Validators.required]],
			courseId: [registration.course.id, [Validators.required]],
            firstName: [participant.firstName, [Validators.required]],
            lastName: [participant.lastName, [Validators.required]],
            middleInitial: [participant.middleInitial],
            email: [participant.email, [Validators.required]],
            designation: [participant.designation, [Validators.required]],
            mobileNumber: [participant.mobileNumber, [Validators.required]]
        });
    }

    hideRegistrationForm() {
        this.showModal = false;
		this.registeredList = [];
    }

	registrationFormGroup: FormGroup;
	submitted = false;
	initializeRegistrationForm() {
		this.registrationFormGroup = this.formBuilder.group({
			id: ['', [Validators.required]],
			courseRegistrationId: ['', [Validators.required]],
			courseScheduleId: ['', [Validators.required]],
			courseId: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            middleInitial: [''],
            email: ['', [Validators.required]],
            designation: ['', [Validators.required]],
            mobileNumber: ['', [Validators.required]]
        });
	}


	update() {
		this.showConfirmationDialog('Confirm Profile Update', `All changes will be permanent for ${this.registrationForm.email.value}`, 'question').then(e => {
			if(e.value) {
				this.updateParticipantProfile().then(e => {
					this.toastr.success(`Participant successfull updated ${this.registrationForm.email.value}.`, 'Success', { timeOut: 3000 });
					this.hideRegistrationForm();
					this.search(null);
				}).catch(err => {
					this.toastr.error(`Failed to update participant profile ${this.registrationForm.email.value}.`, 'Failed Request', { timeOut: 3000 });
				});
			}
		});
	}
	updateParticipantProfile(): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-participants/${this.registrationForm.id.value}`;

		let requestBody = {
			firstName: this.registrationForm.firstName.value,
			lastName: this.registrationForm.lastName.value,
			middleInitial: this.registrationForm.middleInitial.value,
			email: this.registrationForm.email.value,
			designation: this.registrationForm.designation.value,
			mobileNumber: this.registrationForm.mobileNumber.value,
			courseRegistrationId: this.registrationForm.courseRegistrationId.value,
			courseScheduleId: this.registrationForm.courseScheduleId.value,
			courseId: this.registrationForm.courseId.value,
		}

		this.httpClient
			.put<any[]>(ACTIVE_ENDPOINT, requestBody)
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

	close() {
		this.initializeRegistrationForm();
		this.search(null);
		this.hideRegistrationForm();
	}

	isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}

}