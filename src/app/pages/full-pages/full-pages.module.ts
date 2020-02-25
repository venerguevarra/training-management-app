import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { FullCalendarModule } from '@fullcalendar/angular';

import { DashboardComponent  } from "./dashboard/dashboard.component";
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { CourseParticipantListComponent } from './course-participant-list/course-participant-list.component';
import { ScheduleCalendarComponent } from './schedule-calendar/schedule-calendar.component';

import { FacilitatorModule } from './facilitator/facilitator.module';
import { CourseModule } from './course/course.module';
import { VenueModule } from './venue/venue.module';
import { CostModule } from './cost/cost.module';
import { InquiryModule } from './sales-inquiry/inquiry.module';
import { MarketingInquiryModule } from './marketing-inquiry/marketing-inquiry.module';
import { AccountModule } from './account/account.module';
import { ContactModule } from './contact/contact.module';
import { DealModule } from './deal/deal.module';
import { ScheduleModule } from './schedule/schedule.module';
import { RegistrationModule } from './registration/registration.module';
import { DealSelectModule } from  '../../components/deal-select/deal-select.module';
import { CourseRegistrationModule } from  '../full-pages/course-registration/course-registration.module';
import { UserManagementModule } from  '../full-pages/user-management/user-management.module';
import { FullPageRoutingModule  } from "./full-pages-routing.module";
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CourseDetailModule } from '../../components/course-detail/course-detail.module';
import { VenueDetailModule } from '../../components/venue-detail/venue-detail.module';

@NgModule({
    imports: [
        FullCalendarModule,
        CommonModule,
        FullPageRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        NgSelectModule,
        CourseModule,
        FacilitatorModule,
        VenueModule,
        CostModule,
        InquiryModule,
        MarketingInquiryModule,
        AccountModule,
        ContactModule,
        DealModule,
        ScheduleModule,
        DealSelectModule,
        RegistrationModule,
        CourseRegistrationModule,
        UserManagementModule,
        NgxChartsModule,
        CourseDetailModule,
        VenueDetailModule
    ],
    exports: [],
    declarations: [
        DashboardComponent,
        UserProfileComponent,
        ChangePasswordComponent,
        ScheduleCalendarComponent
    ],
    providers: [],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class FullPagesModule { }
