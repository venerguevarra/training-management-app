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
import { CustomValidator } from '../../../../validator/custom.validator';

@Component({
	selector: 'app-course-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class CourseDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/courses`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/administration/course';

	title = 'Course';
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
								name: [this.currentModel.name, [Validators.required]],
								fee: [this.currentModel.courseFee, [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
								description: [this.currentModel.description],
								days: [this.currentModel.numberOfDays, [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
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
			text: "Update course?",
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				let course = {
					name: this.currentForm.get('name').value,
					description: this.currentForm.get('description').value,
					courseFee: this.currentForm.get('fee').value,
					numberOfDays: this.currentForm.get('days').value,
					active: this.currentForm.get('status').value
				};

				let resourceId = this.currentForm.get('id').value;

				this.httpClient
						.put(`${this.ENDPOINT}/${resourceId}`, course, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									this.genericError = false;

									this.toastr.success(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
								}
							},
							(error) => {
								this.genericError = false;

								if(error.status === 409) {
									this.toastr.error('Course name already exist.', 'Failed Request', { timeOut: 3000 });
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
			text: "Save new course?",
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				let course = {
					name: this.currentForm.get('name').value,
					description: this.currentForm.get('description').value,
					courseFee: this.currentForm.get('fee').value,
					numberOfDays: this.currentForm.get('days').value,
				};

				this.httpClient
						.post(this.ENDPOINT, course, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.genericError = false;

									this.toastr.success(`${this.currentForm.get('name').value} course successfully saved.`, 'Success', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Course name already exist.', 'Failed Request', { timeOut: 3000 });
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

	initForm() {
		this.currentForm = this.formBuilder.group({
			id: [''],
			name: ['', [Validators.required]],
			fee: ['', [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
			description: [''],
			days: ['', [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
			status: ['']
		});
	}
}