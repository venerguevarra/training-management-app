import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContentPagesRoutingModule } from "./content-pages-routing.module";

import { LoginPageComponent } from "./login/login-page.component";
import { RegistrationPageComponent } from "./registration/registration.component";


@NgModule({
    imports: [
        CommonModule,
        ContentPagesRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        LoginPageComponent,
        RegistrationPageComponent
    ]
})
export class ContentPagesModule { }
