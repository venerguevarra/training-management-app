import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseRegistrationComponent } from './course-registration/course-registration.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'administration/course-registration',
        component: CourseRegistrationComponent,
        data: {
          title: 'Course Registration'
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
export class CourseRegistrationRoutingModule { }
