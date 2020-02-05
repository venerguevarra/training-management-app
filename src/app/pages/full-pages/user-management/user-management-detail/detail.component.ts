import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
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
	selector: 'app-user-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class UserManagementDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly CREATE_USER_ENDPOINT: string = `${this.ENDPOINT}/actions/create-user`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/setup/user';

	title = 'User Account';
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
	roleData;
	userLockedStatus:boolean = false;

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
								profileId: [this.currentModel.userProfile.id, [Validators.required]],
								username: [this.currentModel.username, [Validators.required]],
								email: [this.currentModel.userProfile.email, [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
								firstName: [this.currentModel.userProfile.firstName, [Validators.required]],
								lastName: [this.currentModel.userProfile.lastName, [Validators.required]],
								middleInitial: [this.currentModel.userProfile.middleInitial],
								createdDate: [this.currentModel.createdDate],
								createdBy: [this.currentModel.createdBy],
								modifiedDate: [this.currentModel.modifiedDate],
								modifiedBy: [this.currentModel.modifiedBy],
								status: [this.currentModel.active]
							});

							this.isRecordActive = this.currentModel.active === 'ACTIVE';
							this.userLockedStatus =this.currentModel.loginAttempt >= 3 && !this.isRecordActive;
							this.getUserRoles();
						},
						(error) => {
							this.toastr.error('Error has occurred.', 'System', { timeOut: 3000 });
						}
					);
				}
			}
		});

		this.getRoles().then(data => {
			this.roleData = data;
		}).catch(err => {
		})
	}

	initForm() {
		this.currentForm = this.formBuilder.group({
			id: [''],
			username: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			//password: ['', [Validators.required]],
			//confirmPassword: ['', [Validators.required, this.passwordMatcher.bind(this)]],
			firstName: ['', [Validators.required]],
			lastName: ['', [Validators.required]],
			middleInitial: [''],
			status: [''],
			profileId: ['']
		});
	}

	private passwordMatcher(control: FormControl): { [s: string]: boolean } {
		if (this.currentForm && (control.value !== this.currentForm.controls.password.value)) {
			return { passwordNotMatch: true };
		}
		return null;
	}

	get f() { return this.currentForm.controls; }

	ngAfterViewInit() {
		this.currentUser = this.stateService.getCurrentUser();
	}

	hasUserRolesSelected = true;
	saveNew() {
		this.submitted = true;

		if(this.selectedUserRoles.length == 0) {
			this.hasUserRolesSelected = false;
		} else {
			this.hasUserRolesSelected = true;
		}


        if (this.currentForm.invalid || !this.hasUserRolesSelected) {
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
					username: this.currentForm.get('username').value,
					email: this.currentForm.get('email').value,
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value,
					roles: this.selectedUserRoles
				};

				this.httpClient
						.post(this.CREATE_USER_ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									this.toastr.success(`New user successfully saved.`, 'Success', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Username or email number already exist.', 'Failed Request', { timeOut: 3000 });
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

	update() {
		this.submitted = true;

        if(this.selectedUserRoles.length == 0) {
			this.hasUserRolesSelected = false;
		} else {
			this.hasUserRolesSelected = true;
		}

        if (this.currentForm.invalid || !this.hasUserRolesSelected) {
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
					id: this.currentForm.get('id').value,
					profileId: this.currentForm.get('profileId').value,
					username: this.currentForm.get('username').value,
					email: this.currentForm.get('email').value,
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value,
					roles: this.selectedUserRoles,
					active: this.currentForm.get('status').value
				};

				let resourceId = this.currentForm.get('id').value;

				this.httpClient
						.post(`${this.ENDPOINT}/actions/update-user`, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									this.toastr.success(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
									this.router.navigate([this.LANDING_PAGE]);
								}
							},
							(error) => {
								if(error.status === 409) {
									this.toastr.error('Email or username number already exist.', 'Failed Request', { timeOut: 3000 });
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

	getRoles(): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/references/roles`;

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

	userRolesData;
	getUserRoles(): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/users/${this.modelId}/user-roles`;

		this.httpClient
			.get<any[]>(ACTIVE_ENDPOINT, {})
			.toPromise()
			.then(
				res => {
					this.userRolesData = res;
					this.userRolesData.forEach(item => {
						if(item.selected) {
							this.selectedUserRoles.push(item.role.id);
						}
					})
					resolve(res);
				},
				msg => {
					reject(msg);
				}
			);
		});

		return promise;
	}

	emailTaken = false;
	validateEmail() {
		if(this.f.email.value != '') {
			let promise = new Promise((resolve, reject) => {
			let ACTIVE_ENDPOINT: string = `${this.API_HOST}/users/actions/check-email?email=${this.f.email.value}`;
			if(this.editForm) {
				ACTIVE_ENDPOINT = `${this.API_HOST}/users/actions/check-email?email=${this.f.email.value}&userId=${this.f.id.value}`;
			}

			this.httpClient
				.post<any[]>(ACTIVE_ENDPOINT, {})
				.toPromise()
				.then(
					res => {
						this.emailTaken = false;
						resolve(res);
					},
					msg => {
						this.emailTaken = true;
						reject(msg);
					}
				);
			});
		} else {
			this.emailTaken = false;
		}
	}



	usernameTaken = false;
	validateUsername() {
		if(this.f.username.value != '') {
			let promise = new Promise((resolve, reject) => {
			let ACTIVE_ENDPOINT: string = `${this.API_HOST}/users/actions/check-username?username=${this.f.username.value}`;
			if(this.editForm) {
				ACTIVE_ENDPOINT = `${this.API_HOST}/users/actions/check-username?username=${this.f.username.value}&userId=${this.f.id.value}`;
			}
			this.httpClient
				.post<any[]>(ACTIVE_ENDPOINT, {})
				.toPromise()
				.then(
					res => {
						this.usernameTaken = false;
						resolve(res);
					},
					msg => {
						this.usernameTaken = true;
						reject(msg);
					}
				);
			});
		} else {
			this.usernameTaken = false;
		}
	}

	selectedUserRoles: Array<string> = [];
	onRoleSelectHandler(evt, role) {
		if (evt.target.checked) {
			this.selectedUserRoles.push(role.id);
		} else {
			let index: number = 0;
			this.selectedUserRoles.forEach((id) => {
				if(id == role.id) {
					this.selectedUserRoles.splice(index, 1);
					return;
				}
				index++;
			});
		}
	}

	resetPassword() {

		let promise = new Promise((resolve, reject) => {

			let ACTIVE_ENDPOINT: string = `${this.API_HOST}/users/actions/reset-password?userId=${this.f.id.value}`;

			swal.fire({
				title: 'Reset Password',
				text: `Reset account's password?`,
				type: "info",
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Reset',
				allowOutsideClick: false
			}).then(e => {
				if(e.value) {
					this.httpClient
						.post<any[]>(ACTIVE_ENDPOINT, {})
						.toPromise()
						.then(
							res => {
								this.toastr.success(`Account password reset. An email was sent to user's registered email.`, 'System', { timeOut: 3000 });
								resolve(res);
							},
							msg => {
								this.toastr.error(`Failed to reset account's password.`, 'Failed request', { timeOut: 3000 });
								reject(msg);
							}
						);
				}
			});

		});

	}
}