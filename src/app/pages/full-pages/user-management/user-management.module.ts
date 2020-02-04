import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { UserManagementListComponent } from './user-management-list/list.component';
import { UserManagementDetailComponent } from './user-management-detail/detail.component';

import { UserManagementRoutingModule  } from "./user-management-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        UserManagementRoutingModule
    ],
    exports: [],
    declarations: [
        UserManagementListComponent,
        UserManagementDetailComponent
    ],
    providers: [],
})
export class UserManagementModule { }
