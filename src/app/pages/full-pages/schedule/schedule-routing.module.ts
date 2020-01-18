import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleListComponent } from './schedule-list/list.component';
import { ScheduleDetailComponent } from './schedule-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'schedule',
        component: ScheduleListComponent,
        data: {
          title: 'Schedule List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'schedule/:id',
        component: ScheduleDetailComponent,
        data: {
          title: 'Schedule'
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
export class ScheduleRoutingModule { }
