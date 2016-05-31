import {Component} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
// import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/components/dropdown';

import { Router, RouterLink } from '@angular/router-deprecated';

@Component({
    selector: 'dashboard-header',
    directives: [ CORE_DIRECTIVES ],
    templateUrl : './app/dashboard/header/header.html' 
})
export class HeaderComponent { 
    constructor(private _router: Router) { }
    
     logout() {
        localStorage.removeItem('jwt');
        this._router.parent.navigateByUrl('/login');
    }
}