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
import { EventService } from '../../service/event.service';

@Component({
	selector: 'app-cost-select',
	templateUrl: './cost-select.component.html',
	styleUrls: ['./cost-select.component.scss']
})
export class CostSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() selectedCosting = '';

	costings = [];
    dataBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    onChange($event) {
        if($event) {
            this.selectedCosting = $event.id;
            this.selectedIdEmitter.emit($event);
        } else {
            this.selectedCosting = "";
            this.selectedIdEmitter.emit('');
        }
    }

    onClear($event) {
        if($event) {
            this.selectedCosting = $event.id;
            this.selectedIdEmitter.emit($event);
        } else {
            this.selectedCosting = "";
            this.selectedIdEmitter.emit('');
        }
    }

	initReferences() {
		this.referenceDataService.getActiveReferenceData('costings').subscribe(data => {
			this.costings = data;
            this.dataBuffer = this.costings.slice(0, this.bufferSize);
		});
	}

	onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.loading || this.costings.length <= this.dataBuffer.length) {
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
        private referenceDataService: ReferenceDataService,
        private eventService: EventService) {
		this.initReferences();

        eventService.emitter.subscribe(item => {
			if(item && item.eventType && item.eventType === 'refresh-cost-select') {
                this.initReferences();
                this.selectedCosting = null;
            }
		});
	}

	private fetchMore() {
        const len = this.dataBuffer.length;
        const more = this.costings.slice(len, this.bufferSize + len);
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }
}