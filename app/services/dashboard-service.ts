import {Injectable} from '@angular/core';
import {Http, Response, Headers } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable }     from 'rxjs/Observable';

@Injectable()
export class DashboardService {
    
   constructor(private http:Http) { console.log("Dashboard Service"); }
   
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
    
  // getUsDataMap() : Observable<any> { 
  //       var headers = new Headers();
  //       headers.append('Content-Type', 'application/json');
  //       var url = 'http://localhost:8012/dashboard/index.php/json/us';
  //       return this.http.get(url,{  headers: headers})
  //                       .map(this.extractData)
  //                       .catch(this.handleError);
  //  }    
    
}

