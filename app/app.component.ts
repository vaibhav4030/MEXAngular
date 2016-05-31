import {Component} from '@angular/core';
import { RouteConfig, RouterLink, Router } from '@angular/router-deprecated';

import {LoggedInRouterOutlet} from './LoggedInOutlet';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
    selector: 'my-app',
    directives : [ LoggedInRouterOutlet ],    
    // template : `<login>`
    templateUrl : './app/app.html'
}) 

// @Routes ([
//   {path : '/', component : LoginComponent  },
//   {path : '/dashboard', component : DashboardComponent}  
// ])

@RouteConfig ([
  {path : '/', name: 'root', redirectTo : ["/Dashboard"]  },
  {path : '/login', name: 'Login', component : LoginComponent  },
  {path : '/dashboard', name: 'Dashboard', component : DashboardComponent}  
])

export class AppComponent { 
   namei : string = 'youtube';
}
