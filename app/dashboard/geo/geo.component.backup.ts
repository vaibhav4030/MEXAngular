import {Component, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router-deprecated';  
// import * as d3 from 'd3';
import {Http, Headers} from '@angular/http';

import { DashboardService } from '../../services/dashboard-service';  

import {GeoService} from '../geo/geo-service';

@Component({
    selector: 'dashboard-geo',
	providers : [ DashboardService,GeoService ],
	templateUrl : './app/dashboard/geo/geo.html',
    // providers: [ElementRef]
})
export class GeoComponentBackup  { 
	
	 private elementRef: ElementRef;
	 private service : GeoService;
	 
    constructor(elementRef: ElementRef, _service : GeoService) {
			this.elementRef = elementRef;
			this.service = _service;	
			
	}
    ngOnInit() {
		this.service.loadGeo();
    }
    
   
}