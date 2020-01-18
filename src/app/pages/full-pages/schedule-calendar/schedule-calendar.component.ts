import { Component } from "@angular/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction'; // for dateClick


@Component({
  selector: "app-schedule-calendar",
  templateUrl: "./schedule-calendar.component.html",
  styleUrls: ["./schedule-calendar.component.scss"]
})
export class ScheduleCalendarComponent {
  calendarPlugins = [dayGridPlugin, interactionPlugin];

  calendarOptions: any;

  constructor() {
    this.calendarOptions = {
      customButtons: {
        myCustomButton: {
          text: 'filter',
          click: () => this.customFunction()
        }
      }
    }

  }

time = {hour: 13, minute: 30};
  meridian = true;

  toggleMeridian() {
      this.meridian = !this.meridian;
  }

  customFunction() {

  }

  calendarEvents = [
    { title: "event 1", start: "2019-12-30", end: "2020-01-03T24:00:00.000", user: { id: "1"} },
    { title: "event 4", start: "2020-01-01", end: "2020-01-06T00:00:00.000" },
    { title: "event 5", start: "2020-01-01", end: "2020-01-06T00:00:00.000" },
    { title: "event 6", start: "2020-01-01", end: "2020-01-06T00:00:00.000" },
    { title: "event 2", start: "2020-01-02", end: "2020-01-05" }
  ];

  eventClicked($event) {
    console.log($event.event.extendedProps.user.id);
  }

  handleDateClick($event) {
    console.log($event);
  }
}
