import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryComponent } from "./inquiry/inquiry.component";
import { AccountComponent } from './account/account.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inquiry',
        component: InquiryComponent,
        data: {
          title: 'Inquiry'
        }
      },
      {
        path: 'account',
        component: AccountComponent,
        data: {
          title: 'Account'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullPageRoutingModule { }
