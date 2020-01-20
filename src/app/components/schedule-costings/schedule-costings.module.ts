import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { SchedulingCostingsComponent }  from './schedule-costings.component';
import { CostSelectModule } from '../cost-select/cost-select.module';
@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        NgSelectModule,
        CostSelectModule
    ],
    exports: [
        SchedulingCostingsComponent
    ],
    declarations: [
        SchedulingCostingsComponent
    ],
    providers: [],
})
export class ScheduleCostingsModule { }
