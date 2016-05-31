import {Component} from '@angular/core';
import { NgForm } from '@angular/common';
import { Router, RouterLink } from '@angular/router-deprecated';
import {Http, Headers} from '@angular/http';

import { LoginService } from '../services/login-service';

// import './rxjs-operators';
// import 'rxjs/add/operator';

@Component({
    selector: 'login',
    directives: [RouterLink],
    providers : [ LoginService ],
    // template: 'Login Form',
    templateUrl : './app/login/login.html' 
})
export class LoginComponent { 
    private _success : boolean = false;
    constructor(private _router: Router, private _service : LoginService ) {}    
    onSubmit(loginData : any) { 
       
        this._service.callLoginService(loginData.username,loginData.password)
                        .subscribe(
                        FIPS => this.loginSucceed(FIPS),
                        error => alert("login failed") );
                            
        // this._router.navigate(['Dashboard']);
       
     }
     private  loginSucceed(data : any) {
         console.log(data);
         this._success = true;  
         localStorage.setItem('jwt', data.id);
         console.log("dsfds");
         this._router.navigate(['Dashboard']);
     }
}