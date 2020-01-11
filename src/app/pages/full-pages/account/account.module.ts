import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AccountListComponent } from './account-list/list.component';
import { AccountDetailComponent } from './account-detail/detail.component';

import { ChannelSelectModule }  from '../../../components/channel-select/channel-select.module';
import { AccountManagerSelectModule }  from '../../../components/account-manager-select/account-manager-select.module';
import { CompanySizeSelectModule }  from '../../../components/company-size-select/company-size-select.module';


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
        CompanySizeSelectModule
    ],
    exports: [],
    declarations: [
        AccountListComponent,
        AccountDetailComponent
    ],
    providers: [],
})
export class AccountModule { }
