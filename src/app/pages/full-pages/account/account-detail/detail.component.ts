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
	selector: 'app-account-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class AccountDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/accounts`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/account';


	title = 'Account';
	currentUser;
	modelId;
	currentForm: FormGroup;
    submitted = false;
	currentModel;
	newForm = false;
	editForm = false;
	viewForm = false;

	createdBy = "";
	modifiedBy = "";

	isRecordActive: boolean = false;
	isChannelInvalid = false;
	isAccountManagerIdInvalid = false;
	selectedChannel = "";
	selectedAccountManager = "";
	selectedCompanySize = "";

	accountName = "";
	previousUrl = `${this.LANDING_PAGE}`;

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
				this.previousUrl = `${this.previousUrl}/${this.modelId}?action=view`;
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
								description: [this.currentModel.description],
								officeAddress: [this.currentModel.officeAddress],
								billingAddress: [this.currentModel.billingAddress],
								tin: [this.currentModel.tin],
								website: [this.currentModel.website],
								companySize: [this.currentModel.companySize],
								channel: [this.currentModel.channel],
								accountManager: [this.currentModel.accountManager, [Validators.required]],
								createdDate: [this.currentModel.createdDate],
								createdBy: [this.currentModel.createdBy],
								modifiedDate: [this.currentModel.modifiedDate],
								modifiedBy: [this.currentModel.modifiedBy],
								status: [this.currentModel.active]
							});

							this.selectedAccountManager = this.currentModel.accountManager;
							this.selectedChannel = this.currentModel.channel;
							this.selectedCompanySize = this.currentModel.companySize;
							this.isRecordActive = this.currentModel.active === 'ACTIVE';
							this.accountName = this.currentModel.name;
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
			name: ['', [Validators.required]],
			description: [''],
			officeAddress: [''],
			billingAddress: [''],
			tin: [''],
			website: [''],
			companySize: [''],
			channel: [''],
			accountManager: ['', [Validators.required]],
			status: [''],
		});

		this.currentUser = this.stateService.getCurrentUser();
		this.f.accountManager.setValue(this.currentUser.userId);
	}

	get f() { return this.currentForm.controls; }

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
					description: this.currentForm.get('description').value,
					officeAddress: this.currentForm.get('officeAddress').value,
					billingAddress: this.currentForm.get('billingAddress').value,
					tin: this.currentForm.get('tin').value,
					website: this.currentForm.get('website').value,
					companySize: this.currentForm.get('companySize').value,
					channel: this.currentForm.get('channel').value == "" ? "NONE" : this.currentForm.get('channel').value,
					accountManager: this.currentForm.get('accountManager').value
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

		let hasError = false;

		this.currentForm.controls['accountManager'].markAsTouched();

		if(this.f.accountManager.value == '' || this.f.accountManager.value == 'undefined' || this.f.accountManager == null) {
			this.isAccountManagerIdInvalid = true;
			hasError = true;
		} else {
			this.isAccountManagerIdInvalid = false;
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
				let requestBody = {
					name: this.currentForm.get('name').value,
					description: this.currentForm.get('description').value,
					officeAddress: this.currentForm.get('officeAddress').value,
					billingAddress: this.currentForm.get('billingAddress').value,
					tin: this.currentForm.get('tin').value,
					website: this.currentForm.get('website').value,
					companySize: this.currentForm.get('companySize').value,
					channel: this.currentForm.get('channel').value == "" ? "NONE" : this.currentForm.get('channel').value,
					accountManager: this.currentForm.get('accountManager').value
				};



				this.httpClient
						.post(this.ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.toastr.success(`New ${this.title} successfully saved.`, 'Success', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Conflict occured.', 'Failed Request', { timeOut: 3000 });
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

	onCompanySizeHandler = (event) => {
		if(event) {
			this.f.companySize.setValue(event);
		} else {
			this.f.companySize.setValue('');
		}
	}

	onChannelSelected = (channel: any) => {
		if(channel) {
			this.selectedChannel = channel;
			this.f.channel.setValue(channel);
		} else {
			this.f.channel.setValue('');
		}
  	}

	onAccountManagerSelected = (accountManagerId: any) => {
		if(accountManagerId) {
			this.isAccountManagerIdInvalid = false;
			this.f.accountManager.setValue(accountManagerId);
		} else {
			this.f.accountManager.setValue('');
			this.isAccountManagerIdInvalid = true;

		}
  	}

	cancel() {
		this.router.navigate([this.LANDING_PAGE]);
	}

	cancelEdit() {
		this.editForm = false;
		this.viewForm = true;
	}

	isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}
}