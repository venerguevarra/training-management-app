import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { UserProfileDetailComponent }  from './user-profile-detail.component';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        NgSelectModule
    ],
    exports: [
        UserProfileDetailComponent
    ],
    declarations: [
        UserProfileDetailComponent
    ],
    providers: [],
})
export class UserProfileDetailModule { }
