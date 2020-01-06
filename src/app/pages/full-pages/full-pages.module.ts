import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { InquiryComponent  } from "./inquiry/inquiry.component";
import { AccountComponent  } from "./account/account.component";
import { DashboardComponent  } from "./dashboard/dashboard.component";
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { CourseModule } from './course/course.module';

import { FullPageRoutingModule  } from "./full-pages-routing.module";

@NgModule({
    imports: [
        CommonModule,
        FullPageRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        CourseModule
    ],
    exports: [],
    declarations: [
        InquiryComponent,
        AccountComponent,
        DashboardComponent,
        UserProfileComponent,
        ChangePasswordComponent
    ],
    providers: [],
})
export class FullPagesModule { }
