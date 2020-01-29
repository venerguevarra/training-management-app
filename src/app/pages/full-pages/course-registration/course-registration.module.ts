import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { CourseRegistrationComponent } from './course-registration/course-registration.component';
import { AccountSelectModule } from '../../../components/account-select/account-select.module';
import { CourseSelectModule } from '../../../components/course-select/course-select.module';

import { CourseRegistrationRoutingModule  } from "./course-registration-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        CourseRegistrationRoutingModule,
        AccountSelectModule,
        CourseSelectModule
    ],
    exports: [],
    declarations: [
        CourseRegistrationComponent
    ],
    providers: [],
})
export class CourseRegistrationModule { }
