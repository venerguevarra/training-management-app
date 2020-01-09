import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { FacilitatorListComponent } from './facilitator-list/list.component';
import { FacilitatorDetailComponent } from './facilitator-detail/detail.component';

import { FacilitatorRoutingModule  } from "./facilitator-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        FacilitatorRoutingModule
    ],
    exports: [],
    declarations: [
        FacilitatorListComponent,
        FacilitatorDetailComponent
    ],
    providers: [],
})
export class FacilitatorModule { }
