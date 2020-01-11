import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountListComponent } from './account-list/list.component';
import { AccountDetailComponent } from './account-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'account',
        component: AccountListComponent,
        data: {
          title: 'Account List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'account/:id',
        component: AccountDetailComponent,
        data: {
          title: 'Account Detail'
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
export class AccountRoutingModule { }
