import { Component, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../service/state.service';
import { User } from '../../../model/user.model';

import { environment } from '../../../../environments/environment';
import { MustMatch } from '../../../validator/must-match.validator';
import { AuthService } from '../../../shared/auth/auth.service';

@Component({
	selector: 'app-course-participant-list',
	templateUrl: './course-participant-list.component.html',
	styleUrls: ['./course-participant-list.component.scss']
})
export class CourseParticipantListComponent {

	private readonly API_HOST = environment.API_HOST;

	@Input() courseScheduleId;
	@Input() canEnroll: boolean;

	confirmedRegistrationListForm: FormGroup;
	registeredList: any[];
	isAllConfirmedSelected: boolean = false;

	enrolledListForm: FormGroup;
	enrolledList: any[];
	isAllEnrolledSelected: boolean = false;

	constructor(
		private authService: AuthService,
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute)
	{
		this.confirmedRegistrationListForm = this.formBuilder.group({
    		registrations: this.formBuilder.array([]),
			registrationAll: [false]
  		});

		this.enrolledListForm = this.formBuilder.group({
    		registrations: this.formBuilder.array([]),
			registrationAll: [false]
  		});
	}

	selectedConfirmedParticipantList: Array<string> = [];
	onConfirmedRegistrationFormChange(e) {
		const registrations: FormArray = this.confirmedRegistrationListForm.get('registrations') as FormArray;

		this.isAllConfirmedSelected = false;

		if (e.target.checked) {
			this.selectedConfirmedParticipantList.push(e.target.value);
		} else {
			let index: number = 0;
			this.selectedConfirmedParticipantList.forEach((id) => {
				if(id == e.target.value) {
					this.selectedConfirmedParticipantList.splice(index, 1);
					return;
				}
				index++;
			});
		}
	}

	onConfirmedRegistrationFormAll(e) {
		const registrations: FormArray = this.confirmedRegistrationListForm.get('registrations') as FormArray;

		if (e.target.checked) {
			this.registeredList.forEach((item) => {
				item.selected = true;
				this.selectedConfirmedParticipantList.push(item.participant.id);
			});
			this.isAllConfirmedSelected = true;

		} else {
			this.registeredList.forEach((item) => {
				item.selected = false;
				let index: number = 0;
				this.selectedConfirmedParticipantList.forEach((id) => {
					this.selectedConfirmedParticipantList.splice(index, 1);
					index++;
				});
			})
			this.isAllConfirmedSelected = false;
		}
	}

	selectedEnrolledParticipantList: Array<string> = [];
	onEnrolledFormChange(e) {
		const registrations: FormArray = this.enrolledListForm.get('registrations') as FormArray;

		this.isAllEnrolledSelected = false;

		if (e.target.checked) {
			this.selectedEnrolledParticipantList.push(e.target.value);
		} else {
			let index: number = 0;
			this.selectedEnrolledParticipantList.forEach((id) => {
				if(id == e.target.value) {
					this.selectedEnrolledParticipantList.splice(index, 1);
					return;
				}
				index++;
			});
		}
	}

	onEnrolledFormAll(e) {
		const registrations: FormArray = this.enrolledListForm.get('registrations') as FormArray;

		if (e.target.checked) {
			this.enrolledList.forEach((item) => {
				item.selected = true;
				this.selectedEnrolledParticipantList.push(item.participant.id);
			});
			this.isAllEnrolledSelected = true;

		} else {
			this.enrolledList.forEach((item) => {
				let index: number = 0;
				this.selectedEnrolledParticipantList.forEach((id) => {
					this.selectedEnrolledParticipantList.splice(index, 1);
					index++;
				});

			})
			this.isAllEnrolledSelected = false;
		}
	}

    get confirmedRegistrationForm() { return this.confirmedRegistrationListForm.controls; }

	get enrolledForm() { return this.enrolledListForm.controls; }

	submit() {
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['courseScheduleId'] && changes['courseScheduleId'].currentValue) {

			this.getParticipants(changes['courseScheduleId'].currentValue).then(data => {
				this.registeredList = data['items'];
			});

			this.getEnrolledParticipants(changes['courseScheduleId'].currentValue).then(data => {
				this.enrolledList = data['items'];
			});

			this.getCourseSchedule(changes['courseScheduleId'].currentValue).then(data => {
				this.currentCourseSchedule = data;
			});

        }

		if (changes['canEnroll'] && changes['canEnroll'].currentValue) {
			this.canEnroll = changes['canEnroll'].currentValue;
		}
    }

	getParticipants(id: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-participants/actions/find-participants/${id}`;

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

	getEnrolledParticipants(id: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-participants/actions/find-enrolled-participants/${id}`;

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

	addToClass(): Promise<any> {
		if(this.selectedConfirmedParticipantList.length == 0) {
			this.toastr.error("No confirmed registrations selected ", "Failed Request", { timeOut: 3000 });
			return;
		}
		const ENDPOINT: string = `${this.API_HOST}/course-participants/actions/change-status-enroll`;

		let requestBody = {
			participants: this.selectedConfirmedParticipantList,
			courseScheduleId: this.courseScheduleId
		}

		this.httpClient
			.post(ENDPOINT, requestBody, { observe: 'response' })
			.subscribe(
				(data) => {
					this.toastr.success(`Participants successfully enrolled.`, 'Success', { timeOut: 3000 });
					this.refreshList();
					this.selectedConfirmedParticipantList = [];
				},
				(error) => {
					this.toastr.error('Failed to enroll participants', 'Failed request', { timeOut: 3000 });
				}
			);
	}

	rescheduleEnrolled(): Promise<any> {

		if(this.selectedEnrolledParticipantList.length == 0) {
			this.toastr.error("No enrolled participants selected ", "Failed Request", { timeOut: 3000 });
			return;
		}
		const ENDPOINT: string = `${this.API_HOST}/course-participants/actions/change-status-reschedule`;

		let requestBody = {
			participants: this.selectedEnrolledParticipantList,
			courseScheduleId: this.courseScheduleId
		}

		this.httpClient
			.post(ENDPOINT, requestBody, { observe: 'response' })
			.subscribe(
				(data) => {
					this.toastr.success(`Participants successfully rescheduled.`, 'Success', { timeOut: 3000 });
					this.refreshList();
					this.selectedEnrolledParticipantList = [];
				},
				(error) => {
					this.toastr.error('Failed to rescheduled participants', 'Failed request', { timeOut: 3000 });
				}
			);
	}

	rescheduleConfirmed(): Promise<any> {

		if(this.selectedConfirmedParticipantList.length == 0) {
			this.toastr.error("No confirmed registrations to reschedule.", "Failed Request", { timeOut: 3000 });
			return;
		}
		const ENDPOINT: string = `${this.API_HOST}/course-participants/actions/change-status-reschedule`;

		let requestBody = {
			participants: this.selectedConfirmedParticipantList,
			courseScheduleId: this.courseScheduleId
		}

		this.httpClient
			.post(ENDPOINT, requestBody, { observe: 'response' })
			.subscribe(
				(data) => {
					this.toastr.success(`Participants successfully rescheduled.`, 'Success', { timeOut: 3000 });
					this.refreshList();
				},
				(error) => {
					this.toastr.error('Failed to rescheduled participants', 'Failed request', { timeOut: 3000 });
				}
			);
	}

	delivered(): Promise<any> {

		if(this.selectedEnrolledParticipantList.length == 0) {
			this.toastr.error("No enrolled participants selected ", "Failed Request", { timeOut: 3000 });
			return;
		}
		const ENDPOINT: string = `${this.API_HOST}/course-participants/actions/change-status-delivered`;

		let requestBody = {
			participants: this.selectedEnrolledParticipantList,
			courseScheduleId: this.courseScheduleId
		}

		this.httpClient
			.post(ENDPOINT, requestBody, { observe: 'response' })
			.subscribe(
				(data) => {
					this.toastr.success(`Participants successfully completed the training.`, 'Success', { timeOut: 3000 });
					this.getCourseSchedule(this.courseScheduleId).then(data => {
						this.currentCourseSchedule = data;
					});
					this.refreshList();
				},
				(error) => {
					this.toastr.error('Failed to change status to delivered', 'Failed request', { timeOut: 3000 });
				}
			);
	}

	currentCourseSchedule = "";
	getCourseSchedule(courseScheduleId: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
			const ENDPOINT: string = `${this.API_HOST}/course-schedules/${courseScheduleId}`;

			this.httpClient
				.get<any[]>(ENDPOINT, {})
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

	refreshList() {
		this.getParticipants(this.courseScheduleId).then(data => {
			this.registeredList = data['items'];
		});

		this.getEnrolledParticipants(this.courseScheduleId).then(data => {
			this.enrolledList = data['items'];
		});
		this.isAllConfirmedSelected = false;
		this.isAllEnrolledSelected = false;
	}

	sendEnrollmentNotification() {

		swal.fire({
			title: "Send Notification",
			text: `Send notification via email and sms?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Send',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				const ENDPOINT: string = `${this.API_HOST}/course-participants/actions/send-enrollment-notification/${this.courseScheduleId}`;

				this.httpClient
					.post(ENDPOINT, {}, { observe: 'response' })
					.subscribe(
						(data) => {
							this.toastr.success(`Participants successfully notified about the training.`, 'Success', { timeOut: 3000 });
							this.getCourseSchedule(this.courseScheduleId).then(data => {
								this.currentCourseSchedule = data;
							});
							this.refreshList();
						},
						(error) => {
							this.toastr.error('Failed to notifiy participants', 'Failed request', { timeOut: 3000 });
						}
					);
					}
		});

	}

	sendPostEnrollmentNotification() {

		swal.fire({
			title: "Send Notification",
			text: `Send post-notification via sms?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Send',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				const ENDPOINT: string = `${this.API_HOST}/course-participants/actions/send-thankyou-notification/${this.courseScheduleId}`;

				this.httpClient
					.post(ENDPOINT, {}, { observe: 'response' })
					.subscribe(
						(data) => {
							this.toastr.success(`Participants successfully notified.`, 'Success', { timeOut: 3000 });
							this.getCourseSchedule(this.courseScheduleId).then(data => {
								this.currentCourseSchedule = data;
							});
							this.refreshList();
						},
						(error) => {
							this.toastr.error('Failed to notifiy participants', 'Failed request', { timeOut: 3000 });
						}
					);
					}
		});

	}
}