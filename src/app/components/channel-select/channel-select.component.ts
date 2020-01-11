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
	selector: 'app-channel-select',
	templateUrl: './channel-select.component.html',
	styleUrls: ['./channel-select.component.scss']
})
export class ChannelSelectComponent {
    @Output() private selectedIdEmitter = new EventEmitter<any>();
    @Input() isInvalid: boolean;
    @Input() selectedChannel = "";

    selectedId = '-1';

    data = [
        {
            key: "EMAIL",
            label: "Email"
        },
        {
            key: "PHONE",
            label: "Phone"
        },
        {
            key: "WEBSITE",
            label: "Website"
        },
        {
            key: "LINKEDIN",
            label: "LinkedIn"
        },
        {
            key: "FACEBOOK",
            label: "Facebook"
        },
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