import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryListComponent } from './inquiry-list/list.component';
import { InquiryDetailComponent } from './inquiry-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'inquiry',
        component: InquiryListComponent,
        data: {
          title: 'Inquiry List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'inquiry/:id',
        component: InquiryDetailComponent,
        data: {
          title: 'Inquiry Detail'
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
export class InquiryRoutingModule { }
