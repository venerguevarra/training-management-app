import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { FacilitatorScheduleComponent }  from './facilitator-schedule.component';
import { FacilitatorSelectModule } from '../facilitator-select/facilitator-select.module';
import { FacilitatorDetailModule } from '../facilitator-detail/facilitator-detail.module';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        NgSelectModule,
        FacilitatorSelectModule,
        FacilitatorDetailModule
    ],
    exports: [
        FacilitatorScheduleComponent
    ],
    declarations: [
        FacilitatorScheduleComponent
    ],
    providers: [],
})
export class FacilitatorScheduleModule { }
