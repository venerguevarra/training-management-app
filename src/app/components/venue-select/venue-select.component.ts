import { Component, Output, EventEmitter,Input, SimpleChanges } from '@angular/core';
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
	selector: 'app-venue-select',
	templateUrl: './venue-select.component.html',
	styleUrls: ['./venue-select.component.scss']
})
export class VenueSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() selectedVenue = '';

    selectedId;

	venues = [];
    dataBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    onChange($event) {
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
       if(changes['isInvalid']) {
            return;
        }

        if (changes['selectedVenue'] && changes['selectedVenue'].currentValue) {
            this.referenceDataService.getActiveReferenceData('venues').subscribe(data => {
			this.venues = data;
            this.dataBuffer = this.venues.slice(0, this.bufferSize);
            if(this.selectedVenue && this.selectedVenue != '') {
                this.selectedId = this.selectedVenue;
            }
		});
        }
    }

    onClear($event) {
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

	initReferences() {
		this.referenceDataService.getActiveReferenceData('venues').subscribe(data => {
			this.venues = data;
            this.dataBuffer = this.venues.slice(0, this.bufferSize);
            if(this.selectedVenue && this.selectedVenue != '') {
                this.selectedId = this.selectedVenue;
            }
		});
	}

	 onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.loading || this.venues.length <= this.dataBuffer.length) {
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
        const more = this.venues.slice(len, this.bufferSize + len);
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }
}