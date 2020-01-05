import { Component } from '@angular/core';
import swal from 'sweetalert2';


@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss']
})

export class ChangePasswordComponent {

	constructor() { }

	confirmSave() {
      	swal.fire({
			text: "Change Password?",
			type: "info",
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Change'
		}).then(this.changePassword);
    }

	changePassword(result) {
		if (result.value) {
			swal.fire(
				'Deleted!',
				'Your file has been deleted.',
				'success'
			);
		}
	}
}