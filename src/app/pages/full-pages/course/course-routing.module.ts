import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseListComponent } from './course-list/list.component';
import { CourseDetailComponent } from './course-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'administration/course',
        component: CourseListComponent,
        data: {
          title: 'Course List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'administration/course/:id',
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
