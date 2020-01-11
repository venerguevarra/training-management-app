import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { InquiryListComponent } from './inquiry-list/list.component';
import { InquiryDetailComponent } from './inquiry-detail/detail.component';

import { InquiryRoutingModule  } from "./inquiry-routing.module";
import { CourseSelectComponent }  from '../../../components/course-select/course-select.component';
import { AccountManagerSelectComponent }  from '../../../components/account-manager-select/account-manager-select.component';
import { ChannelSelectComponent }  from '../../../components/channel-select/channel-select.component';
import { InquiryStatusSelectComponent }  from '../../../components/inquiry-status-select/inquiry-status-select.component';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        InquiryRoutingModule,
        NgSelectModule
    ],
    exports: [],
    declarations: [
        InquiryListComponent,
        InquiryDetailComponent,
        CourseSelectComponent,
        AccountManagerSelectComponent,
        ChannelSelectComponent,
        InquiryStatusSelectComponent
    ],
    providers: [],
})
export class InquiryModule { }
