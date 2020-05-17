import { Component, ViewChild } from "@angular/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';// for dateClick
import { OptionsInput } from '@fullcalendar/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from "@angular/router";
import swal from 'sweetalert2';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-schedule-calendar",
  templateUrl: "./schedule-calendar.component.html",
  styleUrls: ["./schedule-calendar.component.scss"]
})
export class ScheduleCalendarComponent {

  private readonly API_HOST = environment.API_HOST;

  calendarPlugins = [dayGridPlugin, interactionPlugin];

  options: any;
  meridian = true;

  constructor(private httpClient: HttpClient,  private router: Router, private toastr: ToastrService) {
    this.options = {
      customButtons: {
        refreshButton: {
          text: 'Referesh',
          click: this.refreshEventHandler
        }
      }
    };
  }

  startMonth: any;
  startDay: any;
  startYear: any;
  startDate: any;
  endMonth: any;
  endDay: any;
  endYear: any;
  endDate: any;

  datesRenderHandler($event) {
    this.startMonth = $event.view.currentStart.getMonth() + 1;
    this.startDay = $event.view.currentStart.getDate();
    this.startYear = $event.view.currentStart.getFullYear();
    this.startDate = `${this.startYear}` + '-' + `0${this.startMonth}`.slice(-2) + '-' + `0${this.startDay}`.slice(-2);

    this.endMonth = $event.view.currentEnd.getMonth() + 1;
    this.endDay = $event.view.currentEnd.getDate();
    this.endYear = $event.view.currentEnd.getFullYear();
    this.endDate = `${this.endYear}` + '-' + `0${this.endMonth}`.slice(-2) + '-' + `0${this.endDay}`.slice(-2);

    this.getSchedules(this.startDate, this.endDate).then(data => {
      this.calendarEvents = data;
    }).catch(err => {
    });
  }

  getSchedules(startDate: string, endDate: string) {
		let promise = new Promise((resolve, reject) => {
			let endpoint = `${this.API_HOST}/course-schedules/actions/find-by-date?startDate=${startDate}&endDate=${endDate}`;

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



  toggleMeridian() {
      this.meridian = !this.meridian;
  }

  refreshEventHandler = () => {
    this.getSchedules(this.startDate, this.endDate).then(data => {
      this.calendarEvents = data;
      this.toastr.success(
        `Calendar successfully refreshed.`,
        "System",
        { timeOut: 3000 }
      );
    }).catch(err => {
      // exception
    });
  }

  calendarEvents;

  eventClicked(e) {
    swal.fire({
      title: 'Schedule',
			text: `View ${e.event.title} (${e.event.extendedProps.courseSchedule.startDate} - ${e.event.extendedProps.courseSchedule.endDate}) details?`,
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'View',
			allowOutsideClick: false
		}).then(response => {
			if(response.value) {
        this.router.navigate(["/app/schedule", `${e.event.extendedProps.courseSchedule.id}`], { queryParams: { action: 'view' } });
      }
    });

  }

  handleDateClick($event) {

  }
}
