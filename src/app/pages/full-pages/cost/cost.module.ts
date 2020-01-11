import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { CostListComponent } from './cost-list/list.component';
import { CostDetailComponent } from './cost-detail/detail.component';

import { CostRoutingModule  } from "./cost-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        CostRoutingModule
    ],
    exports: [],
    declarations: [
        CostListComponent,
        CostDetailComponent
    ],
    providers: [],
})
export class CostModule { }
