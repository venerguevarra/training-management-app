import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { InquiryListComponent } from './inquiry-list/list.component';
import { InquiryDetailComponent } from './inquiry-detail/detail.component';

import { InquiryRoutingModule  } from "./inquiry-routing.module";
import { InquiryStatusSelectModule }  from '../../../components/inquiry-status-select/inquiry-status-select.module';
import { CourseSelectModule }  from '../../../components/course-select/course-select.module';
import { ChannelSelectModule }  from '../../../components/channel-select/channel-select.module';
import { AccountManagerSelectModule }  from '../../../components/account-manager-select/account-manager-select.module';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        InquiryRoutingModule,
        NgSelectModule,
        InquiryStatusSelectModule,
        CourseSelectModule,
        ChannelSelectModule,
        AccountManagerSelectModule
    ],
    exports: [],
    declarations: [
        InquiryListComponent,
        InquiryDetailComponent
    ],
    providers: [],
})
export class InquiryModule { }
