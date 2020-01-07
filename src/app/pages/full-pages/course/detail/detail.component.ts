import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-course-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss']
})
export class CourseDetailComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly COURSE_ENDPOINT: string = `${this.API_HOST}/courses`;

	currentUser;
	courseId;
	currentForm: FormGroup;
    submitted = false;
	genericError: boolean = false;
	currentCourse;

	constructor(
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) {

		this.route.params.subscribe( params => {

			this.currentForm = this.formBuilder.group({
				id: ['', [Validators.required]],
				name: ['', [Validators.required]],
				fee: ['', [Validators.required]],
				description: [''],
				days: ['', [Validators.required]]
			});

			if (params['id']) {
				this.courseId = params.id;

				this.httpClient.get(`${this.COURSE_ENDPOINT}/${this.courseId}`).subscribe(
					(data) => {
						console.log(data);
						this.currentCourse = data;

						this.currentForm = this.formBuilder.group({
							id: [this.currentCourse.id],
							name: [this.currentCourse.name, [Validators.required]],
							fee: [this.currentCourse.courseFee, [Validators.required]],
							description: [this.currentCourse.description],
							days: [this.currentCourse.numberOfDays, [Validators.required]]
						});
					},
					(error) => {
						console.log(error);
					}
				);
			}
		});

	}

	get f() { return this.currentForm.controls; }

	ngAfterViewInit() {
		this.currentUser = this.stateService.getCurrentUser();
	}

	submit() {
	}

	cancel() {
		this.router.navigate(['/app/course']);
	}
}