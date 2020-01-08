import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user.model';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-course-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss']
})
export class CourseListComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly COURSES_ENDPOINT: string = `${this.API_HOST}/courses`;
	  private readonly COURSES_FIND_ENDPOINT: string = `${this.COURSES_ENDPOINT}/actions/find`;

	rows: any = [];
	page = 0;
	pageSize = 10;
	collectionSize = 0;
	isCollapsed = true;

	searchForm: FormGroup;
	createdDateModel;
	createdDate;
	criteria;


	constructor(
		private formBuilder: FormBuilder,
		private httpClient: HttpClient,
		private router: Router
	) { }

	ngOnInit() {
		let params = {'size': '10', 'page': '0'};
		this.retrieveList(params);

		this.searchForm = this.formBuilder.group({
			courseName: [''],
			createdDate: ['']
		});

		this.criteria = [];
	}

	paginationChange(event) {
	    let currentPage = this.page - 1;
		let params = {'size': this.pageSize.toString(), 'page': currentPage.toString()};
		if(this.getSearchFormCriteria().length > 0) {
			this.submitSearchForm(params);
		} else {
			this.retrieveList(params);
		};
	}

	paginationSizeChange() {
		let currentPage = this.page - 1;
		let params = {'size': this.pageSize.toString(), 'page': currentPage.toString()}
		if(this.getSearchFormCriteria().length > 0) {
			this.submitSearchForm(params);
		} else {
			this.retrieveList(params);
		};
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

	navigateToNewForm() {
	  this.router.navigate(['/app/course', -1]);
  	}

	clearSearchForm() {
		this.searchForm.reset();
		this.createdDate = undefined;
		this.createdDateModel = undefined;
		this.criteria = [];
		let params = {'size': '10', 'page': '0'};
		this.retrieveList(params);
	}

	private getSearchFormCriteria() {
		this.criteria = [];

		if(!(typeof this.createdDateModel === 'undefined')) {
    		let month = `0${this.createdDateModel.month}`.slice(-2);
			let day = `0${this.createdDateModel.day}`.slice(-2);
			let year = `${this.createdDateModel.year}`;
			this.createdDate = `${year}-${month}-${day}`;
			this.criteria.push({
				name: 'createdDate',
				value: this.createdDate,
				operator: 'GE',
				type: 'DATE'
			});
		}


		if(!(this.searchForm.get('courseName').value === null || this.searchForm.get('courseName').value === 'undefined' || this.searchForm.get('courseName').value === undefined || this.searchForm.get('courseName').value === '')) {
			this.criteria.push({
				name: 'name',
				value: this.searchForm.get('courseName').value,
				operator: 'LIKE',
				type: 'STRING'
			});
		}

		return this.criteria;
	}

	submitSearchForm(params) {
		let jsonBody = {};

		this.criteria = this.getSearchFormCriteria();
		if(typeof params === 'undefined') {
			jsonBody = {
				criteria: this.criteria,
				page: 0,
				size: 10
			}
		} else {
			jsonBody = {
				criteria: this.criteria,
				page: params.page,
				size: params.size
			}
		}

		if(this.criteria.length > 0) {


			this.httpClient
				.post(this.COURSES_FIND_ENDPOINT, jsonBody)
				.subscribe(
					(data) => {
						this.collectionSize = data['totalElements'];
						this.rows = data['elements'];
					}
				);
		}
	}
}