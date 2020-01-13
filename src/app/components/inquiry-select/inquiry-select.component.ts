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
import { InquiryDataService } from '../../service/inquiry-data.service';

@Component({
	selector: 'app-inquiry-select',
	templateUrl: './inquiry-select.component.html',
	styleUrls: ['./inquiry-select.component.scss']
})
export class InquirySelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() accountManager: string;
    @Input() selectedInquiry = '';

    selectedId;

	courses = [];
    coursesBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    onChange($event) {
        console.log('change', $event);
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event);
        }
    }

    onClear($event) {
        console.log('clear', $event);
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

	initReferences() {
        if(this.accountManager) {
            this.inquiryDataService.getActiveByAccountManager(this.accountManager).subscribe(courses => {
                this.courses = courses;
                this.coursesBuffer = this.courses.slice(0, this.bufferSize);
                if(this.selectedInquiry && this.selectedInquiry != '') {
                    this.selectedId = this.selectedInquiry;
                }
		    });
        } else {
            this.inquiryDataService.getActive().subscribe(courses => {
                this.courses = courses;
                this.coursesBuffer = this.courses.slice(0, this.bufferSize);
                if(this.selectedInquiry && this.selectedInquiry != '') {
                    this.selectedId = this.selectedInquiry;
                }
		    });
        }

	}

	onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.loading || this.courses.length <= this.coursesBuffer.length) {
            return;
        }

        if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.coursesBuffer.length) {
            this.fetchMore();
        }
    }

	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private inquiryDataService: InquiryDataService) {
		this.initReferences();
	}

	private fetchMore() {
        const len = this.coursesBuffer.length;
        const more = this.courses.slice(len, this.bufferSize + len);
        this.loading = true;
        // using timeout here to simulate backend API delay
        setTimeout(() => {
            this.loading = false;
            this.coursesBuffer = this.coursesBuffer.concat(more);
        }, 200)
    }
}