import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
    errorMessage = "Unable to find requested resource.";

    constructor(
        private route: ActivatedRoute,
    ) {
        this.route.queryParams.subscribe(params => {
                let message = params.message;

                if(message == 'invalid_token') {
                    this.errorMessage = "Unauthorized registration token."
                }

        });
    }
}