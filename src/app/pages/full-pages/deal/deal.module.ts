import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { DealDetailComponent } from './deal-detail/detail.component';
import { DealRoutingModule } from './deal-routing.module';

import { CourseSelectModule } from '../../../components/course-select/course-select.module';
import { ContactSelectModule } from '../../../components/contact-select/contact-select.module';
import { InquirySelectModule } from '../../../components/inquiry-select/inquiry-select.module';
import { UserProfileDetailModule } from '../../../components/user-profile-detail/user-profile-detail.module';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        DealRoutingModule,
        CourseSelectModule,
        ContactSelectModule,
        InquirySelectModule,
        UserProfileDetailModule
    ],
    exports: [],
    declarations: [
        DealDetailComponent
    ],
    providers: [],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class DealModule { }
