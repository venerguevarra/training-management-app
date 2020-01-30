import { Component, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { StateService } from '../../../service/state.service';
import { User } from '../../../model/user.model';

import { environment } from '../../../../environments/environment';
import { MustMatch } from '../../../validator/must-match.validator';
import { AuthService } from '../../../shared/auth/auth.service';

@Component({
	selector: 'app-course-participant-list',
	templateUrl: './course-participant-list.component.html',
	styleUrls: ['./course-participant-list.component.scss']
})
export class CourseParticipantListComponent {

	private readonly API_HOST = environment.API_HOST;

	@Input() courseScheduleId;

	currentForm: FormGroup;

	constructor(
		private authService: AuthService,
		private httpClient: HttpClient,
        private stateService: StateService,
		private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute) { }

	ngOnInit() {
    }

    get f() { return this.currentForm.controls; }

	submit() {
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['courseScheduleId'] && changes['courseScheduleId'].currentValue) {
			this.getParticipants(changes['courseScheduleId'].currentValue).then(e=>{
			});
        }
    }

	getParticipants(id: string): Promise<any> {
		let promise = new Promise((resolve, reject) => {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-participants/actions/find-by-schedule/${id}`;

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
}