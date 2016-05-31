import {Component, ElementRef} from '@angular/core';

import { HeaderComponent } from './header/header.component';
import {FilterComponent} from './filter/filter.component';
import {TargetComponent} from './target/target.component';
import {GeoComponent} from './geo/geo.component';
import {GridComponent} from './grid/grid.component';

import { Router } from '@angular/router-deprecated';
import { AuthHttp } from 'angular2-jwt';

@Component({
    selector: 'dashboard',
    // styleUrls: ['./assets/css/geo.css'],
    directives : [HeaderComponent,FilterComponent,TargetComponent,GeoComponent,GridComponent],
    // template: 'Dashboard Form',
    templateUrl : './app/dashboard/dashboard.html'
})
export class DashboardComponent { 
    
    constructor(public _router: Router, public _authHttp: AuthHttp) {}    
    
   
}