import { Component, ViewChild } from "@angular/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';// for dateClick
import { OptionsInput } from '@fullcalendar/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from "@angular/router";
import swal from 'sweetalert2';

@Component({
  selector: "app-schedule-calendar",
  templateUrl: "./schedule-calendar.component.html",
  styleUrls: ["./schedule-calendar.component.scss"]
})
export class ScheduleCalendarComponent {

  private readonly API_HOST = environment.API_HOST;

  calendarPlugins = [dayGridPlugin, interactionPlugin];

  calendarOptions: any;
  meridian = true;

   @ViewChild('calendar', { static: false })
   fullcalendarComponent: FullCalendarComponent;

  constructor(private httpClient: HttpClient,  private router: Router) {
    this.calendarOptions = {
    }
  }

  ngAfterViewInit() {
    //console.log(this.fullcalendarComponent);
  }

  datesRenderHandler($event) {
    let startMonth = $event.view.currentStart.getMonth() + 1;
    let startDay = $event.view.currentStart.getDate();
    let startYear = $event.view.currentStart.getFullYear();
    let startDate = `${startYear}` + '-' + `0${startMonth}`.slice(-2) + '-' + `0${startDay}`.slice(-2);
    console.log(startDate);

    let endMonth = $event.view.currentEnd.getMonth() + 1;
    let endDay = $event.view.currentEnd.getDate();
    let endYear = $event.view.currentEnd.getFullYear();
    let endDate = `${endYear}` + '-' + `0${endMonth}`.slice(-2) + '-' + `0${endDay}`.slice(-2);
    console.log(endDate);

    this.getSchedules(startDate, endDate).then(data => {
      console.log(data);
      this.calendarEvents = data;
    }).catch(err => {
      console.log(err);
    })
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

  customFunction() {

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
