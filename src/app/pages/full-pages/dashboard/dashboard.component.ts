import { Component, SimpleChanges, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { StateService } from "../../../service/state.service";
import { User } from "../../../model/user.model";
import { environment } from "../../../../environments/environment";
import { AuthService } from "../../../shared/auth/auth.service";
import {Observable} from 'rxjs/Rx'

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent {
  private readonly API_HOST = environment.API_HOST;
  private readonly COURSE_SCHEDULE_ENDPOINT: string = `${this.API_HOST}/course-schedules/actions/find`;

  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  currentYear = new Date().getFullYear();
  xAxisLabel = "Month";
  showYAxisLabel = true;
  yAxisLabel = "Sales Amount (PHP)";
  timeline = true;

  view: any[] = [600, 400];

  colorScheme = {
    domain: ["#9370DB", "#87CEFA", "#FA8072", "#FF7F50", "#90EE90", "#9370DB"]
  };

  showLabels = true;
  criteria;

  yearToDateDealClosing;
  yearToDateDealProposal;

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private stateService: StateService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.getYearlyDeal('PROPOSAL').then(data => {
      this.yearToDateDealProposal = data;
    });

    this.getYearlyDeal('CLOSING').then(data => {
      this.yearToDateDealClosing = data;
    });
    this.getDeliveredSchedules();
    this.getConfirmedSchedules();
    this.getWaitingSchedules();
    this.getCancelledSchedules();

    this.getYearlySales("DELIVERED");
    this.getQuarterlySales("DELIVERED");
    let quarterOfTheYear = this.quarterOfTheYear();
    if(quarterOfTheYear == 1) {
      this.xAxisLabel = `1ST QUARTER ${this.currentYear} (DELIVERED)`;
    } else if(quarterOfTheYear == 2) {
      this.xAxisLabel = `2ND QUARTER ${this.currentYear} (DELIVERED)`;
    } else if(quarterOfTheYear == 3) {
      this.xAxisLabel = `3RD QUARTER ${this.currentYear} (DELIVERED)`;
    } else if(quarterOfTheYear == 4) {
      this.xAxisLabel = `4TH QUARTER ${this.currentYear} (DELIVERED)`;
    }
  }

  getSearchFormCriteria(status: string) {
		this.criteria = [];

    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    let month = `0${firstDay.getMonth()}`.slice(-2);
		let day = `0${firstDay.getDate()}`.slice(-2);
		let year = `${firstDay.getFullYear()}`;
		let searchStartDate = `${year}-${month}-${day}`;
    this.criteria.push({
      name: 'startDate',
      paramName: 'dateFrom',
      value: searchStartDate,
      operator: 'GE',
      type: 'DATE',
      logical: 'AND'
    });

    let lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 3, 0);
    month = `0${lastDay.getMonth()}`.slice(-2);
		day = `0${lastDay.getDate()}`.slice(-2);
		year = `${lastDay.getFullYear()}`;
		let searchEndDate = `${year}-${month}-${day}`;
    this.criteria.push({
      name: 'endDate',
      paramName: 'dateTo',
      value: searchEndDate,
      operator: 'LE',
      type: 'DATE'
    });

    this.criteria.push({
      name: 'status',
      paramName: 'status',
      value: `${status}`,
      operator: 'EQ',
      type: 'ENUM'
    });

		return this.criteria;
	}

  deliveredData = [];
  getDeliveredSchedules() {
		this.criteria = this.getSearchFormCriteria('SCHEDULE_DELIVERED');
		let jsonBody = {
			criteria: this.criteria,
			page: '0',
			size: '50'
		}

    this.httpClient
      .post(this.COURSE_SCHEDULE_ENDPOINT, jsonBody)
      .subscribe(
        (data) => {
          this.deliveredData = data['elements'];
        }
      );
	}

  confirmedData = [];
  getConfirmedSchedules() {
		this.criteria = this.getSearchFormCriteria('SCHEDULE_CONFIRMED');
		let jsonBody = {
			criteria: this.criteria,
			page: '0',
			size: '50'
		}

    this.httpClient
      .post(this.COURSE_SCHEDULE_ENDPOINT, jsonBody)
      .subscribe(
        (data) => {
          this.confirmedData = data['elements'];
        }
      );
	}

  cancelledData = [];
  getCancelledSchedules() {
		this.criteria = this.getSearchFormCriteria('SCHEDULE_CANCELLED');
		let jsonBody = {
			criteria: this.criteria,
			page: '0',
			size: '50'
		}

    this.httpClient
      .post(this.COURSE_SCHEDULE_ENDPOINT, jsonBody)
      .subscribe(
        (data) => {
          this.cancelledData = data['elements'];
        }
      );
	}

  waitingData = [];
  getWaitingSchedules() {
		this.criteria = this.getSearchFormCriteria('SCHEDULE_WAITING');
		let jsonBody = {
			criteria: this.criteria,
			page: '0',
			size: '50'
		}

    this.httpClient
      .post(this.COURSE_SCHEDULE_ENDPOINT, jsonBody)
      .subscribe(
        (data) => {

          this.waitingData = data['elements'];
        }
      );
	}

  quarterOfTheYear() {
    let month = new Date().getMonth() + 1;
    return (Math.ceil(month / 3));
  }

  yearToDateSales;
  getYearlySales(status: string) {
    let promise = new Promise((resolve, reject) => {
      let year = new Date().getFullYear();
      let endpoint = `${this.API_HOST}/sales-report/by-year?year=${this.currentYear}&status=${status}`;
      this.httpClient
        .get(endpoint)
        .toPromise()
        .then(
          res => {
            this.yearToDateSales = res;
            resolve(res);
          },
          msg => {
            reject(msg);
          }
        );
    });

    return promise;
  }

  getYearlyDeal(stage: string) {
    let promise = new Promise((resolve, reject) => {
      let year = new Date().getFullYear();
      let endpoint = `${this.API_HOST}/sales-report/deal-by-year?year=${this.currentYear}&stage=${stage}`;
      this.httpClient
        .get(endpoint)
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


  quarterlySalesYtd: any;
  getQuarterlySales(status: string) {
    let promise = new Promise((resolve, reject) => {

      let endpoint = `${this.API_HOST}/sales-report/by-quarter?year=${this.currentYear}&status=${status}`;
      this.httpClient
        .get(endpoint)
        .toPromise()
        .then(
          res => {
            this.quarterlySalesYtd = res;
            resolve(res);
          },
          msg => {
            reject(msg);
          }
        );
    });

    return promise;
  }


}
