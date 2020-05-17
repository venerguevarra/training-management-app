import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute, RoutesRecognized } from "@angular/router";
import { filter, pairwise } from "rxjs/operators";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { catchError, tap, map, first } from "rxjs/operators";
import "rxjs/Rx";
import swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";

import { StateService } from "../../../../service/state.service";
import { ReferenceDataService } from '../../../../service/reference-data.service';
import { RoutingStateService } from "../../../../service/routing-state.service"
import { User } from "../../../../model/user.model";
import { environment } from "../../../../../environments/environment";
import { CustomValidator } from "../../../../validator/custom.validator";

@Component({
  selector: "app-registration-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"]
})
export class RegistrationDetailComponent {
  private readonly API_HOST = environment.API_HOST;
  private readonly ENDPOINT: string = `${this.API_HOST}/course-registrations`;
  private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
  private readonly ACCOUNT_ENDPOINT: string = `${this.API_HOST}/accounts`;
  private readonly CONTACT_ENDPOINT: string = `${this.API_HOST}/contacts`;
  private readonly COURSE_ENDPOINT: string = `${this.API_HOST}/courses`;
  private readonly LANDING_PAGE: string = "/app/registration";

  title = "Registration";
  currentUser;
  modelId;
  currentForm: FormGroup;
  submitted = false;
  currentModel;
  newForm = false;
  editForm = false;
  viewForm = false;

  createdBy = "";
  modifiedBy = "";

  accountId = "";
  accountName = "";

  contactLabel = {
    fullName: "",
    mobileNumber: "",
    email: ""
  };

  previousUrl: string;
  existingRegistrationScheduleStatus;
  currentRegistrationStatus;
  currentDealName;

  registeredParticipantList: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private stateService: StateService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private routingStateService: RoutingStateService,
    private referenceDataService: ReferenceDataService
  ) {
    this.previousUrl = this.routingStateService.getPreviousUrl();

    this.route.params.subscribe(params => {

      if (params["id"]) {

        this.modelId = params.id;
        this.newForm = this.modelId == -1;

        this.initForm();


        this.route.queryParams.subscribe(params => {
          if (params.action === "view") {
            this.viewForm = true;
          }
          if (params.action === "edit") {
            this.editForm = true;
          }
        });

        this.route.queryParams.subscribe(params => {
           if(params.accountId) {
              this.httpClient
                  .get(`${this.ACCOUNT_ENDPOINT}/${params.accountId}`)
                  .subscribe(account => {
                    this.accountName = account["name"];
                    this.accountId = account["id"];
                    this.f.accountId.setValue(this.accountId);
                  });
            }
        });

        if (this.viewForm || this.editForm) {
          this.httpClient.get(`${this.ENDPOINT}/${this.modelId}`).subscribe(
            data => {

              this.currentModel = data;

              if (this.currentModel.createdBy != null) {
                this.httpClient
                  .get(`${this.USERS_ENDPOINT}/${this.currentModel.createdBy}`)
                  .subscribe(
                    auditData => {
                      let firstName = auditData["userProfile"]["firstName"];
                      let lastName = auditData["userProfile"]["lastName"];
                      this.createdBy = `${firstName} ${lastName}`;
                    },
                    errorData => {
                      this.toastr.error("Error has occurred.", "Failed Request", {
                        timeOut: 3000
                      });
                    }
                  );
              }

              if (this.currentModel.modifiedBy != null) {
                this.httpClient
                  .get(`${this.USERS_ENDPOINT}/${this.currentModel.modifiedBy}`)
                  .subscribe(
                    auditData => {
                      let firstName = auditData["userProfile"]["firstName"];
                      let lastName = auditData["userProfile"]["lastName"];
                      this.modifiedBy = `${firstName} ${lastName}`;
                    },
                    errorData => {
                      this.toastr.error("Error has occurred.", "Failed Request", {
                        timeOut: 3000
                      });
                    }
                  );
              }

              this.currentForm = this.formBuilder.group({
                id: [this.currentModel.id, [Validators.required]],
                dealId: [this.currentModel.dealId, [Validators.required]],
                courseId: [this.currentModel.courseId, [Validators.required]],
                courseScheduleId: [this.currentModel.courseScheduleId, [Validators.required]],
                accountId: [this.currentModel.accountId, [Validators.required]],
                accountManager: [this.currentModel.accountManager, [Validators.required]],
                contactId: [this.currentModel.contactId, [Validators.required]],
                billingContactId: [this.currentModel.billingContactId, [Validators.required]],
                registrationCount: [this.currentModel.registrationCount, [Validators.required]],
                status: [this.currentModel.status],
                comment: [this.currentModel.comment],
                actualRegistrationCount: [this.currentModel.actualRegistrationCount]
              });

              this.currentRegistrationStatus = this.currentModel.status;
              this.selectedDealId = this.currentModel.dealId;

              this.selectedCourseId = this.currentModel.courseId;
              this.selectedScheduleId = this.currentModel.courseScheduleId;
              this.selectedContactId = this.currentModel.contactId;
              this.selectedBillingContactId = this.currentModel.billingContactId;

              this.getCourseSchedule(this.currentModel.courseScheduleId)
                  .then(data => {
                    this.existingRegistrationScheduleStatus = data['status'];
                  });

              this.getDeal(this.currentModel.dealId)
                  .then(data => {
                    this.currentDealName = data['name'];
                    if(data['stage'].startsWith('CLOSED_LOST') || data['stage'].startsWith('CANCELLED')) {
                      this.selectedCourseId = "";
                      this.f.courseId.setValue("");
                      this.f.dealId.setValue("");
                      this.f.registrationCount.setValue("");
                      this.selectedDeal = null;
                      this.selectedDealId = null;
                      this.isDealIdInvalid = true;
                    }
                  });

              this.getParticipants(this.currentModel.id).then(data => {
                this.registeredParticipantList = data['items'];
              });
            },
            error => {
              this.toastr.error("Error has occurred.", "Failed Request", {
                timeOut: 3000
              });
            }
          );
        }
      }
    });

  }


  private isControlValueValid(control) {
    return !(
      control.value == "" ||
      control.value == "undefined" ||
      control == null
    );
  }

  initForm() {
    this.currentForm = this.formBuilder.group({
      id: [""],
      dealId: ["", [Validators.required]],
      courseId: ["", [Validators.required]],
      courseScheduleId: ["", [Validators.required]],
      accountId: ["", [Validators.required]],
      accountManager: ["", [Validators.required]],
      contactId: ["", [Validators.required]],
      billingContactId: ["", [Validators.required]],
      registrationCount: ["", [Validators.required]],
      status: [""],
      comment: [""],
      actualRegistrationCount: [""]
    });

    this.currentUser = this.stateService.getCurrentUser();
    this.f.accountManager.setValue(this.currentUser.userId);
  }

  get f() {
    return this.currentForm.controls;
  }

  formControlInvalid(control: any) {
		return (control.value == "" || control.value == "undefined" || control == null);
	}

  update() {
    this.submitted = true;

    let hasError = false;

    if(this.currentRegistrationStatus != 'PENDING' && this.currentModel.courseScheduleId != this.selectedScheduleId) {
      this.toastr.error("Client already registered or confirmed to the schedule.", "Failed Request", { timeOut: 3000 } );
      return;
    }
    if (this.currentForm.invalid || hasError) {
      return;
    }

    swal
      .fire({
        text: `Update ${this.title}?`,
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Save",
        allowOutsideClick: false
      })
      .then(e => {
        if (e.value) {
          let requestBody = {
            dealId: this.currentForm.get("dealId").value,
            courseId: this.currentForm.get("courseId").value,
            courseScheduleId: this.currentForm.get("courseScheduleId").value,
            accountId: this.currentForm.get("accountId").value,
            accountManager: this.currentForm.get("accountManager").value,
            contactId: this.currentForm.get("contactId").value,
            billingContactId: this.currentForm.get("billingContactId").value,
            registrationCount: this.currentForm.get("registrationCount").value,
            status: this.currentForm.get("status").value,
            comment: this.currentForm.get("comment").value
          };

          let resourceId = this.currentForm.get("id").value;

          this.httpClient
            .put(`${this.ENDPOINT}/${resourceId}`, requestBody, {
              observe: "response"
            })
            .subscribe(
              data => {
                if (data.status == 200) {
                  this.toastr.success(
                    `${this.title} successfully updated.`,
                    "System",
                    { timeOut: 3000 }
                  );

                  this.router.navigate(["/app/sales/account", this.accountId], {
                    queryParams: { action: "view" }
                  });
                }
              },
              error => {
                if (error.status === 409) {
                  this.toastr.error(
                    "Email or mobile number already exist.",
                    "Failed Request",
                    { timeOut: 3000 }
                  );
                } else if (error.status === 400) {
                  this.toastr.error(
                    "Invalid request received by the server.",
                    "Failed Request",
                    { timeOut: 3000 }
                  );
                } else {
                  this.toastr.error("Internal server error.", "Failed Request", {
                    timeOut: 3000
                  });
                }
              }
            );
        }
      });
  }

  sendRegistrationEmail() {
    swal.fire({
				title: "Send Registration Email",
				text: `Click send button to proceed.`,
				type: "info",
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Send',
				allowOutsideClick: false
			}).then(e => {
				if(e.value) {
					this.referenceDataService.sendRegistrationEmail(this.modelId).subscribe(data=>{
            this.toastr.success(`Success sent registration email to ${this.accountName}.`, "System", { timeOut: 3000 });
            this.router.navigate(["/app/sales/account", this.accountId], {
              queryParams: { action: "view" }
            });
          },
          error => {
            this.toastr.error("Failed to sent registration email.", "Failed Request", { timeOut: 3000 });
          });
				}
			});
  }

  showEditForm() {
    this.newForm = false;
    this.viewForm = false;
    this.editForm = true;
  }

  saveNew() {
    this.submitted = true;
    let hasError = false;

    if (this.formControlInvalid(this.f.dealId)) {
			this.isDealIdInvalid = true;
      this.selectedDealId = "";
			hasError = true;
		} else {
			this.isDealIdInvalid = false;
			hasError = false;
		}

    if (this.currentForm.invalid || hasError) {
      return;
    }

    swal
      .fire({
        text: `Save new ${this.title}?`,
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Save",
        allowOutsideClick: false
      })
      .then(e => {
        if (e.value) {

          let requestBody = {
            dealId: this.currentForm.get("dealId").value,
            courseId: this.currentForm.get("courseId").value,
            courseScheduleId: this.currentForm.get("courseScheduleId").value,
            accountId: this.currentForm.get("accountId").value,
            accountManager: this.currentForm.get("accountManager").value,
            contactId: this.currentForm.get("contactId").value,
            billingContactId: this.currentForm.get("billingContactId").value,
            registrationCount: this.currentForm.get("registrationCount").value,
            status: 'PENDING',
            comment: this.currentForm.get("comment").value
          };

          this.httpClient
            .post(this.ENDPOINT, requestBody, { observe: "response" })
            .subscribe(
              data => {
                if (data.status == 201) {
                  this.toastr.success( `New ${this.title} successfully saved.`, "Success", { timeOut: 3000 });
                  this.router.navigate(["/app/sales/account", this.accountId], {
                    queryParams: { action: "view" }
                  });
                }
              },
              error => {
                if (error.status === 409) {
                  this.toastr.error("Existing registation exist for the deal.", "Failed Request", {timeOut: 3000});
                } else if (error.status === 400) {
                  this.toastr.error( "Invalid request received by the server.", "Failed Request", { timeOut: 3000 });
                } else {
                  this.toastr.error("Internal server error.", "Failed Request", { timeOut: 3000 });
                }
              }
            );
        }
      });
  }

  cancel() {
    this.router.navigateByUrl(this.previousUrl);
  }

  isInvalid(control: any) {
    return (
      (control.dirty || control.touched || this.submitted) &&
      control.invalid &&
      control.errors.required
    );
  }

  onScheduleLoaded($event) {
    if($event && $event == 'no_schedules_found') {
      //this.toastr.success( `No schedule found`, "Course Schedule", { timeOut: 3000 });
    }
  }

  getCourseSchedule(courseScheduleId:string) {
		let promise = new Promise((resolve, reject) => {
			let endpoint = `${this.API_HOST}/course-schedules/${courseScheduleId}`;
			this.httpClient.get(endpoint)
			.toPromise()
			.then(
				res => {
					resolve(res);
				},
				msg => {
					reject(msg);
				}
			);
		});

		return promise;
	}

  getDeal(dealId:string) {
		let promise = new Promise((resolve, reject) => {
			let endpoint = `${this.API_HOST}/deals/${dealId}`;
			this.httpClient.get(endpoint)
			.toPromise()
			.then(
				res => {
					resolve(res);
				},
				msg => {
					reject(msg);
				}
			);
		});

		return promise;
	}

  getParticipants(courseRegistrationId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
    const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/find-participants/${courseRegistrationId}`;

    this.httpClient
      .get<any[]>(ACTIVE_ENDPOINT, {})
      .toPromise()
      .then(
        res => {
          resolve(res);
        },
        msg => {
          reject(msg);
        }
      );
    });

    return promise;
	}

  deliverRegistration() {
    swal
      .fire({
        text: `Change registration status to DELIVERED?`,
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Submit",
        allowOutsideClick: false
      })
      .then(e => {
        if(e.value) {
          this.submitDeliverRegistration(this.modelId).then(data => {
            this.toastr.success("Course registration status updated.", "Success", { timeOut: 3000 });
            this.router.navigate(["/app/sales/account", this.accountId], {
              queryParams: { action: "view" }
            });
          }).catch(err => {
            this.toastr.error("Failed to update course registration status.", "Failed request", { timeOut: 3000 });
          })
        }
      });
  }


  submitDeliverRegistration(courseRegistrationId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
    const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/deliver/${courseRegistrationId}`;

    this.httpClient
      .post<any[]>(ACTIVE_ENDPOINT, {})
      .toPromise()
      .then(
        res => {
          resolve(res);
        },
        msg => {
          reject(msg);
        }
      );
    });

    return promise;
	}

  undeliverRegistration() {
    swal
      .fire({
        text: `Change registration status to UNDELIVERED?`,
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Submit",
        allowOutsideClick: false
      })
      .then(e => {
        if(e.value) {
          this.submitUndeliverRegistration(this.modelId).then(data => {
            this.toastr.success("Course registration status updated.", "Success", { timeOut: 3000 });
            this.router.navigate(["/app/sales/account", this.accountId], {
              queryParams: { action: "view" }
            });
          }).catch(err => {
            this.toastr.error("Failed to update course registration status.", "Failed request", { timeOut: 3000 });
          })
        }
      });
  }

  submitUndeliverRegistration(courseRegistrationId: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
    const ACTIVE_ENDPOINT: string = `${this.API_HOST}/course-registrations/actions/deliver/${courseRegistrationId}`;

    this.httpClient
      .post<any[]>(ACTIVE_ENDPOINT, {})
      .toPromise()
      .then(
        res => {
          resolve(res);
        },
        msg => {
          reject(msg);
        }
      );
    });

    return promise;
	}

  isDealIdInvalid = false;
  selectedDeal;
  selectedDealId;
  selectedCourseId;
  public onDealSelected(deal: any) {
		if (deal) {
      this.selectedCourseId = deal.data.courseId;
      this.f.courseId.setValue(deal.data.courseId);
      this.f.dealId.setValue(deal.id);
      this.f.registrationCount.setValue(deal.data.numberOfParticipants);
      this.selectedDeal = deal;
      this.selectedDealId = deal.id;
			this.isDealIdInvalid = false;
		} else {
      this.selectedCourseId = "";
      this.f.courseId.setValue("");
      this.f.dealId.setValue("");
      this.f.registrationCount.setValue("");
      this.selectedDeal = null;
      this.selectedDealId = null;
			this.isDealIdInvalid = true;
		}
  }

  isContactIdInvalid;
  selectedContact;
  selectedContactId;
  public onContactSelected(contact: any) {
    if (contact) {
      this.selectedContactId = contact.id;
      this.selectedContact = contact;
      this.f.contactId.setValue(contact.id);
      this.isContactIdInvalid = false;
    } else {
      this.selectedContactId = null;
      this.selectedContact = null;
      this.isContactIdInvalid = true;
      this.f.contactId.setValue("");
    }
  }

  isScheduleIdValid = false;

  selectedSchedule;
  selectedScheduleId;
  public onCourseScheduleSelected(schedule: any) {
    if (schedule) {
      this.selectedScheduleId = schedule.id;
      this.selectedSchedule = schedule;
      this.f.courseScheduleId.setValue(schedule.id);
      this.isScheduleIdValid = false;
    } else {
      this.selectedScheduleId = null;
      this.selectedSchedule = null;
      this.isScheduleIdValid = true;
      this.f.courseScheduleId.setValue("");
    }
  }

  isBillingContactIdInvalid;
  selectedBillingContact;
  selectedBillingContactId;
  public onBillingContactSelected(contact: any) {
    if (contact) {
      this.selectedBillingContactId = contact.id;
      this.selectedBillingContact = contact;
      this.f.billingContactId.setValue(contact.id);
      this.isBillingContactIdInvalid = false;
    } else {
      this.selectedBillingContactId = null;
      this.selectedBillingContact = null;
      this.isBillingContactIdInvalid = true;
      this.f.billingContactId.setValue("");
    }
  }
}
