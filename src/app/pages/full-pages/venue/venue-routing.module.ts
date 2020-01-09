import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenueListComponent } from './venue-list/list.component';
import { VenueDetailComponent } from './venue-detail/detail.component';

import { AuthGuard } from '../../../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'venue',
        component: VenueListComponent,
        data: {
          title: 'Venue List'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'venue/:id',
        component: VenueDetailComponent,
        data: {
          title: 'Venue Detail'
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
export class VenueRoutingModule { }
