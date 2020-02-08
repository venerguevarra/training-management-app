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

@Component({
	selector: 'app-inquiry-status-select',
	templateUrl: './inquiry-status-select.component.html',
	styleUrls: ['./inquiry-status-select.component.scss']
})
export class InquiryStatusSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();
    @Input() isInvalid: boolean;
    @Input() selectedValue = "";
    @Input() customData: any[];

    selectedId = '-1';

    data = [
        {
            key: "NEW",
            label: "NEW"
        },
        {
            key: "ASSIGNED",
            label: "ASSIGNED"
        },
        {
            key: "ATTEMPTED_TO_CONTACT",
            label: "ATTEMPTED TO CONTACT"
        },
        {
            key: "CONTACTED",
            label: "CONTACTED"
        },
        {
            key: "SALES_UNQUALIFIED",
            label: "SALES UNQUALIFIED"
        },
        {
            key: "SALES_QUALIFIED",
            label: "QUALIFIED"
        },
        {
            key: "DEAL",
            label: "DEAL"
        },
        {
            key: "CLOSED",
            label: "CLOSED"
        }
    ];


    onChange($event) {
        if($event) {
            this.selectedValue = $event.key;
            this.selectedIdEmitter.emit($event.key);
        }
    }

    ngOnInit() {
        if(this.customData) {
            this.data = this.customData;
        }
    }
    onClear($event) {
        if($event) {
            this.selectedValue = $event.key;
            this.selectedIdEmitter.emit($event.key);
        } else {
            this.selectedIdEmitter.emit('');
        }
    }

}