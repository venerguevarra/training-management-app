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
	selectedCostingObject;
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
	}

	fetchCostingsData(courseScheduleId: string) {

		const GET_COSTINGS_ENDPOINT: string = `${this.API_HOST}/course-schedules/${courseScheduleId}/costings`;
		this.httpClient.get<any[]>(`${this.API_HOST}/course-schedules/${courseScheduleId}/costings`).subscribe(data => {
			this.costingsData = data['costings'];
		});
	}

	private sendCostingsUpdatedEvent() : void {
		this.eventService.emitter.emit({
			eventType: 'course-schedule-costings-updated'
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
						this.refresh();
						this.fetchCostingsData(this.courseScheduleId);
						this.toastr.success(`Cost successfully added.`, 'Success', { timeOut: 3000 });
						this.sendCostingsUpdatedEvent();
					}
				},
				(error) => {
					if(error.status == 409) {
						this.toastr.error('Cost already exist.', 'Failed request', { timeOut: 3000 });
					} else if(error.status === 400) {
						this.toastr.error('Invalid request received by the server.', 'Failed request', { timeOut: 3000 });
					} else {
						this.toastr.error('Internal server error.', 'Failed request', { timeOut: 3000 });
					}
				}
			);
	}

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
			courseScheduleId: [this.courseScheduleId, Validators.required],
			amount: ['', Validators.required],
			totalAmount: [''],
			multiplier: ['', Validators.required],
			comment: ['']
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['courseScheduleId'] && changes['courseScheduleId'].currentValue) {
			this.f.courseScheduleId.setValue(changes['courseScheduleId'].currentValue);
			this.fetchCostingsData(changes['courseScheduleId'].currentValue);
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
		} else {
			inputMultiplier = 1;
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

		this.referenceDataService.findById('costings', this.f.costId.value).then(e=>{
			let name = `${e.name}`;
			swal.fire({
				title: "Costings",
				text: `Add ${name} cost with the amount of ${this.f.totalAmount.value}?`,
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
		}).catch((err)=>{
			this.toastr.error('Failed to add cost.', 'Failed Request', { timeOut: 3000 });
		});
	}

	refresh() {
		this.costingForm = this.createFormGroup();

		this.submitted = false;
		this.f.costId.setValue("");
		this.f.amount.setValue("");
		this.f.totalAmount.setValue("");
		this.f.multiplier.setValue("");
		this.f.comment.setValue("");
		this.selectedCosting = null;
		this.selectedCostingObject = null;
		this.isCostingIdInvalid = false;
		this.eventService.emitter.emit({
			eventType: 'refresh-cost-select'
		});
	}

	removeCosting(courseCostId: any, costId: any) {
		this.referenceDataService.findById('costings', costId).then(e=>{
			let name = `${e.name}`;

			swal.fire({
				title: 'Confirmation',
				text: `Remove ${name} cost from the current course schedule?`,
				type: "question",
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Remove',
				allowOutsideClick: false
			}).then(e => {
				if(e.value) {
					this.referenceDataService.deleteById('course-costings', courseCostId).subscribe(e=> {
						this.refresh();
						this.sendCostingsUpdatedEvent();
						this.fetchCostingsData(this.courseScheduleId);
					});
				}
		});
		}).catch((err)=>{
			this.toastr.error('Failed to remove cost.', 'Failed Request', { timeOut: 3000 });
		});
	}

	getTotalCost(): number {
		let sum = 0;
		if(this.costingsData) {
			for (let i = 0; i < this.costingsData.length; i++) {
				sum += this.costingsData[i].totalAmount;
			}
		}

		return sum;
  	}

}