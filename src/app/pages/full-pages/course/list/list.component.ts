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

import { PagedData } from '../../../../model/page.data';
import { Page } from '../../../..//model/page';

@Component({
	selector: 'app-course-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss']
})
export class CourseListComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly COURSES_ENDPOINT: string = `${this.API_HOST}/courses`;

	rows: any = [];
	page = new Page();

	constructor(
		private httpClient: HttpClient,
		private router: Router
	) { 
		this.page.pageNumber = 0;
    	this.page.size = 5;
	}

	ngOnInit() {
		this.setPage({ offset: 0});

		let params = {'size': '5', 'page': '0'};
		this.httpClient.get(this.COURSES_ENDPOINT, { params })
			.subscribe(
				(data) => {
					this.rows = data['elements'];
				}
		);
	}

	setPage(pageInfo) {
    	this.page.pageNumber = pageInfo.offset;

		let params = {'size': '5', 'page': this.page.pageNumber.toString()};
		this.httpClient.get(this.COURSES_ENDPOINT, { params })
			.subscribe(
				(data) => {
					console.log('data', data);
					this.rows = data['elements'];
					this.page.totalElements = data['totalElements'];
					this.page.totalPages = data['totalPages'];
					console.log('page', this.page);
				},
				(error) => {
					console.log(error);
				}
		);
  }

  detail(id) {
	  this.router.navigate(['/app/course', id]);
  }
}