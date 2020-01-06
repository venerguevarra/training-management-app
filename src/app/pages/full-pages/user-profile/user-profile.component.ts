import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../service/state.service';
import { User } from '../../../model/user';

import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly UPDATE_PROFILE_ENDPOINT: string = `${this.API_HOST}/user-profiles`;

	currentForm: FormGroup;
    submitted = false;
	userId: string;
	profileId: string;
	firstName: string;
	lastName: string;
	middleInitial: string;
	email: string;
	username: string;
	currentUser;

	genericError: boolean = false;
	emailTaken: boolean = false;
	usernameTaken: boolean = false;

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) { }

	ngOnInit() {
		this.currentUser = this.stateService.getCurrentUser();

		this.userId = this.currentUser.userId;
		this.profileId = this.currentUser.profileId;

        this.currentForm = this.formBuilder.group({
            username: [this.currentUser.username, Validators.required],
            email: [this.currentUser.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
			firstName: [this.currentUser.firstName, Validators.required],
			lastName: [this.currentUser.lastName, Validators.required],
			middleInitial: [this.currentUser.middleInitial]
        });
    }

	get currentEmail(){ return this.currentForm.get('email') }

	hasError(field: string) {
        return ((this.currentForm.get(field).dirty 
					|| this.currentForm.get(field).touched) && 
						this.currentForm.get(field).invalid && 
							(this.currentForm.get(field).errors.required) 
								&& !this.submitted) || 
                (this.currentForm.get(field).untouched && 
					this.currentForm.get(field).invalid && 
						this.currentForm.get(field).errors.required && 
                    		this.submitted);
    }

	submit() {
		
        this.submitted = true;

        if (this.currentForm.invalid) {
            return;
        }

		swal.fire({
			text: "Save profile changes?",
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save'
		}).then(e => {
			if(e.value) {
				let userProfile = {
					userId: this.userId,
					profileId: this.profileId,
					username: this.currentForm.get('username').value,
					email: this.currentForm.get('email').value,
					firstName: this.currentForm.get('firstName').value,
					lastName: this.currentForm.get('lastName').value,
					middleInitial: this.currentForm.get('middleInitial').value
				};

				this.httpClient
						.put(this.UPDATE_PROFILE_ENDPOINT, userProfile, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									this.genericError = false;
									this.usernameTaken = false;
									this.emailTaken = false;

									let updatedUser: User = {
										userId: this.currentUser.userId,
										profileId: this.currentUser.profileId,
										firstName: userProfile.firstName,
										lastName: userProfile.lastName,
										middleInitial: userProfile.middleInitial,
										email: userProfile.email,
										username: userProfile.username,
										token: this.currentUser.token
									}
									this.stateService.setCurrentUser(updatedUser);
									this.currentUser = this.stateService.getCurrentUser();
									this.resetCurrentState();
									this.toastr.success(
										 'User profile successfully updated.', 
										 'Success',
										 {
											timeOut :  3000,
											closeButton: true
										 }
									);
								}
							},
							(error) => {
								this.genericError = error.status != 200 && error.status != 409;
								this.usernameTaken = error.status == 409 && error.error.status && error.error.status == 'username_already_taken';
								this.emailTaken = error.status == 409 && error.error.status && error.error.status == 'email_already_taken';	
							}
						);
			}
							
		});
    }

	reset() {
		swal.fire({
			type: "info",
			text: "Are you sure? Reset to default profile information",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Reset'
		}).then(e => {
			if(e.value) {
				this.resetCurrentState();
			}
		});
	}

	resetCurrentState() {
		this.currentForm.get('username').setValue(this.currentUser.username);
		this.currentForm.get('email').setValue(this.currentUser.email);
		this.currentForm.get('firstName').setValue(this.currentUser.firstName);
		this.currentForm.get('lastName').setValue(this.currentUser.lastName);
		this.currentForm.get('middleInitial').setValue(this.currentUser.middleInitial);
		this.genericError = false;
		this.usernameTaken = false;
		this.emailTaken = false;
	}
	
}