import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseListComponent } from './list/list.component';
import { CourseDetailComponent } from './detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'course',
        component: CourseListComponent,
        data: {
          title: 'Course List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'course/:id',
        component: CourseDetailComponent,
        data: {
          title: 'Course Detail'
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
export class CourseRoutingModule { }
