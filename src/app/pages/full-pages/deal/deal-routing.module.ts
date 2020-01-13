import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DealDetailComponent } from './deal-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'deal/:id',
        component: DealDetailComponent,
        data: {
          title: 'Deal Detail'
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
export class DealRoutingModule { }
