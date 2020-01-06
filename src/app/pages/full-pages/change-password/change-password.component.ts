import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../service/state.service';
import { User } from '../../../model/user';

import { environment } from '../../../../environments/environment';
import { MustMatch } from '../../../validator/must-match.validator';

@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

	private readonly API_HOST = environment.API_HOST;
  	private readonly CHANGE_PASSWORD_ENDPOINT: string = `${this.API_HOST}/users/actions/change-password`;

	currentUser;
	currentForm: FormGroup;
    submitted = false;

	genericError: boolean = false;
	invalidPasswordError: boolean = false;
	sameCurrentPasswordError: boolean =  false;

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) { }

	ngOnInit() {
		this.currentUser = this.stateService.getCurrentUser();

        this.currentForm = this.formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
			confirmNewPassword: ['', [Validators.required]]
        },
		{
            validator: MustMatch('newPassword', 'confirmNewPassword')
        });
    }

    get f() { return this.currentForm.controls; }

	submit() {
		this.submitted = true;

        if (this.currentForm.invalid) {
            return;
        }

		swal.fire({
			text: "Change password?",
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Change'
		}).then(e => {
			if(e.value) {
				
				let requestBody = {
					username: this.currentUser.username,
					password: this.currentForm.get('currentPassword').value,
					newPassword: this.currentForm.get('newPassword').value
				};
									
				this.httpClient
						.post(this.CHANGE_PASSWORD_ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									let currentUserData = JSON.parse(JSON.stringify(data.body));
									let updatedUser: User = {
										userId: currentUserData.userId,
										profileId: currentUserData.profileId,
										firstName: currentUserData.firstName,
										lastName: currentUserData.lastName,
										middleInitial: currentUserData.middleInitial,
										email: currentUserData.email,
										username: currentUserData.username,
										token: currentUserData.token
									}
									this.stateService.setCurrentUser(updatedUser);

									this.genericError = false;
									this.invalidPasswordError = false;
									this.sameCurrentPasswordError = false;
									this.submitted = false;
									this.currentForm.reset();
									this.toastr.success(
										 'User profile successfully updated.', 
										 'Success', {
											timeOut :  3000,
											closeButton: true
										 }
									);
								}
							},
							(error) => {
								this.genericError = error.status != 200 && error.status != 500;
								this.invalidPasswordError = error.status == 500 && error.status && error.error.status == 'invalid_user_password';
								this.sameCurrentPasswordError = error.status == 500 && error.status && error.error.status == 'existing_password_conflict';
							}
						);
			}
							
		});
	}
	
}