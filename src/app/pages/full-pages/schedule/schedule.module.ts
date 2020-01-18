import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CourseSelectModule } from '../../../components/course-select/course-select.module';
import { VenueSelectModule } from '../../../components/venue-select/venue-select.module';
import { FacilitatorSelectModule } from '../../../components/facilitator-select/facilitator-select.module';
import { CourseDetailModule } from '../../../components/course-detail/course-detail.module';
import { FacilitatorDetailModule } from '../../../components/facilitator-detail/facilitator-detail.module';
import { VenueDetailModule } from '../../../components/venue-detail/venue-detail.module';

import { ScheduleListComponent } from './schedule-list/list.component';
import { ScheduleDetailComponent } from './schedule-detail/detail.component';

import { ScheduleRoutingModule  } from "./schedule-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        ScheduleRoutingModule,
        CourseSelectModule,
        VenueSelectModule,
        FacilitatorSelectModule,
        CourseDetailModule,
        FacilitatorDetailModule,
        VenueDetailModule
    ],
    exports: [],
    declarations: [
        ScheduleListComponent,
        ScheduleDetailComponent
    ],
    providers: [],
})
export class ScheduleModule { }
