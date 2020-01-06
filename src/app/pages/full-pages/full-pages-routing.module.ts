import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryComponent } from "./inquiry/inquiry.component";
import { AccountComponent } from './account/account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

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
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          title: 'Dashboard'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        data: {
          title: 'User Profile'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        data: {
          title: 'Change Password'
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
