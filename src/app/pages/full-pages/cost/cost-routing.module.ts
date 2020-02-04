import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CostListComponent } from './cost-list/list.component';
import { CostDetailComponent } from './cost-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'administration/cost',
        component: CostListComponent,
        data: {
          title: 'Cost List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'administration/cost/:id',
        component: CostDetailComponent,
        data: {
          title: 'Cost Detail'
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
export class CostRoutingModule { }
