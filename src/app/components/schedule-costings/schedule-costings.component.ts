import { Component, SimpleChanges, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, first } from 'rxjs/operators';
import 'rxjs/Rx';
import swal from 'sweetalert2';
import {NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../environments/environment';
import { ReferenceDataService } from '../../service/reference-data.service';
import { EventService } from '../../service/event.service';

@Component({
	selector: 'app-schedule-costings',
	templateUrl: './schedule-costings.component.html',
	styleUrls: ['./schedule-costings.component.scss']
})
export class SchedulingCostingsComponent {

	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/course-schedules`;

    @Input() courseScheduleId: string;

	costingForm: FormGroup;
	costingsData: any[];
	submitted: boolean = false;

	selectedCosting;
	isCostingIdInvalid: boolean = false;

	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private referenceDataService: ReferenceDataService,
		private eventService: EventService,
		private toastr: ToastrService
    ) {
		this.costingForm = this.createFormGroup();
		this.fetchCostingsData();
	}

	fetchCostingsData() {
		const GET_COSTINGS_ENDPOINT: string = `${this.API_HOST}/course-schedules/${this.courseScheduleId}/costings`;

		this.httpClient.get<any[]>(GET_COSTINGS_ENDPOINT).subscribe(data => {
			this.costingsData = data['items'];
		});
	}

	postCostingsData() {
		const POST_COSTINGS_ENDPOINT: string = `${this.API_HOST}/course-schedules/${this.courseScheduleId}/costings`;

		let requestBody = {costings: [{
			costId: this.costingForm.get('costId').value,
			courseScheduleId: this.costingForm.get('courseScheduleId').value,
			amount: this.costingForm.get('amount').value,
			multiplier: this.costingForm.get('multiplier').value,
			comment: this.costingForm.get('comment').value
		}]};

		this.httpClient
			.post(POST_COSTINGS_ENDPOINT, requestBody, { observe: 'response' })
			.subscribe(
				(data) => {
					if(data.status == 201) {
						this.toastr.success(`Cost successfully assigned.`, 'Success', { timeOut: 3000 });
						this.refresh();

						if(this.costingForm.get('courseScheduleId').value) {
							this.fetchCostingsData();
						}
					}
				},
				(error) => {
					if(error.status === 400) {
						this.toastr.error('Invalid request received by the server.', 'Invalid Request', { timeOut: 3000 });
					} else {
						this.toastr.error('Internal server error.', 'System', { timeOut: 3000 });
					}
				}
			);
	}

	selectedCostingObject;
	onCostingSelected($event): void {
		if ($event) {
			this.selectedCostingObject = $event;
			this.f.costId.setValue($event.id);
			this.isCostingIdInvalid = false;
		} else {
			this.isCostingIdInvalid = true;
			this.f.costId.setValue("");
			this.selectedCostingObject = null;
		}
	}

	get f() { return this.costingForm.controls; }

	isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}

	formControlInvalid(control: any) {
		return (control.value == "" || control.value == "undefined" || control == null);
	}

	createFormGroup(): FormGroup {
		return this.formBuilder.group({
			costId: ['', Validators.required],
			courseScheduleId: ['', Validators.required],
			amount: ['', Validators.required],
			totalAmount: [''],
			multiplier: ['1'],
			comment: ['']
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['courseScheduleId'] && changes['courseScheduleId'].currentValue) {
			this.f.courseScheduleId.setValue(changes['courseScheduleId'].currentValue);
			this.fetchCostingsData();
        }
    }

	calculateTotalAmount() {
		let inputAmount = 0;
		if(this.costingForm.get("amount").value) {
			inputAmount = parseFloat(this.costingForm.get("amount").value);
		}

		let inputMultiplier = 0;
		if(this.costingForm.get("multiplier").value) {
			inputMultiplier = parseFloat(this.costingForm.get("multiplier").value);
		}

		let totalAmount = inputAmount * inputMultiplier;
		this.f.totalAmount.setValue(totalAmount);
	}

	save() {
		this.submitted = true;
		let hasError = false;

		if (this.formControlInvalid(this.f.costId)) {
			this.isCostingIdInvalid = true;
			hasError = true;
		} else {
			this.isCostingIdInvalid = false;
			hasError = false;
		}

        if (this.costingForm.invalid || hasError) {
            return;
        }


		swal.fire({
			title: "Facilitator Assignment",
			text: `Assign?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				this.postCostingsData();
			}
		});
	}

	refresh() {
		this.submitted = false;
		this.f.costId.setValue("");
		this.selectedCosting = null;
		this.selectedCostingObject = null;
		this.isCostingIdInvalid = false;
		this.eventService.emitter.emit({
			eventType: 'refresh-cost-select'
		});
	}

	removeCosting(facilitatorId: any) {
	}

}