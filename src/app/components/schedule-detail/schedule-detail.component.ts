import { Component, Output, EventEmitter,Input } from '@angular/core';
import { OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';


import { environment } from '../../../environments/environment';
import { ReferenceDataService } from '../../service/reference-data.service';

@Component({
	selector: 'app-schedule-detail',
	templateUrl: './schedule-detail.component.html',
})
export class ScheduleDetailComponent {

    @Input() id: string;
    @Input() showStatus: boolean;

    detail: string;
    data: any;
    status: string;

	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private referenceDataService: ReferenceDataService) {


	}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['id'] && changes['id'].currentValue) {
            this.referenceDataService.getEntityData('course-schedules', changes['id'].currentValue).subscribe(data => {
               this.detail = `${data['startDate']} to ${data['endDate']}`;
               if(data['status'] == 'SCHEDULE_WAITING') {
                   this.status = 'WAITING CONFIRMATION';
               } else if(data['status'] == 'SCHEDULE_CONFIRMED') {
                   this.status = 'CONFIRMED';
               } else if(data['status'] == 'SCHEDULE_CANCELLED') {
                   this.status = 'CANCELLED';
               } else if(data['status'] == 'SCHEDULE_DELIVERED') {
                   this.stats = 'DELIVERED';
               }
               this.data = data;
		    });
        }
    }

}