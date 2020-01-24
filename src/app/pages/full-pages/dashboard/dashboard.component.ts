import { Component } from "@angular/core";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent {
  showModal: boolean;
  UserId: string;
  Firstname: string;
  Lastname: string;
  Email: string;

  onClick(event) {
    this.showModal = true; // Show-Hide Modal Check
    this.UserId = event.target.id;
    this.Firstname = document.getElementById(
      "firstname" + this.UserId
    ).innerHTML;
    this.Lastname = document.getElementById("lastname" + this.UserId).innerHTML;
    this.Email = document.getElementById("email" + this.UserId).innerHTML;
  }
  //Bootstrap Modal Close event
  hide() {
    this.showModal = false;
  }
}
