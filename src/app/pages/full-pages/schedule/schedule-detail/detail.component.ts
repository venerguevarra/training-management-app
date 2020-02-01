import { Component, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user.model';
import { environment } from '../../../../../environments/environment';
import { RoutingStateService } from '../../../../service/routing-state.service';
import * as moment from "moment";
import { EventService } from '../../../../service/event.service';

@Component({
	selector: 'app-schedule',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class ScheduleDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/course-schedules`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/schedule';

	title = 'Training Schedule';
	currentUser;
	modelId;
	currentForm: FormGroup;
    submitted = false;
	genericError: boolean = false;
	currentModel;
	newForm = false;
	editForm = false;
	viewForm = false;

	createdBy = "";
	modifiedBy = "";

	isCourseIdInvalid: boolean = false;
	selectedCourse: string;
	isVenueIdInvalid: boolean = false;
	selectedVenue: string;

	defaultStartTime = {hour: 9, minute: 0};
	defaultEndTime = {hour: 18, minute: 0};
  	meridian = true;
	hoveredDate: NgbDate;
	selectedStartDate: NgbDate;
	selectedEndDate: NgbDate;
	isStartTimeValid = true;
	isEndTimeValid = true;
	isTrainingDateInvalid = true;
	formattedStartTime;
	formattedEndTime;
	startDateText;
	endDateText;

	revenueModel = {
		grossRevenue: 0,
		actualGrossRevenue: 0,
		netRevenue: 0,
		actualNetRevenue: 0,
		profitMargin: 0,
		actualProfitMargin: 0,
		scheduleCost: 0
	}

	currentScheduleStatus = "";

	registrationCount = 0;
	actualRegistrationCount = 0;
	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
		private routingStateService: RoutingStateService,
		private dateParser: NgbDateParserFormatter,
		private eventService: EventService) {

		this.initForm();

		this.route.params.subscribe( params => {
			if (params['id']) {
				this.modelId = params.id;
				this.newForm = this.modelId == -1;

				this.eventService.emitter.subscribe((data) => {
					if(data.eventType === 'course-schedule-costings-updated') {
						this.calculateRevenue(this.modelId);
					}
				});

				if(!this.newForm) {
					 this.route.queryParams.subscribe(params => {
						if(params.action === 'view') {
							this.viewForm = true;
						}
						if(params.action === 'edit') {
							this.editForm = true;
						}
					});
				}

				if(this.viewForm || this.editForm) {
					this.httpClient.get(`${this.ENDPOINT}/${this.modelId}`).subscribe(
						(data) => {
							this.currentModel = data;

							if(this.currentModel.createdBy != null) {
								this.httpClient.get(`${this.USERS_ENDPOINT}/${this.currentModel.createdBy}`).subscribe(
									(auditData) => {
										let firstName = auditData['userProfile']['firstName'];
										let lastName = auditData['userProfile']['lastName'];
										this.createdBy = `${firstName} ${lastName}`;
									},
									(errorData) => {
										this.toastr.error('Error has occurred.', 'Failed Request', { timeOut: 3000 });
									}
								);
							}

							if(this.currentModel.modifiedBy != null) {
								this.httpClient.get(`${this.USERS_ENDPOINT}/${this.currentModel.modifiedBy}`).subscribe(
									(auditData) => {
										let firstName = auditData['userProfile']['firstName'];
										let lastName = auditData['userProfile']['lastName'];
										this.modifiedBy = `${firstName} ${lastName}`;
									},
									(errorData) => {
										this.toastr.error('Error has occurred.', 'Failed Request', { timeOut: 3000 });
									}
								);
							}


							this.currentForm = this.formBuilder.group({
								id: [this.currentModel.id],
								courseId: [this.currentModel.courseId, [Validators.required]],
								venueId: [this.currentModel.venueId],
								registeredParticipants: [this.currentModel.registeredParticipants],
								actualRegisteredParticipants: [this.currentModel.actualRegisteredParticipants],
								startDate: [this.currentModel.startDate],
								endDate: [this.currentModel.endDate],
								startTime: [this.currentModel.startTime],
								endTime: [this.currentModel.endTime],
								courseFee: [this.currentModel.courseFee],
								numberOfDays: [this.currentModel.numberOfDays],
								createdDate: [this.currentModel.createdDate],
								createdBy: [this.currentModel.createdBy],
								modifiedDate: [this.currentModel.modifiedDate],
								modifiedBy: [this.currentModel.modifiedBy],
								status: [this.currentModel.status]
							});

							this.revenueModel = {
								grossRevenue: this.currentModel.grossRevenue,
								actualGrossRevenue: this.currentModel.actualGrossRevenue,
								netRevenue: this.currentModel.netRevenue,
								actualNetRevenue: this.currentModel.actualNetRevenue,
								profitMargin: this.currentModel.profitMargin,
								actualProfitMargin: this.currentModel.actualProfitMargin,
								scheduleCost: this.currentModel.scheduleCost
							}

							let startTimeTokens = this.currentModel.startTime.split(':');
							let startTimeHourParam = parseInt(startTimeTokens[0]);
							let startTimeMinuteParam = parseInt(startTimeTokens[1]);
							this.f.startTime.setValue({
								hour: startTimeHourParam,
								minute: startTimeMinuteParam
							});

							let endTimeTokens = this.currentModel.endTime.split(':');
							let endTimeHourParam = parseInt(endTimeTokens[0]);
							let endTimeMinuteParam = parseInt(endTimeTokens[1]);
							this.f.endTime.setValue({
								hour: endTimeHourParam,
								minute: endTimeMinuteParam
							});

							let startDateTokens = this.currentModel.startDate.split('-');
							let startDateYear = parseInt(startDateTokens[0]);
							let startDateMonth = parseInt(startDateTokens[1]);
							let startDateDay = parseInt(startDateTokens[2]);
							this.startDateText = this.currentModel.startDate;
							this.selectedStartDate = {
								year: startDateYear,
								month: startDateMonth,
								day: startDateDay,
								equals: null,
								before: null,
								after: null
							};

							let endDateTokens = this.currentModel.endDate.split('-');
							let endDateYear = parseInt(endDateTokens[0]);
							let endDateMonth = parseInt(endDateTokens[1]);
							let endDateDay = parseInt(endDateTokens[2]);
							this.endDateText = this.currentModel.endDate;
							this.selectedEndDate = {
								year: endDateYear,
								month: endDateMonth,
								day: endDateDay,
								equals: null,
								before: null,
								after: null
							};

							this.formattedStartTime = this.formatTime(this.currentModel.startTime);
							this.formattedEndTime = this.formatTime(this.currentModel.endTime);
							this.selectedCourse = this.currentModel.courseId;
							this.selectedVenue = this.currentModel.venueId;
							this.currentScheduleStatus = this.currentModel.status;
						},
						(error) => {
							this.toastr.error('Error has occurred.', 'Failed Request', { timeOut: 3000 });
						}
					);
				}
			}
		});


	}

	calculateRevenue(id: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.ENDPOINT}/actions/calculate-revenue/${id}`;

		this.httpClient
			.post<any[]>(ACTIVE_ENDPOINT, {})
			.toPromise()
			.then(
				res => {
					this.revenueModel.scheduleCost = res['scheduleCost'];
					this.revenueModel.netRevenue = res['netRevenue'];
					this.revenueModel.actualNetRevenue = res['actualNetRevenue'];
					this.revenueModel.grossRevenue = res['grossRevenue'];
					this.revenueModel.actualGrossRevenue = res['actualGrossRevenue'];
					this.revenueModel.profitMargin = res['profitMargin'];
					this.revenueModel.actualProfitMargin = res['actualProfitMargin'];
					resolve(res);
				},
				msg => {
					reject(msg);
				}
			);
		});

		return promise;
	}

	formatTime(input) {
    	return moment(input, 'HH:mm').format('h:mm A');
	}

	initForm() {
		this.currentForm = this.formBuilder.group({
			id: [''],
			courseId: ['', [Validators.required]],
			venueId: ['', [Validators.required]],
			registeredParticipants: ['', [Validators.required]],
			actualRegisteredParticipants: [''],
			scheduleCost: [''],
			status: ['SCHEDULE_WAITING', [Validators.required]],
			startDate: ['', [Validators.required]],
			endDate: ['', [Validators.required]],
			startTime: [this.defaultStartTime, [Validators.required]],
			endTime: [this.defaultEndTime, [Validators.required]],
			courseFee: ['', [Validators.required]],
			numberOfDays: ['', [Validators.required]]
		});
	}

	get f() { return this.currentForm.controls; }

	ngAfterViewInit() {
		this.currentUser = this.stateService.getCurrentUser();
	}

	update() {
		this.submitted = true;

		this.currentForm.controls["startTime"].markAsTouched();
    	this.currentForm.controls["endTime"].markAsTouched();

        let hasError = false;

		if(!this.f.startDate || !this.f.startDate.value ||  this.f.startDate.value == "") {
			this.isTrainingDateInvalid= true;
			hasError = true;
		} else {
			this.isTrainingDateInvalid = false;
			hasError = false;
		}

		if(!(this.f.startTime && (this.f.startTime.value.hour || !this.f.startTime.value.minute))) {
			this.isStartTimeValid = true;
			hasError = true;
		} else {
			this.isStartTimeValid = false;
			hasError = false;
		}

		if(!(this.f.endTime && (this.f.endTime.value.hour || !this.f.endTime.value.minute))) {
			this.isEndTimeValid = true;
			hasError = true;
		} else {
			this.isEndTimeValid = false;
			hasError = false;
		}

		if (this.formControlInvalid(this.f.courseId)) {
			this.isCourseIdInvalid = true;
			hasError = true;
		} else {
			this.isCourseIdInvalid = false;
			hasError = false;
		}

		if (this.formControlInvalid(this.f.venueId)) {
			this.isVenueIdInvalid = true;
			hasError = true;
		} else {
			this.isVenueIdInvalid = false;
			hasError = false;
		}

        if (this.currentForm.invalid || hasError) {
            return;
        }

		this.getScheduleFacilitators(this.currentForm.get('id').value).then(data=>{
			return data['items'].length > 0;
		}).then(hasFacilitator=>{
			if(this.currentForm.get('status').value == 'SCHEDULE_CONFIRMED' && !hasFacilitator) {
				swal.fire({
					title: `Facilitator Required`,
					text: `You must assign a facilitator to confirm the schedule.`,
					type: "error",
					showCancelButton: false,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Close',
					allowOutsideClick: false
				});
			} else {
				this.postUpdate();
			}

		});


	}

	postUpdate() {
		swal.fire({
			title: "Confirm Schedule Update",
			text: `Do you wish to continue?`,
			type: "question",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Update',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				let startTimeHourParam = `0${this.f.startTime.value.hour}`.slice(-2);
				let startTimeMinuteParam = `0${this.f.startTime.value.minute}`.slice(-2);
				let startTimeParam = `${startTimeHourParam}:${startTimeMinuteParam}`;

				let endTimeHourParam = `0${this.f.endTime.value.hour}`.slice(-2);
				let endTimeMinuteParam = `0${this.f.endTime.value.minute}`.slice(-2);
				let endTimeParam = `${endTimeHourParam}:${endTimeMinuteParam}`;

				let requestBody = {
					courseId: this.currentForm.get('courseId').value,
					venueId: this.currentForm.get('venueId').value,
					registeredParticipants: this.currentForm.get('registeredParticipants').value,
					status: this.currentForm.get('status').value,
					startDate: this.currentForm.get('startDate').value,
					endDate: this.currentForm.get('endDate').value,
					startTime: startTimeParam,
					endTime: endTimeParam,
					courseFee: this.currentForm.get('courseFee').value,
					numberOfDays: this.currentForm.get('numberOfDays').value
				};

				let resourceId = this.currentForm.get('id').value;

				this.checkFacilitatorScheduleConflict(
					resourceId,
					this.currentForm.get('startDate').value,
					this.currentForm.get('endDate').value
				).then(e => {
					if(e['items'].length > 0) {

						let innerHtml = ""
						for (var item of e['items']) {
							if(item.courseSchedule.startDate == item.courseSchedule.endDate) {
								innerHtml += `${item.facilitator.firstName} ${item.facilitator.lastName} - ${item.courseSchedule.startDate}<br/>`;
							} else {
								innerHtml += `${item.facilitator.firstName} ${item.facilitator.lastName} - ${item.courseSchedule.startDate} to ${item.courseSchedule.endDate}<br/>`;
							}

						}
						swal.fire({
							html: innerHtml,
							type: "error",
							title: "Facilitator schedule conflict!",
							showCancelButton: false,
							confirmButtonColor: '#3085d6',
							cancelButtonColor: '#d33',
							confirmButtonText: 'OK',
							allowOutsideClick: false
						});
					} else {
						this.httpClient
							.put(`${this.ENDPOINT}/${resourceId}`, requestBody, { observe: 'response' })
							.subscribe(
								(data) => {
									if(data.status == 200) {
										this.toastr.success(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
										this.eventService.emitter.emit({eventType: 'course-schedule-updated'});
									}
								},
								(error) => {
									if(error.status === 409) {
										let errorMessage =  `There is already an existing schedule. <br/> ${this.f.startDate.value} - ${this.f.endDate.value}`;
										swal.fire({
											html: errorMessage,
											type: "error",
											title: "Schedule Conflict",
											showCancelButton: false,
											confirmButtonColor: '#3085d6',
											cancelButtonColor: '#d33',
											confirmButtonText: 'OK',
											allowOutsideClick: false
										});
									} else if(error.status === 400) {
										this.toastr.error('Invalid request received by the server.', 'Invalid Request', { timeOut: 3000 });
									} else {
										this.toastr.error('Internal server error.', 'Failed Request', { timeOut: 3000 });
									}
								}
							);
					}
				}).catch(error => {
					this.toastr.error('Internal server error.', 'Failed Request', { timeOut: 3000 });
				});


			}

		});
	}

	getScheduleFacilitators(courseScheduleId:string) {
		let promise = new Promise((resolve, reject) => {
			let endpoint = `${this.API_HOST}/course-schedule-facilitators/actions/facilitator-schedule/${courseScheduleId}`;
			this.httpClient.get(endpoint)
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

	checkFacilitatorScheduleConflict(courseScheduleId:string, startDate:string, endDate: string) {
		let promise = new Promise((resolve, reject) => {
			let apiURL = `${this.API_HOST}/course-schedule-facilitators/actions/find-facilitator-conflict`;
			let requestBody = {
				courseScheduleId,
				startDate,
				endDate
			}
			this.httpClient.post(apiURL, requestBody)
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

	showEditForm() {
		this.newForm = false;
		this.editForm = true;
		this.viewForm = false;
	}

	formControlInvalid(control: any) {
		return (control.value == "" || control.value == "undefined" || control == null);
	}

	saveNew() {
		this.submitted = true;
		let hasError = false;

		if(!this.f.startDate || !this.f.startDate.value ||  this.f.startDate.value == "") {
			this.isTrainingDateInvalid= true;
			hasError = true;
		} else {
			this.isTrainingDateInvalid = false;
			hasError = false;
		}

		if(!(this.f.startTime && (this.f.startTime.value.hour || !this.f.startTime.value.minute))) {
			this.isStartTimeValid = true;
			hasError = true;
		} else {
			this.isStartTimeValid = false;
			hasError = false;
		}

		if(!(this.f.endTime && (this.f.endTime.value.hour || !this.f.endTime.value.minute))) {
			this.isEndTimeValid = true;
			hasError = true;
		} else {
			this.isEndTimeValid = false;
			hasError = false;
		}

		if (this.formControlInvalid(this.f.courseId)) {
			this.isCourseIdInvalid = true;
			hasError = true;
		} else {
			this.isCourseIdInvalid = false;
			hasError = false;
		}

		if (this.formControlInvalid(this.f.venueId)) {
			this.isVenueIdInvalid = true;
			hasError = true;
		} else {
			this.isVenueIdInvalid = false;
			hasError = false;
		}

        if (this.currentForm.invalid || hasError) {
            return;
        }

		swal.fire({
			text: `Save new ${this.title}?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {

				let startTimeHourParam = `0${this.f.startTime.value.hour}`.slice(-2);
				let startTimeMinuteParam = `0${this.f.startTime.value.minute}`.slice(-2);
				let startTimeParam = `${startTimeHourParam}:${startTimeMinuteParam}`;

				let endTimeHourParam = `0${this.f.endTime.value.hour}`.slice(-2);
				let endTimeMinuteParam = `0${this.f.endTime.value.minute}`.slice(-2);
				let endTimeParam = `${endTimeHourParam}:${endTimeMinuteParam}`;

				let requestBody = {
					courseId: this.currentForm.get('courseId').value,
					venueId: this.currentForm.get('venueId').value,
					registeredParticipants: this.currentForm.get('registeredParticipants').value,
					status: 'SCHEDULE_WAITING',
					startDate: this.currentForm.get('startDate').value,
					endDate: this.currentForm.get('endDate').value,
					startTime: startTimeParam,
					endTime: endTimeParam,
					courseFee: this.currentForm.get('courseFee').value,
					numberOfDays: this.currentForm.get('numberOfDays').value,
				};

				this.httpClient
						.post(this.ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.genericError = false;

									this.toastr.success(`New schedule successfully saved.`, 'Success', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									let errorMessage =  `There is already an existing schedule. <br/> ${this.f.startDate.value} - ${this.f.endDate.value}`;
									swal.fire({
										html: errorMessage,
										type: "error",
										title: "Schedule Conflict",
										showCancelButton: false,
										confirmButtonColor: '#3085d6',
										cancelButtonColor: '#d33',
										confirmButtonText: 'OK',
										allowOutsideClick: false
									});
								} else if(error.status === 400) {
									this.toastr.error('Invalid request received by the server.', 'Failed Request', { timeOut: 3000 });
								} else {
									this.toastr.error('Internal server error.', 'Failed Request', { timeOut: 3000 });
								}
							}
						);
			}

		});
	}

	activeCheckbox = (event) => {
		if(event.currentTarget.checked) {
			this.f.status.setValue('ACTIVE');
		} else {
			this.f.status.setValue('INACTIVE');
		}
	}

	cancel() {
		this.router.navigateByUrl(this.routingStateService.getPreviousUrl());
	}

	isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}

	updateRevenueModel() {
		this.revenueModel.grossRevenue = parseFloat(this.f.courseFee.value) * parseInt(this.f.registeredParticipants.value);
		this.revenueModel.netRevenue = this.revenueModel.grossRevenue - this.revenueModel.scheduleCost;
		this.revenueModel.profitMargin = ((this.revenueModel.netRevenue / this.revenueModel.grossRevenue) * 100);
	}

	public onCourseSelected(course: any) {
		if (course) {
			this.f.courseFee.setValue(course.courseFee);
			this.f.numberOfDays.setValue(course.numberOfDays);
			this.f.courseId.setValue(course.id);
			this.isCourseIdInvalid = false;

		} else {
			this.isCourseIdInvalid = true;
			this.f.courseId.setValue("");
			this.f.numberOfDays.setValue('');
			this.f.courseFee.setValue('');
		}
		this.updateRevenueModel();
  	}

	public onVenueSelected(venue: any) {
		if (venue) {
			this.f.venueId.setValue(venue.id);
			this.isVenueIdInvalid = false;
		} else {
			this.isVenueIdInvalid = true;
			this.f.venueId.setValue("");
		}
  	}

	onDateSelection(date: NgbDate) {
		if (!this.selectedStartDate && !this.selectedEndDate) {
			this.selectedStartDate = date;
			let month = `0${this.selectedStartDate.month}`.slice(-2);
			let day = `0${this.selectedStartDate.day}`.slice(-2);
			let year = `${this.selectedStartDate.year}`;
			this.f.startDate.setValue(`${year}-${month}-${day}`);
			this.f.endDate.setValue(`${year}-${month}-${day}`);
		} else if (this.selectedStartDate && !this.selectedEndDate && date.after(this.selectedStartDate)) {
			this.selectedEndDate = date;
			let month = `0${this.selectedEndDate.month}`.slice(-2);
			let day = `0${this.selectedEndDate.day}`.slice(-2);
			let year = `${this.selectedEndDate.year}`;
			this.f.endDate.setValue(`${year}-${month}-${day}`);
		} else {
			this.selectedEndDate = null;
			this.selectedStartDate = date;
			let month = `0${this.selectedStartDate.month}`.slice(-2);
			let day = `0${this.selectedStartDate.day}`.slice(-2);
			let year = `${this.selectedStartDate.year}`;
			this.f.startDate.setValue(`${year}-${month}-${day}`);
			this.f.endDate.setValue(`${year}-${month}-${day}`);
		}

		if(!this.f.startDate || !this.f.startDate.value ||  this.f.startDate.value == "") {
			this.isTrainingDateInvalid= true;
		} else {
			this.isTrainingDateInvalid = false;
		}
 	}

	isHovered(date: NgbDate) {
		return this.selectedStartDate && !this.selectedEndDate && this.hoveredDate && date.after(this.selectedStartDate) && date.before(this.hoveredDate);
	}

	isInside(date: NgbDate) {
		return date.after(this.selectedStartDate) && date.before(this.selectedEndDate);
	}

	isRange(date: NgbDate) {
		return date.equals(this.selectedStartDate) || date.equals(this.selectedEndDate) || this.isInside(date) || this.isHovered(date);
	}
}