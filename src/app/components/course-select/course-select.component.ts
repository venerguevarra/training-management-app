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
import { CourseDataService, Course } from '../../service/course-data.service';

@Component({
	selector: 'app-course-select',
	templateUrl: './course-select.component.html',
	styleUrls: ['./course-select.component.scss']
})
export class CourseSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();

    @Input() isInvalid: boolean;
    @Input() selectedCourse = '';

	courses$: Observable<Course[]>;
    selectedId = '-1';

	courses = [];
    coursesBuffer = [];
    bufferSize = 50;
    numberOfItemsFromEndBeforeFetchingMore = 10;
    loading = false;

    onChange($event) {
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event.id);
        }
    }

    onClear($event) {
        if($event) {
            this.selectedId = $event.id;
            this.selectedIdEmitter.emit($event.id);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

	initReferences() {
		this.courseDataService.getActiveCourses().subscribe(courses => {
			this.courses = courses;
            this.coursesBuffer = this.courses.slice(0, this.bufferSize);
            if(this.selectedCourse && this.selectedCourse != '') {
                this.selectedId = this.selectedCourse;
            }
		});
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
        private courseDataService: CourseDataService) {
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