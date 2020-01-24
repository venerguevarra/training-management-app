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
import { RoutingStateService } from "../../../../service/routing-state.service"
import { User } from "../../../../model/user.model";
import { environment } from "../../../../../environments/environment";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-contact-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"]
})
export class DealDetailComponent {
  private readonly API_HOST = environment.API_HOST;
  private readonly ENDPOINT: string = `${this.API_HOST}/deals`;
  private readonly CHANGE_DEAL_STAGEENDPOINT: string = `${this.API_HOST}/deals/actions/change-stage`;
  private readonly USERS_ENDPOINT: string = `${this.API_HOST}/users`;
  private readonly ACCOUNT_ENDPOINT: string = `${this.API_HOST}/accounts`;
  private readonly CONTACT_ENDPOINT: string = `${this.API_HOST}/contacts`;
  private readonly COURSE_ENDPOINT: string = `${this.API_HOST}/courses`;
  private readonly LANDING_PAGE: string = "/app/deal";

  title = "Deal";
  currentUser;
  modelId;
  currentForm: FormGroup;
  submitted = false;
  currentModel;
  newForm = false;
  editForm = false;
  viewForm = false;
  accountId;

  createdBy = "";
  modifiedBy = "";

  isRecordActive: boolean = false;
  parentAccountId: string = "";
  accountName = "";
  accountNameLabel = "";
  contactLabel = {
    fullName: "",
    mobileNumber: "",
    email: ""
  };
  courseLabel = "";

  isCourseIdInvalid = false;
  isContactIdInvalid = false;
  selectedCourse: string;
  selectedContact: string;
  selectedInquiry: string;
  previousUrl: string;

  constructor(
    private httpClient: HttpClient,
    private stateService: StateService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private routingStateService: RoutingStateService,
    private spinner: NgxSpinnerService
  ) {


    this.previousUrl = this.routingStateService.getPreviousUrl();

    this.route.params.subscribe(params => {
      this.parentAccountId = this.route.snapshot.queryParamMap.get("accountId");

      if (params["id"]) {
        this.modelId = params.id;
        this.newForm = this.modelId == -1;

        this.initForm();

        if (!this.newForm) {
          this.route.queryParams.subscribe(params => {
            if (params.action === "view") {
              this.viewForm = true;
            }
            if (params.action === "edit") {
              this.editForm = true;
            }
          });
        } else {
          this.f.stage.setValue("PROPOSAL");
        }

        this.route.queryParams.subscribe(params => {
           this.httpClient
                .get(`${this.ACCOUNT_ENDPOINT}/${params.accountId}`)
                .subscribe(account => {
                  this.accountName = account["name"];
                  this.accountId = account["id"];
                });
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

              if (this.currentModel.accountId != null) {
                this.httpClient
                  .get(
                    `${this.ACCOUNT_ENDPOINT}/${this.currentModel.accountId}`
                  )
                  .subscribe(
                    data => {
                      this.accountNameLabel = data["name"];
                      this.accountId = data["id"];
                    },
                    errorData => {
                      this.toastr.error("Error has occurred.", "Failed Request", {
                        timeOut: 3000
                      });
                    }
                  );
              }

              if (this.currentModel.accountId != null) {
                this.httpClient
                  .get(
                    `${this.CONTACT_ENDPOINT}/${this.currentModel.contactId}`
                  )
                  .subscribe(
                    data => {
                      this.contactLabel.fullName = `${data["firstName"]}, ${data["lastName"]}`;
                      this.contactLabel.mobileNumber = `${data["mobileNumber"]}`;
                      this.contactLabel.email = `${data["email"]}`;
                    },
                    errorData => {
                      this.toastr.error("Error has occurred.", "Failed Request", {
                        timeOut: 3000
                      });
                    }
                  );
              }

              if (this.currentModel.courseId != null) {
                this.httpClient
                  .get(`${this.COURSE_ENDPOINT}/${this.currentModel.courseId}`)
                  .subscribe(
                    data => {
                      this.courseLabel = `${data["name"]}`;
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
                name: [this.currentModel.name, [Validators.required]],
                description: [this.currentModel.description],
                accountManager: [
                  this.currentModel.accountManager,
                  [Validators.required]
                ],
                stage: [this.currentModel.stage, [Validators.required]],
                vatRegistration: [this.currentModel.vatRegistration],
                type: [this.currentModel.type, [Validators.required]],
                totalDealAmount: [
                  this.currentModel.totalDealAmount,
                  [Validators.required]
                ],
                courseFee: [this.currentModel.courseFee, [Validators.required]],
                numberOfParticipants: [
                  this.currentModel.numberOfParticipants,
                  [Validators.required]
                ],
                accountId: [this.currentModel.accountId, [Validators.required]],
                contactId: [this.currentModel.contactId, [Validators.required]],
                courseId: [this.currentModel.courseId, [Validators.required]],
                createdDate: [this.currentModel.createdDate],
                createdBy: [this.currentModel.createdBy],
                modifiedDate: [this.currentModel.modifiedDate],
                modifiedBy: [this.currentModel.modifiedBy],
                status: [this.currentModel.active]
              });

              this.isRecordActive = this.currentModel.active === "ACTIVE";
              this.selectedContact = this.currentModel["contactId"];
              this.selectedCourse = this.currentModel["courseId"];
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

  calculateTotalDealAmount() {
    if (
      this.isControlValueValid(this.f.numberOfParticipants) &&
      this.isControlValueValid(this.f.courseFee)
    ) {
      this.f.totalDealAmount.setValue(
        parseFloat(this.f.courseFee.value) *
          parseInt(this.f.numberOfParticipants.value)
      );
    } else {
      this.f.totalDealAmount.setValue("");
    }
  }

  private isControlValueValid(control) {
    return !(
      control.value == "" ||
      control.value == "undefined" ||
      control == null
    );
  }

  public onCourseSelected(course: any) {
    if (course) {
      this.f.courseId.setValue(course.id);
      this.f.courseFee.setValue(course.courseFee);
      this.isCourseIdInvalid = false;
      this.calculateTotalDealAmount();
    } else {
      this.isCourseIdInvalid = true;
      this.f.courseId.setValue("");
    }
  }

  public onContactSelected(contact: any) {
    if (contact) {
      this.f.contactId.setValue(contact.id);
      this.isContactIdInvalid = false;
    } else {
      this.isContactIdInvalid = true;
      this.f.contactId.setValue("");
    }
  }

  initForm() {
    this.currentForm = this.formBuilder.group({
      id: [""],
      name: ["", [Validators.required]],
      description: [""],
      accountManager: ["", [Validators.required]],
      stage: ["", [Validators.required]],
      vatRegistration: [""],
      type: ["", [Validators.required]],
      totalDealAmount: ["", [Validators.required]],
      courseFee: ["", [Validators.required]],
      numberOfParticipants: ["", [Validators.required]],
      accountId: ["", [Validators.required]],
      contactId: ["", [Validators.required]],
      courseId: ["", [Validators.required]],
      status: [""]
    });

    this.f.accountManager.setValue(this.stateService.getCurrentUser().userId);
    this.f.accountId.setValue(this.parentAccountId);
  }

  get f() {
    return this.currentForm.controls;
  }

  ngAfterViewInit() {
    this.currentUser = this.stateService.getCurrentUser();
  }

  updateDealStage() {
    if (this.f.stage && this.f.stage.value) {
      let selecetedDealStage = this.f.stage.value.replace(/_/g, " ");

      swal
        .fire({
          title: "Udpate Deal Stage",
          text: `Update ${this.accountName} deal stage to ${selecetedDealStage}?`,
          type: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Save",
          allowOutsideClick: false
        })
        .then(e => {
          console.log(e);
          if(e && e.value) {
            let resourceId = this.currentForm.get("id").value;
			      let dealStage = this.f.stage.value;
            this.httpClient
                .post(`${this.CHANGE_DEAL_STAGEENDPOINT}/${resourceId}?stage=${dealStage}`, {}, { observe: "response" })
                .subscribe(
                  data => {
                    if (data.status == 200) {
                    this.toastr.success(
                      `${this.accountName} deal stage successfully updated.`,
                      "Success",
                      { timeOut: 3000 }
                    );
                    }

                  },
                  error => {
                    this.toastr.error(
                      `Failed to update ${this.accountName} deal stage`,
                      "Failed Request",
                      { timeOut: 3000 }
                    );

                  }
              );
            }
        });
    }
  }

  update() {
    this.submitted = true;

    this.currentForm.controls["stage"].markAsTouched();
    this.currentForm.controls["type"].markAsTouched();

    let hasError = false;
    if (
      this.f.courseId.value == "" ||
      this.f.courseId.value == "undefined" ||
      this.f.courseId == null
    ) {
      this.isCourseIdInvalid = true;
      hasError = true;
    } else {
      this.isCourseIdInvalid = false;
      hasError = false;
    }

    if (
      this.f.contactId.value == "" ||
      this.f.contactId.value == "undefined" ||
      this.f.contactId == null
    ) {
      this.isContactIdInvalid = true;
      hasError = true;
    } else {
      this.isContactIdInvalid = false;
      hasError = false;
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
            name: this.currentForm.get("name").value,
            description: this.currentForm.get("description").value,
            accountManager: this.currentForm.get("accountManager").value,
            stage: this.currentForm.get("stage").value,
            vatRegistration: this.currentForm.get("vatRegistration").value,
            type: this.currentForm.get("type").value,
            totalDealAmount: this.currentForm.get("totalDealAmount").value,
            courseFee: this.currentForm.get("courseFee").value,
            numberOfParticipants: this.currentForm.get("numberOfParticipants")
              .value,
            accountId: this.currentForm.get("accountId").value,
            contactId: this.currentForm.get("contactId").value,
            courseId: this.currentForm.get("courseId").value,
            active: this.currentForm.get("status").value
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

  showEditForm() {
    this.newForm = false;
    this.editForm = true;
    this.viewForm = false;
  }

  saveNew() {
    this.submitted = true;

    this.currentForm.controls["stage"].markAsTouched();
    this.currentForm.controls["type"].markAsTouched();

    let hasError = false;
    if (
      this.f.courseId.value == "" ||
      this.f.courseId.value == "undefined" ||
      this.f.courseId == null
    ) {
      this.isCourseIdInvalid = true;
      hasError = true;
    } else {
      this.isCourseIdInvalid = false;
      hasError = false;
    }

    if (
      this.f.contactId.value == "" ||
      this.f.contactId.value == "undefined" ||
      this.f.contactId == null
    ) {
      this.isContactIdInvalid = true;
      hasError = true;
    } else {
      this.isContactIdInvalid = false;
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
            name: this.currentForm.get("name").value,
            description: this.currentForm.get("description").value,
            accountManager: this.currentForm.get("accountManager").value,
            stage: this.currentForm.get("stage").value,
            vatRegistration: this.currentForm.get("vatRegistration").value,
            type: this.currentForm.get("type").value,
            totalDealAmount: this.currentForm.get("totalDealAmount").value,
            courseFee: this.currentForm.get("courseFee").value,
            numberOfParticipants: this.currentForm.get("numberOfParticipants")
              .value,
            accountId: this.currentForm.get("accountId").value,
            contactId: this.currentForm.get("contactId").value,
            courseId: this.currentForm.get("courseId").value
          };

          this.httpClient
            .post(this.ENDPOINT, requestBody, { observe: "response" })
            .subscribe(
              data => {
                if (data.status == 201) {
                  this.toastr.success(
                    `New ${this.title} successfully saved.`,
                    "Success",
                    { timeOut: 3000 }
                  );
                  this.router.navigate(["/app/account", this.parentAccountId], {
                    queryParams: { action: "view" }
                  });
                }
              },
              error => {
                if (error.status === 409) {
                  this.toastr.error("Conflict occured.", "Failed Request", {
                    timeOut: 3000
                  });
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

  activeCheckbox = event => {
    if (event.currentTarget.checked) {
      this.f.status.setValue("ACTIVE");
    } else {
      this.f.status.setValue("INACTIVE");
    }
  };

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
}
