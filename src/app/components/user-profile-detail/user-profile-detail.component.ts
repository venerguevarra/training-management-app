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
	selector: 'app-user-profile-detail',
	templateUrl: './user-profile-detail.component.html',
	styleUrls: ['./user-profile-detail.component.scss']
})
export class UserProfileDetailComponent {

    @Input() id: string;
    @Input() showEmail: boolean;

    name: string;
    email: string;

	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private referenceDataService: ReferenceDataService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['id'] && changes['id'].currentValue) {
            this.referenceDataService.getEntityData('users', changes['id'].currentValue).subscribe(user => {
                this.name = `${user['userProfile']['firstName']} ${user['userProfile']['lastName']}`;

		    });
        }
    }

}