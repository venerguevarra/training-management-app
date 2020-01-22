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
	selector: 'app-cost-detail',
	templateUrl: './cost-detail.component.html',
	styleUrls: ['./cost-detail.component.scss']
})
export class CostDetailComponent {

    @Input() id: string;

    name: string;

	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private referenceDataService: ReferenceDataService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['id'] && changes['id'].currentValue) {
            this.referenceDataService.getEntityData('costings', changes['id'].currentValue).subscribe(course => {
               this.name = course['name'];
		    });
        }
    }

}