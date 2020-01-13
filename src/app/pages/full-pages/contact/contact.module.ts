import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ContactDetailComponent } from './contact-detail/detail.component';

import { ChannelSelectModule }  from '../../../components/channel-select/channel-select.module';
import { AccountManagerSelectModule }  from '../../../components/account-manager-select/account-manager-select.module';
import { CompanySizeSelectModule }  from '../../../components/company-size-select/company-size-select.module';

import { ContactRoutingModule  } from "./contact-routing.module";

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        ContactRoutingModule,
        ChannelSelectModule,
        AccountManagerSelectModule,
        CompanySizeSelectModule
    ],
    exports: [],
    declarations: [
        ContactDetailComponent
    ],
    providers: [],
})
export class ContactModule { }
