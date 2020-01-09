import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { VenueListComponent } from './venue-list/list.component';
import { VenueDetailComponent } from './venue-detail/detail.component';

import { VenueRoutingModule  } from "./venue-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        VenueRoutingModule
    ],
    exports: [],
    declarations: [
        VenueListComponent,
        VenueDetailComponent
    ],
    providers: [],
})
export class VenueModule { }
