import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { CustomValidator } from '../../../../validator/custom.validator';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user.model';
import { environment } from '../../../../../environments/environment';
import { RoutingStateService } from '../../../../service/routing-state.service';

@Component({
	selector: 'app-facilitator-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class FacilitatorDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/facilitators`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/administration/facilitator';

	title = 'Facilitator';
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

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
		private routingStateService: RoutingStateService) {

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
								firstName: [this.currentModel.firstName, [Validators.required]],
								lastName: [this.currentModel.lastName, [Validators.required]],
								middleInitial: [this.currentModel.middleInitial],
								email: [this.currentModel.email, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
								mobileNumber: [this.currentModel.mobileNumber, [Validators.required, Validators.pattern("[0][0-9]{10}")]],
								dailyRate: [this.currentModel.dailyRate, [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
								createdDate: [this.currentModel.createdDate],
								createdBy: [this.currentModel.createdBy],
								modifiedDate: [this.currentModel.modifiedDate],
								modifiedBy: [this.currentModel.modifiedBy],
								status: [this.currentModel.active]
							});

							this.isRecordActive = this.currentModel.active === 'ACTIVE';
						},
						(error) => {
							this.toastr.error('Error has occurred.', 'Failed Request', { timeOut: 3000 });
						}
					);
				}
			}
		});

	}

	initForm() {
		this.currentForm = this.formBuilder.group({
			id: [''],
			firstName: ['', [Validators.required]],
			lastName: ['', [Validators.required]],
			middleInitial: [''],
			email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
			mobileNumber: ['', [Validators.required, Validators.pattern("[0][0-9]{10}")]],
			dailyRate: ['', [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
			status: ['']
		});
	}

	get f() { return this.currentForm.controls; }

	ngAfterViewInit() {
		this.currentUser = this.stateService.getCurrentUser();
	}

	update() {
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
				let requestBody = {
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value,
					email: this.currentForm.get('email').value,
					mobileNumber: this.currentForm.get('mobileNumber').value,
					dailyRate: this.currentForm.get('dailyRate').value,
					active: this.currentForm.get('status').value
				};

				let resourceId = this.currentForm.get('id').value;

				this.httpClient
						.put(`${this.ENDPOINT}/${resourceId}`, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									this.toastr.success(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Email or mobile number already exist.', 'Failed Request', { timeOut: 3000 });
								} else if(error.status === 400) {
									this.toastr.error('Invalid request received by the server.', 'Failed Request', { timeOut: 3000 });
								}	else {
									this.toastr.error('Internal server error.', 'Failed Request', { timeOut: 3000 });
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

        if (this.currentForm.invalid) {
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
				let requestBody = {
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value,
					email: this.currentForm.get('email').value,
					mobileNumber: this.currentForm.get('mobileNumber').value,
					dailyRate: this.currentForm.get('dailyRate').value,
				};

				this.httpClient
						.post(this.ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.genericError = false;

									this.toastr.success(`New facilitator successfully saved.`, 'Success', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Email or mobile number already exist.', 'Failed Request', { timeOut: 3000 });
								} else if(error.status === 400) {
									this.toastr.error('Invalid request received by the server.', 'Failed Request', { timeOut: 3000 });
								}	else {
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

	isInvalid(control) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}
}