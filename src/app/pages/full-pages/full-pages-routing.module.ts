import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ScheduleCalendarComponent } from './schedule-calendar/schedule-calendar.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CourseParticipantListComponent } from './course-participant-list/course-participant-list.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuard } from '../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          title: 'Dashboard'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'training-calendar',
        component: ScheduleCalendarComponent,
        data: {
          title: 'Training Calendar'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        data: {
          title: 'User Profile'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        data: {
          title: 'Change Password'
        },
        canActivate: [AuthGuard]
      },
      {
        path: '',
        component: CourseParticipantListComponent,
        data: {
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
export class FullPageRoutingModule { }
