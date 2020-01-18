import { Component, Output, EventEmitter,Input } from '@angular/core';
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
	selector: 'app-facilitator-select',
	templateUrl: './facilitator-select.component.html',
	styleUrls: ['./facilitator-select.component.scss']
})
export class FacilitatorSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() selectedFacilitator = '';

	facilitators = [];
    dataBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    onChange($event) {
        if($event) {
            this.selectedIdEmitter.emit($event);
        }
    }

    onClear($event) {
        if($event) {
            this.selectedIdEmitter.emit($event);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

	initReferences() {
		this.referenceDataService.getActiveReferenceData('facilitators').subscribe(data => {
			this.facilitators = data;
            this.dataBuffer = this.facilitators.slice(0, this.bufferSize);
		});
	}

	 onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.loading || this.facilitators.length <= this.dataBuffer.length) {
            return;
        }

        if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.dataBuffer.length) {
            this.fetchMore();
        }
    }

	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private referenceDataService: ReferenceDataService) {
		this.initReferences();
	}

	private fetchMore() {
        const len = this.dataBuffer.length;
        const more = this.facilitators.slice(len, this.bufferSize + len);
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }
}