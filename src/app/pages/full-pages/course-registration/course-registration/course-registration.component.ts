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
		private routingStateService: RoutingStateService) {
			this.getRegisteredList('REGISTERED').then(data =>{
				this.registeredList = data;
			});
			this.initForm();
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
					console.log(res);
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

		this.showConfirmationDialog('Confrm Registration', registrationHtml, 'question').then(e => {
			if(e.value) {
				this.confirmRegistration(entity.registration.id).then(e => {
					this.toastr.success(`Course registration confirmed for ${entity.account.name}.`, 'Success', { timeOut: 3000 });
				}).catch(err => {
					this.toastr.error('Failed to confirm registratoin for ${entity.account.name}.', 'Failed Request', { timeOut: 3000 });
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
			this.registeredList = data;
			console.log(this.registeredList);
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
	}
}