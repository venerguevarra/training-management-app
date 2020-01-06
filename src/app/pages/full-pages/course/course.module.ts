import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { CourseListComponent } from './list/list.component';
import { CourseDetailComponent } from './detail/detail.component';

import { CourseRoutingModule  } from "./course-routing.module";

@NgModule({
    imports: [
        CommonModule,
        CourseRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule
    ],
    exports: [],
    declarations: [
        CourseListComponent,
        CourseDetailComponent
    ],
    providers: [],
})
export class CourseModule { }
