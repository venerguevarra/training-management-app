import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountListComponent } from './account-list/list.component';
import { DealListComponent } from './deal-list/list.component';
import { ContactListComponent } from './contact-list/list.component';
import { AccountDetailComponent } from './account-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'sales/account',
        component: AccountListComponent,
        data: {
          title: 'Account List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'deal',
        component: DealListComponent,
        data: {
          title: 'Deal List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'contact',
        component: ContactListComponent,
        data: {
          title: 'Contact List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'sales/account/:id',
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
