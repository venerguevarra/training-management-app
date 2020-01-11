import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';

import { CompanySizeSelectComponent }  from './company-size-select.component';

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
        CompanySizeSelectComponent
    ],
    declarations: [
        CompanySizeSelectComponent
    ],
    providers: [],
})
export class CompanySizeSelectModule { }
