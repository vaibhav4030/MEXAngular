import {Component, ElementRef, OnChanges, Input, SimpleChange } from '@angular/core';
import { Router, RouterLink } from '@angular/router-deprecated';  
// import * as d3 from 'd3';
import {Http, Headers} from '@angular/http';

import { DashboardService } from '../../services/dashboard-service';  

declare var d3:any;
declare var queue:any;
declare var topojson:any ;

@Component({
    selector: 'dashboard-geo',
	inputs : ['network'],
	providers : [ DashboardService ],
	templateUrl : './app/dashboard/geo/geo.html',
    // providers: [ElementRef]
})
export class GeoComponent { 
	 elementRef: ElementRef;
	 service : DashboardService;
    constructor(elementRef: ElementRef, _service : DashboardService) {
			this.elementRef = elementRef;
			this.service = _service;
	}
	ngOnChanges(changes: {[propName: string]: SimpleChange}) {
		console.log('onChanges');
		window.document.getElementById("area-chart").innerHTML = '';
		this.reloadGeo();	
	}
	ngOnInit() {
		window.document.getElementById("area-chart").innerHTML = '';
		this.reloadGeo();	
    }
	reset_map() {	
		var x:number, y:number, k:number;	
		var width:number = 807,    height:number = 400,    centered:boolean = true;	
		x = width / 2;
		y = height / 2;
		k = 1;
		centered = null;
		
		g.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		.style("stroke-width", 1.5 / k + "px");
		
		$("#zoomer").attr("style","display:none;");
		$('.legend').show();
	}
    reloadGeo(){
		console.log(this);
		window.document.getElementById("zoomer").hidden = true;
		var el = this.elementRef;
		var width:number = 807,    height:number = 400,    centered:boolean = true;
		var projection = d3.geo.albersUsa().scale(720).translate([width / 2, height / 2]); 
		var path = d3.geo.path().projection(projection);
		var svg = d3.select(this.elementRef.nativeElement).select("#area-chart").append("svg").attr("width", width).attr("height", height);
		svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", clicked);;
		
		var g = svg.append("g");
		var _tooltip_map_metric = 'unique devices';
		var tooltip = d3.select("body").append("div").attr("id", "mytooltip").style("position", "absolute").style("z-index", "10").style("visibility", "hidden").text("I am a tooltip");
		
		var pairImpsWithId = {};
		var pairNameWithId = {};
		var svg_data:any;
		var color:any;
		var color_domain:any, color_range:any, ext_color_domain:any, legend_labels:any;
		var legend:any;
		
		var ls_w = 15, ls_h = 15;
		
		queue()
		.defer(d3.json, 'http://localhost:8012/dashboard/index.php/json/us')
		.defer(d3.json, "http://localhost:8012/dashboard/index.php/json/demo")
		.await(ready);
		function ready(error:any, us:any, data:any) {
			
			var highestVal = 0;
			data.forEach( function(d:any) {
				pairImpsWithId[d.id] = +d.impressions;
				pairNameWithId[d.id] = d.name;			
				if(pairImpsWithId[d.id]>highestVal&&d.impressions!='NA') highestVal=pairImpsWithId[d.id];
			});
	
			// create map scale
			create_map_scale(highestVal);
	
			// console.log(topojson.feature(us, us.objects.counties).features);
			g.append("g")
			.attr("class", "map-borders")
			.selectAll("path")
			.data(topojson.feature(us, us.objects.counties).features)
			.enter().append("path")
			.attr("d", path)
			.attr("id", function (d:any) {
					return "county_"+d.id;
			})
			.style("fill" , function (d:any) {
				return color(pairImpsWithId[d.id]);
			})
			.style("opacity", 1)
			.on("click", clicked)
			.on("mouseover", hoverGeographyIn)
			.on("mousemove", hoverGeographyMove)
			.on("mouseout", hoverGeographyOut);
			
			g.append("path")
				.datum(topojson.mesh(us, us.objects.states))
				.attr("class", "state-borders")
				.attr("d", path);
		}
		
		function create_map_scale(highestVal:number) {

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


			color_domain = [pt0, pt4, pt3, pt2, pt1];
			color_range = ["#EBEBEB", "#FFFFB2", "#FED976", "#FEB24C", "#FD8D3C", "#F93B20"];
			ext_color_domain = [0, pt0, pt4, pt3, pt2, pt1];

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

			legend_labels = [lbl0, lbl1, lbl2, lbl3, lbl4, lbl5];

			// set total height
			var ls_ht = 250;

			// reduce the scale for same values (<1)
			for(var i = color_domain.length - 1; i > 0; i--) {
				
				if(color_domain[i] === 1) {
					
					color_domain.splice(i-1,1);
					color_range.splice(i,1);
					ext_color_domain.splice(i,1);
					legend_labels.splice(i,1);
					ls_ht = ls_ht+ls_h;
				}
			}

			color = d3.scale.threshold()
				.domain(color_domain)
				.range(color_range);

			if (legend) legend.remove();

			legend = g.selectAll("g.legend")
				.data(ext_color_domain)
				.enter().append("g")
				.attr("class", "legend legendData");

			legend.append("rect")
				.attr("x", 25)
				.attr("y", function(d:any, i:any){ return height - (i*ls_h) - 2*ls_h -ls_ht;})
				.attr("width", ls_w)
				.attr("height", ls_h)
				.style("fill", function(d:any, i:any) { return color(d); })
				.style("opacity", 1);

			legend.append("text")
				.attr("class", "legendTxt")
				.attr("x", 47)
				.attr("y", function(d:any, i:any){ return height - (i*ls_h) - ls_h - 4 -ls_ht;})
				.text(function(d:any, i:any){ return legend_labels[i]; });

		}
		function clicked(d:any) { 
			var x:number, y:number, k:number;

			if (d && centered !== d) {
				var centroid = path.centroid(d);
				x = centroid[0];
				y = centroid[1];
				k = 4;
				centered = d;	
				window.document.getElementById("zoomer").hidden = false;
				var legendLength = window.document.getElementsByClassName("legend");
				for (var i = 0; i < legendLength.length; i++) {
						legendLength[i].setAttribute("style","display:none");
				}
				// el.nativeElement.
				// el.nativeElement('#zoomer').show();
				// el.nativeElement('.legend').hide();
				// this.elementRef("#zoomer").removeAttr("style");
				// this.elementRef(".legend").hide();			
				// jquery("#zoomer").removeAttr("style");
				// jQuery('.legend').hide();
				
			} else {
				x = width / 2;
				y = height / 2;
				k = 1;
				centered = false;	
				window.document.getElementById("zoomer").hidden = true;
				var legendLength = window.document.getElementsByClassName("legend");
				for (var i = 0; i < legendLength.length; i++) {
						legendLength[i].removeAttribute("style");
				}
			}
			g.transition()
				.duration(750)
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
				.style("stroke-width", 1.5 / k + "px");
				

				g.selectAll("path")
				.classed("active", centered && function(d:any) { return d === centered; });
			
		}
		
		function hoverGeographyIn() {
			return tooltip.style("visibility", "visible");
		}
		
		function hoverGeographyMove(d:any) {			
			var county_name = pairNameWithId[d.id];
			var county_imps = pairImpsWithId[d.id];	
			// console.log(pairImpsWithId);
			var htmlTxt:string;		
			if (isNaN(county_imps))
				htmlTxt = county_name+"<br />0 " + _tooltip_map_metric;
			else 
				htmlTxt = county_name+"<br />"+(county_imps)+" " + _tooltip_map_metric;
			
			/* change color of state on hover */
			d3.select(this)
				.transition().duration(0)
				.style("opacity", 0.7);
					
			return tooltip
				.html(htmlTxt)
				.style("top",(d3.event.pageY -25)+"px")
				.style("left",(d3.event.pageX +25)+"px");
				
		}
				
		function hoverGeographyOut() {			
			d3.select(this).transition().duration(800).style("opacity", 1);
			return tooltip.style("visibility", "hidden");
		}
		
	}
    
}