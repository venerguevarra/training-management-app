import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
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
	page = 0; 			// current page
	pageSize = 5;		// number of elements/items per page
	collectionSize = 0;	// Number of elements/items in the collection


	constructor(
		private httpClient: HttpClient,
		private router: Router
	) {
	}

	ngOnInit() {
		let params = {'size': '5', 'page': '0'};
		this.retrieveList(params);
	}

	paginationChange(event) {
	    let currentPage = this.page - 1;
		let params = {'size': this.pageSize.toString(), 'page': currentPage.toString()};
		this.retrieveList(params);
	}

	paginationSizeChange() {
		let currentPage = this.page - 1;
		let params = {'size': this.pageSize.toString(), 'page': currentPage.toString()}
		this.retrieveList(params);;
	}

	retrieveList(params) {
		this.httpClient.get(this.COURSES_ENDPOINT, { params })
			.subscribe(
				(data) => {
					this.collectionSize = data['totalElements'];
					this.rows = data['elements'];
				}
		);
	}

  	detail(id) {
	  this.router.navigate(['/app/course', id]);
  	}
}