import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketingInquiryListComponent } from './marketing-inquiry-list/list.component';
import { MarketingInquiryDetailComponent } from './marketing-inquiry-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'marketing-inquiry',
        component: MarketingInquiryListComponent,
        data: {
          title: 'Marketing Inquiry List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'marketing-inquiry/:id',
        component: MarketingInquiryDetailComponent,
        data: {
          title: 'Marketing Inquiry Detail'
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
export class MarketingInquiryRoutingModule { }
