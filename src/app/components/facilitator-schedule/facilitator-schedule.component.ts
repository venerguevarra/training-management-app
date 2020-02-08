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
import { CustomValidator } from '../../validator/custom.validator';

let facilitatorSchedule = {
	facilitatorId: '',
	courseId: '',
	courseScheduleId: '',
	rate: 0,
	numberOfDay: 0,
	totalProfessionalFee: 0,
	startDate: '',
	endDate: ''
}
@Component({
	selector: 'app-facilitator-schedule',
	templateUrl: './facilitator-schedule.component.html',
	styleUrls: ['./facilitator-schedule.component.scss']
})
export class FacilitatorScheduleComponent {

	private readonly API_HOST = environment.API_HOST;
  	private readonly ENDPOINT: string = `${this.API_HOST}/course-schedule-facilitators`;

    @Input() courseScheduleId: string;
    @Input() courseId: string;
    @Input() startDate: string;
    @Input() endDate: string;
	@Input() numberOfDays: number;
	@Input() course;

	submitted: boolean = false;
	isFacilitatorIdInvalid: boolean = false;
	selectedFacilitator = "";
	selectedFacilitatorObject;

	facilitatorScheduleForm: FormGroup;
	assignedFacilitators: any[];
	constructor(
		private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private referenceDataService: ReferenceDataService,
		private eventService: EventService,
		private toastr: ToastrService
    ) {
		this.facilitatorScheduleForm = this.createFacilitatorScheduleFormGroup();

		this.eventService.emitter.subscribe((data) => {
			if(data.eventType === 'course-schedule-updated') {
				this.updateFacilitatorScheduleTable();
			}
		});
	}

	getFacilitatorCost(): number {
		let sum = 0;
		if(this.assignedFacilitators) {
			for (let i = 0; i < this.assignedFacilitators.length; i++) {
			sum += this.assignedFacilitators[i].totalProfessionalFee;
			}
		}

		return sum;
  	}

	get f() { return this.facilitatorScheduleForm.controls; }

	isInvalid(control:any) {
		return (control.dirty || control.touched || this.submitted) && control.invalid && control.errors.required;
	}

	public onFacilitatorSelected(facilitator: any) {
		if (facilitator) {
			this.f.facilitatorId.setValue(facilitator.id);
			this.f.rate.setValue(facilitator.dailyRate);
			let professionalFee = parseFloat(this.f.rate.value) * parseInt(this.f.days.value);
			this.f.professionalFee.setValue(professionalFee);
			this.isFacilitatorIdInvalid = false;
			this.selectedFacilitatorObject = facilitator;
		} else {
			this.isFacilitatorIdInvalid = true;
			this.f.facilitatorId.setValue("");
			this.f.professionalFee.setValue("");
			this.f.rate.setValue(0);
			this.selectedFacilitatorObject = null;
		}
  	}

	createFacilitatorScheduleFormGroup(): FormGroup {
		return this.formBuilder.group({
			facilitatorId: ['', Validators.required],
      		courseId: ['', Validators.required],
			courseScheduleId: ['', Validators.required],
			rate: ['', [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]],
			days: [this.numberOfDays, [Validators.required]],
			startDate: [this.startDate, Validators.required],
			endDate: [this.endDate, [Validators.required]],
			professionalFee: ['', [Validators.required, CustomValidator.positiveNumberValidator.bind(this)]]
		});
	}

	ngOnChanges(changes: SimpleChanges) {
        if (changes['numberOfDays'] && changes['numberOfDays'].currentValue) {
			this.f.days.setValue(changes['numberOfDays'].currentValue);
			if(!this.isFacilitatorIdInvalid) {
				let professionalFee = parseFloat(this.f.rate.value) * parseInt(this.f.days.value);
				this.f.professionalFee.setValue(professionalFee);
			}
        }

		if (changes['startDate'] && changes['startDate'].currentValue) {
			this.f.startDate.setValue(changes['startDate'].currentValue);
        }

		if (changes['course'] && changes['course'].currentValue) {
			this.course = changes['course'].currentValue;
        }

		if (changes['endDate'] && changes['endDate'].currentValue) {
			this.f.endDate.setValue(changes['endDate'].currentValue);
        }

		if (changes['courseId'] && changes['courseId'].currentValue) {
			this.f.courseId.setValue(changes['courseId'].currentValue);
        }

		if (changes['courseScheduleId'] && changes['courseScheduleId'].currentValue) {
			this.f.courseScheduleId.setValue(changes['courseScheduleId'].currentValue);

			const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-schedule-facilitators/actions/facilitator-schedule/${changes['courseScheduleId'].currentValue}`;

        	this.httpClient.get<any[]>(ACTIVE_ENDPOINT).subscribe(data => {
				this.assignedFacilitators = data['items'];
			});;
        }
    }

	private sendCostingsUpdatedEvent() : void {
		this.eventService.emitter.emit({
			eventType: 'course-schedule-costings-updated'
		});
	}

	save() {
		this.submitted = true;
		let hasError = false;

		if (this.formControlInvalid(this.f.facilitatorId)) {
			this.isFacilitatorIdInvalid = true;
			hasError = true;
		} else {
			this.isFacilitatorIdInvalid = false;
			hasError = false;
		}

        if (this.facilitatorScheduleForm.invalid || hasError) {
            return;
        }

		swal.fire({
			title: "Facilitator Assignment",
			text: `Assign ${this.selectedFacilitatorObject.firstName} ${this.selectedFacilitatorObject.lastName}?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Save',
			allowOutsideClick: false
		}).then(e => {
			if(e.value) {
				let requestBody = {
					facilitatorId: this.facilitatorScheduleForm.get('facilitatorId').value,
					courseId: this.facilitatorScheduleForm.get('courseId').value,
					courseScheduleId: this.facilitatorScheduleForm.get('courseScheduleId').value,
					rate: this.facilitatorScheduleForm.get('rate').value,
					numberOfDays: this.facilitatorScheduleForm.get('days').value,
					totalProfessionalFee: this.facilitatorScheduleForm.get('professionalFee').value,
					startDate: this.facilitatorScheduleForm.get('startDate').value,
					endDate: this.facilitatorScheduleForm.get('endDate').value
				};

				this.httpClient
						.post(this.ENDPOINT, requestBody, { observe: 'response' })
						.subscribe(
							(data) => {
								if(data.status == 201) {
									this.toastr.success(`Facilitator successfully assigned.`, 'Success', { timeOut: 3000 });
									this.refresh();
									this.sendCostingsUpdatedEvent();

									if(this.facilitatorScheduleForm.get('courseScheduleId').value) {
										this.updateFacilitatorScheduleTable();
									}
								}
							},
							(error) => {
								if(error.status === 409) {
									let errorMessage = '';

									if(error.error.status === 'facilitator_conflict') {
										errorMessage =  `There is already an existing schedule. <br/> ${this.f.startDate.value} - ${this.f.endDate.value}`;
									} else if(error.error.status === 'facilitator_already_assigned') {
										errorMessage =  `Facilitator already assigned to the current schedule:<br/> ${this.f.startDate.value} - ${this.f.endDate.value}`;
									}

									swal.fire({
										html: errorMessage,
										type: "error",
										title: "Facilitator Schedule Conflict",
										showCancelButton: false,
										confirmButtonColor: '#3085d6',
										cancelButtonColor: '#d33',
										confirmButtonText: 'OK',
										allowOutsideClick: false
									});
								} else if(error.status === 400) {
									this.toastr.error('Invalid request received by the server.', 'Failed Request', { timeOut: 3000 });
								} else {
									this.toastr.error('Internal server error.', 'Failed Request', { timeOut: 3000 });
								}
							}
						);
			}
		});
	}

	updateFacilitatorScheduleTable() : void {
		const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-schedule-facilitators/actions/facilitator-schedule/${this.facilitatorScheduleForm.get('courseScheduleId').value}`;

		this.httpClient.get<any[]>(ACTIVE_ENDPOINT).subscribe(data => {
			this.assignedFacilitators = data['items'];
		});;
	}

	refresh() {
		this.submitted = false;

		this.f.facilitatorId.setValue("");
		this.f.rate.setValue("");
		this.f.professionalFee.setValue("");
		this.f.facilitatorId.setValue("");
		this.selectedFacilitator = null;
		this.isFacilitatorIdInvalid = false;
		this.eventService.emitter.emit({
			eventType: 'refresh-facilitator-select'
		});

		this.facilitatorScheduleForm = this.createFacilitatorScheduleFormGroup();
		this.f.courseScheduleId.setValue(this.courseScheduleId);
		this.f.courseId.setValue(this.courseId);
	}

	formControlInvalid(control: any) {
		return (control.value == "" || control.value == "undefined" || control == null);
	}

	removeFacilitator(id: any, facilitatorId: any) {
		this.referenceDataService.findById('facilitators', facilitatorId).then(e=>{
			let fullName = `${e.firstName} ${e.lastName}`;

			swal.fire({
				title: 'Confirmation',
				text: `Remove ${fullName} from the current course schedule?`,
				type: "question",
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Remove',
				allowOutsideClick: false
			}).then(e => {
				if(e.value) {
					this.referenceDataService.deleteById('course-schedule-facilitators', id).subscribe(e => {
						this.sendCostingsUpdatedEvent();
						if(this.facilitatorScheduleForm.get('courseScheduleId').value) {
							const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-schedule-facilitators/actions/facilitator-schedule/${this.facilitatorScheduleForm.get('courseScheduleId').value}`;

							this.httpClient.get<any[]>(ACTIVE_ENDPOINT).subscribe(data => {
								this.assignedFacilitators = data['items'];
							}, error=>{
								this.toastr.error('Failed to remove facilitator.', 'Failed Request', { timeOut: 3000 });
							});
						}
					}, error => {
						this.toastr.error('Failed to remove facilitator.', 'Failed Request', { timeOut: 3000 });
					});
				}
		});
		}).catch((err)=>{
			this.toastr.error('Failed to remove facilitator.', 'Failed Request', { timeOut: 3000 });
		});
	}

	updateProfessionalFee() {
		let newRate = this.facilitatorScheduleForm.get('days').value * this.facilitatorScheduleForm.get('rate').value;
		this.f.professionalFee.setValue(newRate);
	}

}