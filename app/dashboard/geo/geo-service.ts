import {Injectable, ElementRef, OnChanges, Input, SimpleChange } from '@angular/core';
import { Router, RouterLink } from '@angular/router-deprecated';  
// import * as d3 from 'd3';
import {Http, Headers} from '@angular/http';

import { DashboardService } from '../../services/dashboard-service';  
import * as geo from '../geo/geo-service';  
declare var d3:any;
declare var queue:any;
declare var topojson:any ;

@Injectable()
export class GeoService {
    private elementRef: ElementRef;
    private service : DashboardService;	
    public width:number = 987;
    public height:number = 987;
    public centered:boolean = true;
    public projection:any; 
    public path:any;
    public svg:any;
    public g:any;
    public _tooltip_map_metric:string = 'unique devices';
    public tooltip:any;
    public pairImpsWithId = {};
    public pairNameWithId = {};
    public svg_data:any;
    public color:any;
    public color_domain:any;
    public color_range:any;
    public ext_color_domain:any;
    public legend_labels:any;
    public legend:any;
    public ls_w:number = 15;
    public ls_h:number = 15; 
    
   constructor(elementRef: ElementRef, _service : DashboardService) { 
       	this.elementRef = elementRef;
        this.service = _service;
        
        this.projection = d3.geo.albersUsa().scale(950).translate([this.width / 2, this.height / 2]); 
        this.path = d3.geo.path().projection(this.projection);
        this.svg = d3.select(this.elementRef.nativeElement).select("#area-chart").append("svg").attr("width", this.width).attr("height", this.height);
        this.svg.append("rect").attr("class", "background").attr("width", this.width).attr("height", this.height).on("click", this.clicked);
        this.g = this.svg.append("g");			
        this.tooltip = d3.select("body").append("div").attr("id", "mytooltip").style("position", "absolute").style("z-index", "10").style("visibility", "hidden").text("I am a tooltip");
        
    }
   
   loadGeo(){
        console.log()
        queue()
            .defer(d3.json, 'http://localhost:8012/dashboard/index.php/json/us')
            .defer(d3.json, "http://localhost:8012/dashboard/index.php/json/demo")
            .await(this.ready);
    }
    ready(error:any, us:any, data:any) {
        console.log(geo);
        var highestVal = 0;
        data.forEach( function(d:any) {
            this.pairImpsWithId[d.id] = +d.impressions;
            this.pairNameWithId[d.id] = d.name;			
            if(this.pairImpsWithId[d.id]>highestVal&&d.impressions!='NA') highestVal=this.pairImpsWithId[d.id];
        });

        // create map scale
        this.create_map_scale(highestVal);

        // console.log(topojson.feature(us, us.objects.counties).features);
        this.g.append("g")
        .attr("class", "map-borders")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", this.path)
        .attr("id", function (d:any) {
                return "county_"+d.id;
        })
        .style("fill" , function (d:any) {
            return this.color(this.pairImpsWithId[d.id]);
        })
        .style("opacity", 1)
        .on("click", this.clicked)
        .on("mouseover", this.hoverGeographyIn)
        .on("mousemove", this.hoverGeographyMove)
        .on("mouseout", this.hoverGeographyOut);
        
        this.g.append("path")
            .datum(topojson.mesh(us, us.objects.states))
            .attr("class", "state-borders")
            .attr("d", this.path);
    }
    
	create_map_scale(highestVal:number) {
			// get levels by dividing highest val by 5
			var pt0 = 1;
			var pt1 = Math.round(highestVal/5);
			if(pt1==0) pt1=1;
			var pt2 = Math.round(pt1/5);
			if(pt2==0) pt2=1;
			var pt3 = Math.round(pt2/5);
			if(pt3==0) pt3=1;
			var pt4 = Math.round(pt3/5);
			if(pt4==0) pt4=1;


			this.color_domain = [pt0, pt4, pt3, pt2, pt1];
			this.color_range = ["#EBEBEB", "#FFFFB2", "#FED976", "#FEB24C", "#FD8D3C", "#F93B20"];
			this.ext_color_domain = [0, pt0, pt4, pt3, pt2, pt1];

			// set progressive legends accordingly
			var lbl0 = "Missing / Filtered";
			var lbl1:any = (pt0)+" - "+(pt4-1);
				if(pt4-1==pt0||pt4-1==0) lbl1 = pt0;
			var lbl2:any = (pt4)+" - "+(pt3-1);
				if(pt3-1==pt4||pt3-1==0) lbl2 = (pt4);
			var lbl3:any = (pt3)+" - "+(pt2-1);
				if(pt2-1==pt3||pt2-1==0) lbl3 = (pt3);
			var lbl4:any = (pt2)+" - "+(pt1-1);
				if(pt1-1==pt2||pt1-1==0) lbl4 = (pt2);
			var lbl5:any = (pt1)+" - "+(highestVal);
				if(highestVal-1==pt1||highestVal<=1) lbl5 = (pt1);

			this.legend_labels = [lbl0, lbl1, lbl2, lbl3, lbl4, lbl5];

			// set total height
			var ls_ht = 350;

			// reduce the scale for same values (<1)
			for(var i = this.color_domain.length - 1; i > 0; i--) {
				
				if(this.color_domain[i] === 1) {
					
					this.color_domain.splice(i-1,1);
					this.color_range.splice(i,1);
					this.ext_color_domain.splice(i,1);
					this.legend_labels.splice(i,1);
					ls_ht = ls_ht+this.ls_h;
				}
			}

			this.color = d3.scale.threshold()
				.domain(this.color_domain)
				.range(this.color_range);

			if (this.legend) this.legend.remove();

			this.legend = this.g.selectAll("g.legend")
				.data(this.ext_color_domain)
				.enter().append("g")
				.attr("class", "legend legendData");

			this.legend.append("rect")
				.attr("x", 25)
				.attr("y", function(d:any, i:any){ return this.height - (i*this.ls_h) - 2*this.ls_h -ls_ht;})
				.attr("width", this.ls_w)
				.attr("height", this.ls_h)
				.style("fill", function(d:any, i:any) { return this.color(d); })
				.style("opacity", 1);

			this.legend.append("text")
				.attr("class", "legendTxt")
				.attr("x", 47)
				.attr("y", function(d:any, i:any){ return this.height - (i*this.ls_h) - this.ls_h - 4 -ls_ht;})
				.text(function(d:any, i:any){ return this.legend_labels[i]; });

		}
		clicked(d:any) { 
			var x:number, y:number, k:number;
			if (d && this.centered !== d) {
				var centroid = this.path.centroid(d);
				x = centroid[0];
				y = centroid[1];
				k = 4;
				this.centered = d;	
				// console.log(this.elementRef.nativeElement.querySelector('#zoomer'));
				// el.nativeElement.querySelector('#zoomer').show();
				// el.nativeElement.querySelector('.legend').hide();			
				// $("#zoomer").removeAttr("style");
				// $('.legend').hide();
				
			} else {
				x = this.width / 2;
				y = this.height / 2;
				k = 1;
				this.centered = false;	
				// console.log(ElementRef);
				// el.nativeElement.querySelector('#zoomer').hide();
				// el.nativeElement.querySelector('.legend').show();			
				// $("#zoomer").attr("style","display:none;");
				// $('.legend').show();
			}
			this.g.transition()
				.duration(750)
				.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 1.5 / k + "px");
				

				this.g.selectAll("path")
				.classed("active", this.centered && function(d:any) { return d === this.centered; });
			
		}
		
		hoverGeographyIn() {
			console.log("start");
			return this.tooltip.style("visibility", "visible");
		}
		
		hoverGeographyMove(d:any) {			
			var county_name = this.pairNameWithId[d.id];
			var county_imps = this.pairImpsWithId[d.id];	
			// console.log(pairImpsWithId);
			var htmlTxt:string;		
			if (isNaN(county_imps))
				htmlTxt = county_name+"<br />0 " + this._tooltip_map_metric;
			else 
				htmlTxt = county_name+"<br />"+(county_imps)+" " + this._tooltip_map_metric;
			
			/* change color of state on hover */
			d3.select(this)
				.transition().duration(0)
				.style("opacity", 0.7);
					
			return this.tooltip
				.html(htmlTxt)
				.style("top",(d3.event.pageY -25)+"px")
				.style("left",(d3.event.pageX +25)+"px");
				
		}
				
		hoverGeographyOut() {			
			d3.select(this).transition().duration(800).style("opacity", 1);
			return this.tooltip.style("visibility", "hidden");
		}  
    
}

