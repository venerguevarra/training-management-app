import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserManagementListComponent } from './user-management-list/list.component';
import { UserManagementDetailComponent } from './user-management-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'setup/user',
        component: UserManagementListComponent,
        data: {
          title: 'User List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'setup/user/:id',
        component: UserManagementDetailComponent,
        data: {
          title: 'User Detail'
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
export class UserManagementRoutingModule { }
