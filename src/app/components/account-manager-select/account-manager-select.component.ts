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
import { AccountManagerDataService, AccountManager } from '../../service/account-manager-data.service';
import { StateService } from '../../service/state.service';

@Component({
	selector: 'app-account-manager-select',
	templateUrl: './account-manager-select.component.html',
	styleUrls: ['./account-manager-select.component.scss']
})
export class AccountManagerSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();
    @Input() isInvalid: boolean;
    @Input() selectedAccountManager;
    @Input() currentUser: boolean;

	data = [];
    dataBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    constructor(
        private dataService: AccountManagerDataService,
        private stateService: StateService
    ) {
		this.initReferences();
	}

	initReferences() {
		this.dataService.getActive().subscribe(data => {
			this.data = data;
            this.dataBuffer = this.data.slice(0, this.bufferSize);
            if(this.currentUser) {
                this.selectedAccountManager = this.stateService.getCurrentUser().userId;
            }
		});
	}

	onScrollToEnd() {
        this.fetchMore();
    }

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

        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }
}