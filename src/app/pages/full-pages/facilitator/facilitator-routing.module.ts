import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilitatorListComponent } from './facilitator-list/list.component';
import { FacilitatorDetailComponent } from './facilitator-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'facilitator',
        component: FacilitatorListComponent,
        data: {
          title: 'Facilitator List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'facilitator/:id',
        component: FacilitatorDetailComponent,
        data: {
          title: 'Facilitator Detail'
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
export class FacilitatorRoutingModule { }
