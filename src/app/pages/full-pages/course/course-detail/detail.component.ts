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
	selector: 'app-course-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class CourseDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/courses`;
	private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
	private readonly LANDING_PAGE: string = '/app/course';

	title = 'Course';
	currentUser;
	courseId;
	currentForm: FormGroup;
    submitted = false;
	genericError: boolean = false;
	currentCourse;
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

		this.route.params.subscribe( params => {

			this.currentForm = this.formBuilder.group({
				id: [''],
				name: ['', [Validators.required]],
				fee: ['', [Validators.required]],
				description: [''],
				days: ['', [Validators.required]],
				status: ['', [Validators.requiredTrue]]
			});

			if (params['id']) {
				this.courseId = params.id;
				this.newForm = this.courseId == -1;

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
					this.httpClient.get(`${this.ENDPOINT}/${this.courseId}`).subscribe(
						(data) => {
							this.currentCourse = data;

							if(this.currentCourse.createdBy != null) {
								this.httpClient.get(`${this.USERS_ENDPOINT}/${this.currentCourse.createdBy}`).subscribe(
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
							

							if(this.currentCourse.modifiedBy != null) {
								this.httpClient.get(`${this.USERS_ENDPOINT}/${this.currentCourse.modifiedBy}`).subscribe(
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
								id: [this.currentCourse.id],
								name: [this.currentCourse.name, [Validators.required]],
								fee: [this.currentCourse.courseFee, [Validators.required]],
								description: [this.currentCourse.description],
								days: [this.currentCourse.numberOfDays, [Validators.required]],
								createdDate: [this.currentCourse.createdDate],
								createdBy: [this.currentCourse.createdBy],
								modifiedDate: [this.currentCourse.modifiedDate],
								modifiedBy: [this.currentCourse.modifiedBy],
								status: [this.currentCourse.active]
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
					active: this.currentForm.get('status').value,
				};

				let courseId = this.currentForm.get('id').value;

				this.httpClient
						.put(`${this.ENDPOINT}/${courseId}`, course, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 200) {
									this.genericError = false;
									
									this.toastr.info(`${this.title} successfully updated.`, 'System', { timeOut: 3000 });
								}
							},
							(error) => {
								this.genericError = false;
								
								if(error.status === 409) {
									this.toastr.error('Course name already exist.', 'Conlict', { timeOut: 3000 });
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
								this.genericError = false;

								if(error.status === 409) {
									this.toastr.error('Course name already exist.', 'Conlict', { timeOut: 3000 });
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
		this.router.navigate(['/app/course']);
	}

}