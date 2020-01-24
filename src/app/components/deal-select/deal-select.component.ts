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
	selector: 'app-deal-select',
	templateUrl: './deal-select.component.html'
})
export class DealSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() accountId: string;
    @Input() selectedDeal = '';

    selectedId;

	deals = [];
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

    onClear($event) {
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes['isInvalid']) {
            return;
        }

        if (this.accountId || (changes['accountId'] && changes['accountId'].currentValue)) {
            if(changes['accountId'] && changes['accountId'].currentValue) {
                this.accountId = changes['accountId'].currentValue;
            }
            this.referenceDataService.getActiveReferencesByAccountId('deals', this.accountId).subscribe(data => {
                this.deals = data;
                this.dataBuffer = this.deals.slice(0, this.bufferSize);
                if(this.selectedDeal && this.selectedDeal != '') {
                    this.selectedId = this.selectedDeal;
                }
		    });
        } else {
            this.referenceDataService.getActiveReferences('deals').subscribe(data => {
                this.deals = data;
                this.dataBuffer = this.deals.slice(0, this.bufferSize);
                if(this.selectedDeal && this.selectedDeal != '') {
                    this.selectedId = this.selectedDeal;
                }
		    });
        }
    }

	onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.loading || this.deals.length <= this.dataBuffer.length) {
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
	}

	private fetchMore() {
        const len = this.dataBuffer.length;
        const more = this.deals.slice(len, this.bufferSize + len);
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }

    search(term: string, item) {
        term = term.toLowerCase();
        return item.name.toLowerCase().indexOf(term) > -1;
    }
}