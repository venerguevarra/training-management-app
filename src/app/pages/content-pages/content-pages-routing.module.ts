import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../../shared/auth/auth-guard.service';

import { LoginPageComponent } from "./login/login-page.component";
import { RegistrationPageComponent } from "./registration/registration.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        data: {
          title: 'Login Page'
        }
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'registration',
        component: RegistrationPageComponent,
        data: {
          title: 'Registration Page'
        }
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule { }
