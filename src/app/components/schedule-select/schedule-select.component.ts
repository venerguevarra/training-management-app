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
	selector: 'app-schedule-select',
	templateUrl: './schedule-select.component.html'
})
export class ScheduleSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();
    @Output() private scheduleEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() courseId: string;
    @Input() selectedSchedule = '';

    selectedId;

	schedules = [];
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

        if (changes['courseId'] && changes['courseId'].currentValue) {
            this.referenceDataService.getActiveReferencesByCourseId('course-schedules', changes['courseId'].currentValue).subscribe(schedules => {
                this.courseId = changes['courseId'].currentValue;
                this.schedules = schedules;
                this.dataBuffer = this.schedules.slice(0, this.bufferSize);

                if(schedules.length == 0) {
                    this.scheduleEmitter.emit('no_schedules_found');
                }
                if(this.selectedSchedule && this.selectedSchedule != '') {
                    this.selectedId = this.selectedSchedule;
                }
		    });
        }
    }

	onScrollToEnd() {
        this.fetchMore();
    }

    onScroll({ end }) {
        if (this.loading || this.schedules.length <= this.dataBuffer.length) {
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
        const more = this.schedules.slice(len, this.bufferSize + len);
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
            this.dataBuffer = this.dataBuffer.concat(more);
        }, 200)
    }

    search(term: string, item) {
        term = term.toLowerCase();
        return item.name.toLowerCase().indexOf(term) > -1 || item.data.startDate.indexOf(term) >-1 || item.data.endDate.indexOf(term) > -1;
    }
}