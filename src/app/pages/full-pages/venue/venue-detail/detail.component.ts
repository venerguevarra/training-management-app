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

@Component({
	selector: 'app-venue-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class VenueDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/venues`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/venue';

	title = 'Venue';
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

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) {

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
							

							this.currentForm = this.formBuilder.group({
								id: [this.currentModel.id],
								firsnametName: [this.currentModel.name, [Validators.required]],
								description: [this.currentModel.description, [Validators.required]],
								createdDate: [this.currentModel.createdDate],
								createdBy: [this.currentModel.createdBy],
								modifiedDate: [this.currentModel.modifiedDate],
								modifiedBy: [this.currentModel.modifiedBy]
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

	initForm() {
		this.currentForm = this.formBuilder.group({
			id: [''],
			name: ['', [Validators.required]],
			description: ['', [Validators.required]]
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
					name: this.currentForm.get('name').value,
					description: this.currentForm.get('description').value
				};

				let resourceId = this.currentForm.get('id').value;

				this.httpClient
						.put(`${this.ENDPOINT}/${resourceId}`, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								console.log(data);
								if(data.status == 200) {
									this.toastr.info(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Venue name already exist.', 'Conlict', { timeOut: 3000 });
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
		
        if (this.currentForm.invalid) {
            return;
        }

		swal.fire({
			text: `Save new ${this.title}?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save'
		}).then(e => {
			if(e.value) {
				let requestBody = {
					name: this.currentForm.get('name').value,
					description: this.currentForm.get('description').value
				};

				this.httpClient
						.post(this.ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.genericError = false;
									
									swal.fire({
										title: 'Success',
										text: `New ${this.title} successfully saved.`,
										type: "info",
										showCancelButton: false,
										confirmButtonColor: '#3085d6',
										cancelButtonColor: '#d33',
										confirmButtonText: 'Close',
										allowOutsideClick: false
									}).then(e => {
										this.router.navigate([this.LANDING_PAGE]);
									});
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Venue name already exist.', 'Conlict', { timeOut: 3000 });
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

	cancel() {
		this.router.navigate([this.LANDING_PAGE]);
	}

	isInvalid(control) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}
}