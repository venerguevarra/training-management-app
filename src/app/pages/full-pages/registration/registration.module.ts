import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { RegistrationDetailComponent } from './registration-detail/detail.component';
import { RegistrationRoutingModule } from './registration-routing.module';
import { DealSelectModule } from '../../../components/deal-select/deal-select.module';
import { ScheduleSelectModule } from '../../../components/schedule-select/schedule-select.module';
import { ContactDetailModule } from '../../../components/contact-detail/contact-detail.module';
import { CourseDetailModule } from '../../../components/course-detail/course-detail.module';
import { DealDetailModule } from '../../../components/deal-detail/deal-detail.module';
import { ScheduleDetailModule } from '../../../components/schedule-detail/schedule-detail.module';

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
        CourseSelectModule,
        ContactSelectModule,
        InquirySelectModule,
        UserProfileDetailModule,
        RegistrationRoutingModule,
        DealSelectModule,
        ScheduleSelectModule,
        ContactDetailModule,
        CourseDetailModule,
        DealDetailModule,
        ScheduleDetailModule
    ],
    exports: [],
    declarations: [
        RegistrationDetailComponent
    ],
    providers: [],
})
export class RegistrationModule { }
