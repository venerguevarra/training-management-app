import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { DealDetailComponent } from './deal-detail/detail.component';
import { DealRoutingModule } from './deal-routing.module';

import { CourseSelectModule } from '../../../components/course-select/course-select.module';
import { ContactSelectModule } from '../../../components/contact-select/contact-select.module';
import { InquirySelectModule } from '../../../components/inquiry-select/inquiry-select.module';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        DealRoutingModule,
        CourseSelectModule,
        ContactSelectModule,
        InquirySelectModule
    ],
    exports: [],
    declarations: [
        DealDetailComponent
    ],
    providers: [],
})
export class DealModule { }
