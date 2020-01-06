import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';

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

	courseId;

	constructor(
		private route: ActivatedRoute,
		private httpClient: HttpClient,
		private router: Router
	) { 
		this.route.params.subscribe( params => {
			console.log(params);
			if (params['id']) { 
				this.courseId = params.id;
			}
		});
		
	}

	ngOnInit() {

	}
}