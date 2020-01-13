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
import { AccountDataService, Account } from '../../service/account-data.service';

@Component({
	selector: 'app-account-select',
	templateUrl: './account-select.component.html',
	styleUrls: ['./account-select.component.scss']
})
export class AccountSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();
    @Input() isInvalid: boolean;
    @Input() selectedAccount;

    selectedId = '-1';

	data = [];
    dataBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    constructor(private dataService: AccountDataService) {
		this.initReferences();
	}

	initReferences() {
		this.dataService.getActive().subscribe(data => {
			this.data = data;
            this.dataBuffer = this.data.slice(0, this.bufferSize);
		});
	}

	onScrollToEnd() {
        this.fetchMore();
    }

    onChange($event) {
        if($event) {
            this.selectedIdEmitter.emit($event.value);
        }
    }

    onClear($event) {
        if($event) {
            this.selectedIdEmitter.emit($event.value);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

    onScroll({ end }) {
        if (this.loading || this.data.length <= this.dataBuffer.length) {
            return;
        }

        if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.dataBuffer.length) {
            this.fetchMore();
        }
    }

	private fetchMore() {
        const len = this.dataBuffer.length;
        const more = this.data.slice(len, this.bufferSize + len);
        this.loading = true;
        // using timeout here to simulate backend API delay
        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }
}