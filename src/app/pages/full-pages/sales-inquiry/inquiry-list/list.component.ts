import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { catchError, tap, map, first } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import "rxjs/Rx";
import { Observable } from "rxjs";
import swal from "sweetalert2";

import { User } from "../../../../model/user.model";
import { environment } from "../../../../../environments/environment";
import { pageConfig } from "../../../page.config";
import {
  CourseDataService,
  Course
} from "../../../../service/course-data.service";
import { StateService } from "../../../../service/state.service";
import { CustomValidator } from '../../../../validator/custom.validator';

@Component({
  selector: "app-venue-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"]
})
export class InquiryListComponent {
  private readonly API_HOST = environment.API_HOST;
  private readonly ENDPOINT: string = `${this.API_HOST}/inquiries`;
  private readonly FIND_ENDPOINT: string = `${this.ENDPOINT}/actions/find`;
  private readonly LANDING_PAGE: string = `/app/sales/inquiry`;

  title: string = "Inquiry";
  rows: any = [];
  page = 0;
  pageSize = pageConfig.pageSize;
  collectionSize = 0;
  isCollapsed = true;

  searchForm: FormGroup;
  searchFormStatus;
  criteria;
  inquiryDateFrom;
  inquiryDateTo;

  customInquiryStatusData = [
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
      label: "SALES QUALIFIED"
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

  defaultPaginationParams = {
    size: this.pageSize.toString(),
    page: this.page.toString()
  };

  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private courseDateService: CourseDataService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.submitSearchForm();

    this.searchForm = this.formBuilder.group({
      name: [""],
      channel: [""],
      inquiryDateFrom: ["", [CustomValidator.dateValidator.bind(this)]],
      inquiryDateTo: ["", [CustomValidator.dateValidator.bind(this)]],
      inquiryStatus: [""]
    });

    this.criteria = [];
  }

  paginationChange(event) {
    this.paginationSizeChange();
  }

  paginationSizeChange() {
    let currentPage = this.page - 1;
    let params = {
      size: this.pageSize.toString(),
      page: currentPage.toString()
    };
    this.criteria = this.getSearchFormCriteria();
    if (this.criteria.length > 0) {
      let jsonBody = {
        criteria: this.criteria,
        page: params.page,
        size: params.size
      };

      this.httpClient.post(this.FIND_ENDPOINT, jsonBody).subscribe(data => {
        this.collectionSize = data["totalElements"];
        this.rows = data["elements"];
      });
    }
  }

  navigateToNewForm() {
    this.router.navigate([`${this.LANDING_PAGE}`, -1]);
  }

  clearSearchForm() {
    this.searchForm = this.formBuilder.group({
      name: [""],
      inquiryDateFrom: ["", [CustomValidator.dateValidator.bind(this)]],
      inquiryDateTo: ["", [CustomValidator.dateValidator.bind(this)]],
      channel: [""],
      inquiryStatus: [""]
    });
    this.inquiryDateFrom = "";
    this.inquiryDateTo = "";
    this.criteria = [];
    this.pageSize = pageConfig.pageSize;
    this.toastr.info(`${this.title} list refreshed`, "System", {
      timeOut: 3000
    });
  }

  private getSearchFormCriteria() {
    this.criteria = [];

    this.criteria.push({
      name: "accountManager",
      value: this.stateService.getCurrentUser().userId,
      operator: "EQ",
      type: "UUID",
      logical: "AND"
    });

    if (this.searchForm) {
      if (this.searchForm.get("inquiryStatus").value != "") {
        this.criteria.push({
          name: "inquiryStatus",
          value: this.searchForm.get("inquiryStatus").value,
          operator: "EQ",
          type: "ENUM",
          logical: "AND"
        });
      }
      if (this.searchForm.get("name").value != "") {
        this.criteria.push({
          name: "firstName",
          value: this.searchForm.get("name").value,
          operator: "LIKE",
          type: "STRING",
          logical: "OR"
        });
        this.criteria.push({
          name: "firstName",
          value: this.searchForm.get("name").value,
          operator: "LIKE",
          type: "STRING",
          logical: "OR"
        });
        this.criteria.push({
          name: "email",
          value: this.searchForm.get("name").value,
          operator: "LIKE",
          type: "STRING",
          logical: "AND"
        });
      }

      if (this.searchForm.get("channel").value != "") {
        this.criteria.push({
          name: "inquiryChannel",
          value: this.searchForm.get("channel").value,
          operator: "EQ",
          type: "ENUM",
          logical: "AND"
        });
      }

      if (this.searchForm.get("inquiryDateFrom").value != "") {
        let month = `0${
          this.searchForm.get("inquiryDateFrom").value.month
        }`.slice(-2);
        let day = `0${this.searchForm.get("inquiryDateFrom").value.day}`.slice(
          -2
        );
        let year = `${this.searchForm.get("inquiryDateFrom").value.year}`;
        this.inquiryDateFrom = `${year}-${month}-${day}`;

        if (this.searchForm.get("inquiryDateTo").value != "") {
          this.criteria.push({
            name: "dateOfInquiry",
            paramName: "dateOfInquiryFrom",
            value: this.inquiryDateFrom,
            operator: "GE",
            type: "DATE",
            logical: "AND"
          });
        } else {
          this.criteria.push({
            name: "dateOfInquiry",
            paramName: "dateOfInquiryFrom",
            value: this.inquiryDateFrom,
            operator: "GE",
            type: "DATE"
          });
        }
      }

      if (this.searchForm.get("inquiryDateTo").value != "") {
        let month = `0${
          this.searchForm.get("inquiryDateTo").value.month
        }`.slice(-2);
        let day = `0${this.searchForm.get("inquiryDateTo").value.day}`.slice(
          -2
        );
        let year = `${this.searchForm.get("inquiryDateTo").value.year}`;
        this.inquiryDateTo = `${year}-${month}-${day}`;
        this.criteria.push({
          name: "dateOfInquiry",
          paramName: "dateOfInquiryTo",
          value: this.inquiryDateTo,
          operator: "LE",
          type: "DATE"
        });
      }
    }

    return this.criteria;
  }

  public onChannelSelected(channel: any) {
    if (channel) {
      this.searchForm.controls.channel.setValue(channel);
    } else {
      this.searchForm.controls.channel.setValue("");
    }
  }

  public onInquiryStatusSelected(inquiryStatus: any) {
    if (inquiryStatus) {
      this.searchForm.controls.inquiryStatus.setValue(inquiryStatus);
    } else {
      this.searchForm.controls.inquiryStatus.setValue("");
    }
  }

  submitSearchForm() {
    this.page = 0;

    this.criteria = this.getSearchFormCriteria();
    let jsonBody = {
      criteria: this.criteria,
      page: "0",
      size: this.pageSize.toString()
    };

    if (this.criteria.length === 0) {
      this.toastr.error("Please provide search criteria", "Failed Request", {
        timeOut: 3000
      });
    }

    if (this.criteria.length > 0) {
      this.httpClient.post(this.FIND_ENDPOINT, jsonBody).subscribe(data => {
        this.collectionSize = data["totalElements"];
        this.rows = data["elements"];
      });
    }
  }


}
