
var d3;

//Width and height of map
var widthMap = 960, heightMap = 500;

window.onload = () => {

	// D3 Projection
	var projection = d3.geo
						.albersUsa()
					   	.translate([widthMap/2, heightMap/2])
					   	.scale([1000]);
	        
	// Define path generator
	var path = d3.geo
				.path()
			  	.projection(projection);  

	//Create SVG element and append map to the SVG
	var svg = d3.select("body")
				.append("svg")
				.attr("width", widthMap)
				.attr("height", heightMap);
	        
	// Append a div for tooltip to SVG
	var divToolTip = d3.select("body")
			    .append("div")
	    		.attr("class", "tooltip")               
	    		.style("opacity", 0);

	// Load GeoJSON data and merge with states data
	d3.json("us-states.json", function(usStates) {
		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
			.data(usStates.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", "rgb(213,222,217)");
	});


	// Load in my states data!
	d3.csv("https://imld.de/docs/lehre/ws_18-19/data-vis/data/airports.csv", function(data) {
		svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.each(function (d) {
	            var location = projection([d.longitude, d.latitude]);
	            if (location != null) {
		            d3.select(this).attr({
		            	cx: location[0], 
		            	cy: location[1],
		            	r: 3
		            });
		        }
     		})
			.style("fill", "rgb(217,91,67)")
			.on("mouseover", function(d) {      
				divToolTip.transition()        
      	   			.duration(20);
           
				var toolTipText = `${d.city}, ${d.state} 
									(${d.latitude}, ${d.longitude})`;
           		divToolTip.text(toolTipText)
           			.style("left", (d3.event.pageX) + "px")     
           			.style("top", (d3.event.pageY - 28) + "px")
           			.style("opacity", 1);   
			})
		    .on("mouseout", function(d) {       
		    // fade out tooltip on mouse out
		        divToolTip.transition()
		           	.duration(5);
		    });
	});
}