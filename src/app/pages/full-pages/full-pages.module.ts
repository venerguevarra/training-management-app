import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { InquiryComponent  } from "./inquiry/inquiry.component";
import { AccountComponent  } from "./account/account.component";
import { FullPageRoutingModule  } from "./full-pages-routing.module";

@NgModule({
    imports: [
        CommonModule,
        FullPageRoutingModule,
        NgbModule,
    ],
    exports: [],
    declarations: [
        InquiryComponent,
        AccountComponent
    ],
    providers: [],
})
export class FullPagesModule { }
