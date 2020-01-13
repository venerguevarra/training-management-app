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
import { ContactDataService } from '../../service/contact-data.service';

@Component({
	selector: 'app-contact-select',
	templateUrl: './contact-select.component.html',
	styleUrls: ['./contact-select.component.scss']
})
export class ContactSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() accountId: string;
    @Input() selectedContact = '';

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
        if(this.accountId) {
            this.contactDataService.getActiveByAccountId(this.accountId).subscribe(courses => {
                this.courses = courses;
                this.coursesBuffer = this.courses.slice(0, this.bufferSize);
                if(this.selectedContact && this.selectedContact != '') {
                    this.selectedId = this.selectedContact;
                }
		    });
        } else {
            this.contactDataService.getActive().subscribe(courses => {
                this.courses = courses;
                this.coursesBuffer = this.courses.slice(0, this.bufferSize);
                if(this.selectedContact && this.selectedContact != '') {
                    this.selectedId = this.selectedContact;
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
        private contactDataService: ContactDataService) {
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

    search(term: string, item) {
        term = term.toLowerCase();
        console.log(term, item)
        return item.name.toLowerCase().indexOf(term) > -1;
    }
}