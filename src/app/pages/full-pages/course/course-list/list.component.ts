import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import 'rxjs/Rx';
import swal from 'sweetalert2';

import { StateService } from '../../../../service/state.service';
import { User } from '../../../../model/user.model';
import { environment } from '../../../../../environments/environment';
import { pageConfig } from '../../../page.config';

@Component({
	selector: 'app-course-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.scss']
})
export class CourseListComponent {
	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/courses`;
	private readonly FIND_ENDPOINT: string = `${this.ENDPOINT}/actions/find`;
	private readonly LANDING_PAGE: string = `/app/course`;

	title: string = "Course";
	rows: any = [];
	page = 0;
	pageSize = pageConfig.pageSize;
	collectionSize = 0;
	isCollapsed = true;

	searchForm: FormGroup;
	searchFormStatus;
	criteria;
	createdDate;

	defaultPaginationParams = {'size': this.pageSize.toString(), 'page': this.page.toString()};

	constructor(
		private toastr: ToastrService,
		private formBuilder: FormBuilder,
		private httpClient: HttpClient,
		private router: Router
	) { }

	ngOnInit() {
		this.retrieveList(this.defaultPaginationParams);

		this.searchForm = this.formBuilder.group({
			name: [''],
			status: ['ALL'],
			createdDate: ['']			
		});

		this.criteria = [];
	}

	paginationChange(event) {
	    this.paginationSizeChange();
	}

	paginationSizeChange() {
		let currentPage = this.page - 1;
		let params = {'size': this.pageSize.toString(), 'page': currentPage.toString()}
		this.criteria = this.getSearchFormCriteria();
		if(this.criteria.length > 0) {
			let jsonBody = {
				criteria: this.criteria,
				page: params.page,
				size: params.size
			}

			this.httpClient
				.post(this.FIND_ENDPOINT, jsonBody)
				.subscribe(
					(data) => {
						this.collectionSize = data['totalElements'];
						this.rows = data['elements'];
					}
				);
		} else {
			this.retrieveList(params);
		}
	}

	retrieveList(params) {
		this.httpClient.get(this.ENDPOINT, { params })
			.subscribe(
				(data) => {
					this.collectionSize = data['totalElements'];
					this.rows = data['elements'];
				}
		);
	}

	navigateToNewForm() {
	  this.router.navigate([`${this.LANDING_PAGE}`, -1]);
  	}

	clearSearchForm() {
		this.searchForm = this.formBuilder.group({
			name: [''],
			status: ['ALL'],
			createdDate: ['']			
		});
		this.createdDate = '';
		this.criteria = [];
		this.pageSize = pageConfig.pageSize;
		this.retrieveList(this.defaultPaginationParams);
		this.toastr.info(`${this.title} list refreshed`, 'System', { timeOut: 3000 });
	}

	private getSearchFormCriteria() {
		this.criteria = [];

		if(this.searchForm.get('name').value != '') {
			this.criteria.push({
				name: 'name',
				value: this.searchForm.get('name').value,
				operator: 'LIKE',
				type: 'STRING',
				logical: 'OR'
			});
		}

		if(this.searchForm.get('createdDate').value != '') {
    		let month = `0${this.searchForm.get('createdDate').value.month}`.slice(-2);
			let day = `0${this.searchForm.get('createdDate').value.day}`.slice(-2);
			let year = `${this.searchForm.get('createdDate').value.year}`;
			this.createdDate = `${year}-${month}-${day}`;
			this.criteria.push({
				name: 'createdDate',
				value: this.createdDate,
				operator: 'GE',
				type: 'DATE',
				logical: 'OR'
			});
		}

		if(this.searchForm.get('status').value != '') {
			if(this.searchForm.get('status').value == 'ALL' || this.searchForm.get('status').value == 'ACTIVE') {
				this.criteria.push({
					name: 'active',
					value: 'ACTIVE',
					paramName: 'activeParam',
					operator: 'EQ',
					type: 'ENUM',
					logical: 'OR'
				});
			}
			
			if(this.searchForm.get('status').value == 'ALL' || this.searchForm.get('status').value == 'INACTIVE') {
				this.criteria.push({
					name: 'active',
					value: 'INACTIVE',
					paramName: 'inactiveParam',
					operator: 'EQ',
					type: 'ENUM'
				});
			}
		}

		return this.criteria;
	}

	submitSearchForm(params) {
		this.page = 0;
		
		this.criteria = this.getSearchFormCriteria();
		if(this.criteria.length === 0) {
			this.toastr.error('Please provide search criteria', 'Search', { timeOut: 3000 });
		}

		let jsonBody = {
			criteria: this.criteria,
			page: '0',
			size: this.pageSize.toString()
		}
		
		if(this.criteria.length > 0) {
			this.httpClient
				.post(this.FIND_ENDPOINT, jsonBody)
				.subscribe(
					(data) => {
						this.collectionSize = data['totalElements'];
						this.rows = data['elements'];
					}
				);
		}
	}
}