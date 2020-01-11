import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user.model';
import { environment } from '../../../../../environments/environment';
import { DatePipe } from '@angular/common';

declare var $: any;
console.log(`jQuery version: ${$.fn.jquery}`);


@Component({
	selector: 'app-inquiry-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss'],
	providers: [DatePipe]
})
export class InquiryDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/inquiries`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly COURSES_ENDPOINT: string = `${this.API_HOST}/courses`;
	private readonly LANDING_PAGE: string = '/app/inquiry';

	defaultInquiryStatus = "ASSIGNED";

	title = 'Inquiry';
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

	isRecordActive: boolean = false;
	isCourseIdInvalid = false;
	isAccountManagerIdInvalid = false;
	isChannelInvalid = false;
	isInquiryStatusInvalid = false;

	selectedCourse = "";
	selectedAccountManager = "";
	selectedChannel = "";

	dateOfInquiryView;
	accountManager;
	courseName;

	initForm() {
		this.currentForm = this.formBuilder.group({
			id: [''],
			firstName: ['', [Validators.required]],
			lastName: ['', [Validators.required]],
			middleInitial: [''],
			companyName: ['', [Validators.required]],
			officeAddress: [''],
			designation: [''],
			email: ['', [Validators.required]],
			mobileNumber: ['', [Validators.required]],
			officeNumber: [''],
			faxNumber: [''],
			courseId: ['', [Validators.required]],
			inquiryChannel: ['', [Validators.required]],
			dateOfInquiry: ['', [Validators.required]],
			inquiryStatus: ['ASSIGNED', [Validators.required]],
			comment: [''],
			accountManager: ['', [Validators.required]],
		});
	}

	public onAccountManagerSelected(accountManagerId: any) {
		if(accountManagerId) {
			this.f.accountManager.setValue(accountManagerId);
			this.isAccountManagerIdInvalid = false;

		} else {
			this.isAccountManagerIdInvalid = true;
		}
  	}

	public onCourseSelected(courseId: any) {
		if(courseId) {
			this.f.courseId.setValue(courseId);
			this.isCourseIdInvalid = false;

		} else {
			this.isCourseIdInvalid = true;
		}
  	}

	public onChannelSelected(channel: any) {
		if(channel) {
			this.f.inquiryChannel.setValue(channel);
			this.isChannelInvalid = false;

		} else {
			this.isChannelInvalid = true;
		}
  	}

	public onInquiryStatusSelected(inquiryStatus: any) {
		if(inquiryStatus) {
			this.f.inquiryStatus.setValue(inquiryStatus);
			this.isInquiryStatusInvalid = false;

		} else {
			this.isInquiryStatusInvalid = true;
		}
  	}

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
		private datePipe: DatePipe) {

		this.initForm();

		this.route.params.subscribe( params => {

			if (params['id']) {
				this.modelId = params.id;
				this.newForm = this.modelId == -1;

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
										this.toastr.error('Error has occurred.', 'System', { timeOut: 3000 });
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
										this.toastr.error('Error has occurred.', 'System', { timeOut: 3000 });
									}
								);
							}

							if(this.currentModel.accountManager != null) {
								this.httpClient.get(`${this.USERS_ENDPOINT}/${this.currentModel.accountManager}`).subscribe(
									(auditData) => {
										let firstName = auditData['userProfile']['firstName'];
										let lastName = auditData['userProfile']['lastName'];
										this.accountManager = `${firstName} ${lastName}`;
									},
									(errorData) => {
										this.toastr.error('Error has occurred.', 'System', { timeOut: 3000 });
									}
								);
							}

							if(this.currentModel.courseId != null) {
								console.log(this.currentModel.courseId);
								this.httpClient.get(`${this.COURSES_ENDPOINT}/${this.currentModel.courseId}`).subscribe(
									(courseData) => {
										let name = courseData['name'];
										this.courseName = `${name}`;
									},
									(errorData) => {
										this.toastr.error('Error has occurred.', 'System', { timeOut: 3000 });
									}
								);
							}

							this.currentForm = this.formBuilder.group({
								id: [this.currentModel.id],
								firstName: [this.currentModel.firstName, [Validators.required]],
								lastName: [this.currentModel.lastName, [Validators.required]],
								middleInitial: [this.currentModel.middleInitial],
								companyName: [this.currentModel.companyName, [Validators.required]],
								officeAddress: [this.currentModel.officeAddress],
								designation: [this.currentModel.designation],
								email: [this.currentModel.email, [Validators.required]],
								mobileNumber: [this.currentModel.mobileNumber, [Validators.required]],
								officeNumber: [this.currentModel.officeNumber],
								faxNumber: [this.currentModel.faxNumber],
								courseId: [this.currentModel.courseId, [Validators.required]],
								inquiryChannel: [this.currentModel.inquiryChannel, [Validators.required]],
								dateOfInquiry: [this.currentModel.dateOfInquiry, [Validators.required]],
								inquiryStatus: [this.currentModel.inquiryStatus, [Validators.required]],
								comment: [this.currentModel.comment],
								accountManager: [this.currentModel.accountManager, [Validators.required]],
								createdDate: [this.currentModel.createdDate],
								createdBy: [this.currentModel.createdBy],
								modifiedDate: [this.currentModel.modifiedDate],
								modifiedBy: [this.currentModel.modifiedBy],
							});
							this.selectedCourse = this.currentModel.courseId;
							this.selectedAccountManager = this.currentModel.accountManager;
							this.selectedChannel = this.currentModel.inquiryChannel;
							this.dateOfInquiryView = this.currentModel.dateOfInquiry;

							const inquiryYear =  Number(this.datePipe.transform(this.currentModel.dateOfInquiry, 'yyyy'));
    						const inquiryMonth =  Number(this.datePipe.transform(this.currentModel.dateOfInquiry, 'MM'));
    						const inquiryDay =  Number(this.datePipe.transform(this.currentModel.dateOfInquiry, 'dd'));

							this.currentForm.get('dateOfInquiry').setValue({
								year: inquiryYear,
								month: inquiryMonth,
								day: inquiryDay
							});

						},
						(error) => {
							this.toastr.error('Error has occurred.', 'System', { timeOut: 3000 });
						}
					);
				}
			}
		});

	}

	get f() { return this.currentForm.controls; }

	ngAfterViewInit() {
		this.currentUser = this.stateService.getCurrentUser();
	}

	update() {
		console.log("update");

		this.submitted = true;

        if (this.currentForm.invalid) {
            return;
        }

		swal.fire({
			text: `Update ${this.title}?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				let month = `0${this.currentForm.get('dateOfInquiry').value.month}`.slice(-2);
				let day = `0${this.currentForm.get('dateOfInquiry').value.day}`.slice(-2);
				let year = `${this.currentForm.get('dateOfInquiry').value.year}`;

				let requestBody = {
					accountManager: this.currentForm.get('accountManager').value,
					comment: this.currentForm.get('comment').value,
					companyName: this.currentForm.get('companyName').value,
					courseId: this.currentForm.get('courseId').value,
					dateOfInquiry: `${year}-${month}-${day}`,
					designation: this.currentForm.get('designation').value,
					email: this.currentForm.get('email').value,
					faxNumber: this.currentForm.get('faxNumber').value,
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value,
					mobileNumber: this.currentForm.get('mobileNumber').value,
					officeNumber: this.currentForm.get('officeNumber').value,
					officeAddress: this.currentForm.get('officeAddress').value,
					inquiryChannel: this.currentForm.get('inquiryChannel').value,
					inquiryStatus: this.currentForm.get('inquiryStatus').value
				};

				let resourceId = this.currentForm.get('id').value;

				this.httpClient
						.put(`${this.ENDPOINT}/${resourceId}`, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								console.log(data);
								if(data.status == 200) {
									this.toastr.success(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Email or mobile number already exist.', 'Conlict', { timeOut: 3000 });
								} else if(error.status === 400) {
									this.toastr.error('Invalid request received by the server.', 'Invalid Request', { timeOut: 3000 });
								}	else {
									this.toastr.error('Internal server error.', 'System', { timeOut: 3000 });
								}
							}
						);
			}

		});
	}

	showEditForm() {
		this.newForm = false;
		this.editForm = true;
		this.viewForm = false;
	}

	saveNew() {
		this.submitted = true;

		let hasError = false;
		if(this.f.courseId.value == '' || this.f.courseId.value == 'undefined' || this.f.courseId == null) {
			this.isCourseIdInvalid = true;
			hasError = true;
		} else {
			this.isCourseIdInvalid = false;
			hasError = false;
		}

		if(this.f.accountManager.value == '' || this.f.accountManager.value == 'undefined' || this.f.accountManager == null) {
			this.isAccountManagerIdInvalid = true;
			hasError = true;
		} else {
			this.isAccountManagerIdInvalid = false;
			hasError = false;
		}

		if(this.f.inquiryChannel.value == '' || this.f.inquiryChannel.value == 'undefined' || this.f.inquiryChannel == null) {
			this.isChannelInvalid = true;
			hasError = true;
		} else {
			this.isChannelInvalid = false;
			hasError = false;
		}

		if(this.f.inquiryStatus.value == '' || this.f.inquiryStatus.value == 'undefined' || this.f.inquiryStatus == null) {
			this.isInquiryStatusInvalid = true;
			hasError = true;
		} else {
			this.isInquiryStatusInvalid = false;
			hasError = false;
		}

        if (this.currentForm.invalid || hasError) {
			console.log(this.currentForm);
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
				let month = `0${this.currentForm.get('dateOfInquiry').value.month}`.slice(-2);
				let day = `0${this.currentForm.get('dateOfInquiry').value.day}`.slice(-2);
				let year = `${this.currentForm.get('dateOfInquiry').value.year}`;

				let requestBody = {
					accountManager: this.currentForm.get('accountManager').value,
					comment: this.currentForm.get('comment').value,
					companyName: this.currentForm.get('companyName').value,
					courseId: this.currentForm.get('courseId').value,
					dateOfInquiry: `${year}-${month}-${day}`,
					designation: this.currentForm.get('designation').value,
					email: this.currentForm.get('email').value,
					faxNumber: this.currentForm.get('faxNumber').value,
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value,
					mobileNumber: this.currentForm.get('mobileNumber').value,
					officeNumber: this.currentForm.get('officeNumber').value,
					officeAddress: this.currentForm.get('officeAddress').value,
					inquiryChannel: this.currentForm.get('inquiryChannel').value,
					inquiryStatus: this.currentForm.get('inquiryStatus').value
				};

				this.httpClient
						.post(this.ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.genericError = false;

									this.toastr.success(`New ${this.title} successfully saved.`, 'Success', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Email or mobile number already exist.', 'Conlict', { timeOut: 3000 });
								} else if(error.status === 400) {
									this.toastr.error('Invalid request received by the server.', 'Invalid Request', { timeOut: 3000 });
								}	else {
									this.toastr.error('Internal server error.', 'System', { timeOut: 3000 });
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
		this.router.navigate([this.LANDING_PAGE]);
	}

	isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}
}