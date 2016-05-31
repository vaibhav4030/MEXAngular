import {Injectable} from '@angular/core';
import {Http, Response, Headers } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable }     from 'rxjs/Observable';

@Injectable()
export class LoginService {
    
   constructor(private http:Http) { }
   
   private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }
  
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
    
  callLoginService (username : string ,password : string ) : Observable<any> { 
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        // headers.append('Authorization', 'Basic ' + btoa('admin:1234')); 
        // headers.append('X-API-KEY', '606060'); 
        // headers.append('Access-Control-Allow-Origin', 'http://localhost:3000'); 
        var authurl = 'http://180.92.171.93/BESTAPIS/api/etim/getAreas';
        var url = 'http://localhost:8012/login/';
        return this.http.post(url,JSON.stringify({'username' : username, 'password': password}), {  headers: headers})
                        .map(this.extractData)
                        .catch(this.handleError);
   }
    // private login(username : string,password : string){
    //     return this.http.get('http://api.conditionlocator.com/impressions')
    //                 .map(this.extractData)
    //                 .catch(this.handleError);        
      
    // }
    
}