import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AccountListComponent } from './account-list/list.component';
import { AccountDetailComponent } from './account-detail/detail.component';
import { ContactListComponent } from  './contact-list/list.component';
import { DealListComponent } from  './deal-list/list.component';

import { ChannelSelectModule }  from '../../../components/channel-select/channel-select.module';
import { AccountManagerSelectModule }  from '../../../components/account-manager-select/account-manager-select.module';
import { CompanySizeSelectModule }  from '../../../components/company-size-select/company-size-select.module';
import { CourseSelectModule } from '../../../components/course-select/course-select.module';
import { ContactSelectModule } from '../../../components/contact-select/contact-select.module';

import { AccountRoutingModule  } from "./account-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        AccountRoutingModule,
        ChannelSelectModule,
        AccountManagerSelectModule,
        CompanySizeSelectModule,
        CourseSelectModule,
        ContactSelectModule
    ],
    exports: [
        ContactListComponent,
        DealListComponent
    ],
    declarations: [
        AccountListComponent,
        AccountDetailComponent,
        ContactListComponent,
        DealListComponent
    ],
    providers: [],
})
export class AccountModule { }
