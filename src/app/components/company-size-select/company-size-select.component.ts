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

@Component({
	selector: 'app-company-size-select',
	templateUrl: './company-size-select.component.html',
	styleUrls: ['./company-size-select.component.scss']
})
export class CompanySizeSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();
    @Input() isInvalid: boolean;
    @Input() selectedValue = "";

    selectedId = '-1';

    data = [
        {
            key: "A",
            label: "Self-employed"
        },
        {
            key: "B",
            label: "1-10 employees"
        },
        {
            key: "C",
            label: "11-50 employees"
        },
        {
            key: "D",
            label: "51-200 employees"
        },
        {
            key: "E",
            label: "201-500 employees"
        },
        {
            key: "F",
            label: "501-1,000 employees"
        },
        {
            key: "G",
            label: "1,001-5,000 employees"
        },
        {
            key: "H",
            label: "5,001-10,001 employees"
        },
        {
            key: "I",
            label: "10,000+ employees"
        }
    ];

    onChange($event) {
        if($event) {
            this.selectedId = $event.key;
            this.selectedIdEmitter.emit($event.key);
        }
    }

    onClear($event) {
        if($event) {
            this.selectedId = $event.key;
            this.selectedIdEmitter.emit($event.key);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

}