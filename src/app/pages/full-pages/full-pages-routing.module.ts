import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryComponent } from "./inquiry/inquiry.component";
import { AccountComponent } from './account/account.component';

import { AuthGuard } from '../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inquiry',
        component: InquiryComponent,
        data: {
          title: 'Inquiry'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'account',
        component: AccountComponent,
        data: {
          title: 'Account'
        },
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullPageRoutingModule { }
