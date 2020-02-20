// Pre-define d3 to avoid error messages in glitch
var d3;

// Colors per Car type
const colorScale = d3
  .scaleOrdinal()
  .domain(["SUV", "Minivan", "Sedan", "Sports Car", "Wagon"])
  .range(d3.schemeSet2);

// Define shapes
const circle = d3.symbol().type(d3.symbolCircle)(),
  triangle = d3.symbol().type(d3.symbolTriangle)(),
  square = d3.symbol().type(d3.symbolSquare)();

// Shapes per Drive type
const symbolScale = d3
  .scaleOrdinal()
  .domain(["AWD", "RWD", "FWD"])
  .range([triangle, circle, square]);

// Waiting until document has loaded
window.onload = () => {
  // Define constants
  //
  //  |---------- totalWidth ----------|
  //  +--------------------------------+  -
  //  |            padding             |  |
  //  |   +------------------------+   |  |
  //  |   |<------ plotWidth ---|->|   |  |
  //  |   |                     |  |   |  totalHeight
  //  |   |            plotHeight  |   |  |
  //  |   |                     |  |   |  |
  //  |   |                     |  |   |  |
  //  |   +------------------------+   |  |
  //  |                                |  |
  //  +--------------------------------+  -

  const totalWidth = 1000, totalHeight = 500;
  const padding = {
    top: 10,
    right: 30,
    bottom: 40,
    left: 50
  };
  const plotWidth = totalWidth - padding.left - padding.right;
  const plotHeight = totalHeight - padding.top - padding.bottom;

  // Setup hook to container
  //  +----------------------+
  //  |         body         |
  //  |  +----------------+  |
  //  |  |   container    |  |
  //  |  |  +----------+  |  |
  //  |  |  |   svg    |  |  |
  //  |  |  +----------+  |  |
  //  |  |                |  |
  //  |  +----------------+  |
  //  |                      |
  //  +----------------------+

  const container = d3.select("#scatter-plot");

  // Setup SVG element
  const svg = container
    .append("svg") // append SVG element to #scatter-plot
    .attr("width", totalWidth) // set the width of SVG
    .attr("height", totalHeight) // set the height of SVG

  // Setup main SVG g element; this g element will contain the other g elements
  const g = svg
    .append("g") // main g element
    .attr("transform", `translate(${padding.left} ${padding.top})`); // translate g to proper space

  // Setup axes and their labels
  //
  //
  // Setup X-axis group
  const xAxisGroup = g
    .append("g")
    .classed("axes", true)
    .attr("transform", `translate(0 ${plotHeight})`);

  // Setup X-axis
  const xScale = d3.scaleLinear().range([0, plotWidth]);

  // Setup X-axis label
  g.append("text")
    .classed("axes-label", true)
    .attr(
      "transform",
      `translate(${plotWidth * 0.5} ${plotHeight + padding.bottom})`
    )
    .attr("text-anchor", "middle")
    .text("Retail Price");

  // Setup Y-axis group
  const yAxisGroup = g
    .append("g")
    .classed("axes", true)
    .attr("transform", `translate(0 0)`)
    .attr("dy", -4); // adjust distance from bottom edge

  // Setup Y-axis
  const yScale = d3.scaleLinear().range([plotHeight, 0]);

  // Setup Y-axis label
  g.append("text")
    .classed("axes-label", true)
    .attr(
      "transform",
      `translate(${-padding.left} ${plotHeight * 0.5}) rotate(270)`
    )
    .attr("dy", 12) // adjust distance from left edge
    .attr("text-anchor", "middle")
    .text("Horsepower");

  // Generate number of ticks
  const xTicks = Math.round(plotWidth / 90);
  const yTicks = Math.round(plotHeight / 50);

  // Setup the tooltip for details
  const tip = d3
    .tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      return `
        Name: ${d.name}<br/>
        Retail Price: ${d.retail_price}<br/>
        Horsepower: ${d.horsepower}<br/>
        Engine Size (l): ${d.engine_size}<br/>
        Cylinders: ${d.cylinders}<br/>
        City Miles Per Gallon: ${d.city_mileage}<br/>
        Highway Miles Per Gallon: ${d.highway_mileage}<br/>
      `;
    });

  svg.call(tip); // call the tootltip

  // Setup the symbol legend
  svg
    .append("g")
    .attr("class", "legendSymbol")
    .attr("transform", `translate(${plotWidth * 0.7} ${plotHeight * 0.7})`);

  const legendSymbolPath = d3
    .legendSymbol()
    .scale(symbolScale)
    .labelWrap(30)
    .title("Symbol Legend");

  svg.select(".legendSymbol").call(legendSymbolPath);

  // Setup the color legend
  svg
    .append("g")
    .attr("class", "legendColor")
    .attr("transform", `translate(${plotWidth * 0.85} ${plotHeight * 0.7})`);

  const legendColorPath = d3
    .legendColor()
    .scale(colorScale)
    .labelWrap(30)
    .title("Color Legend");

  svg.select(".legendColor").call(legendColorPath);

  // Setup data
  d3.csv("https://imld.de/docs/lehre/ws_18-19/data-vis/data/cars.csv").then(
    function(data) {
      // coerce requried fields to integers
      data.forEach(function(i) {
        i.name = i.Name;
        i.type = i.Type;
        i.awd = +i.AWD;
        i.rwd = +i.RWD;
        i.retail_price = +i["Retail Price"];
        i.engine_size = +i["Engine Size (l)"];
        i.cylinders = +i.Cyl;
        i.horsepower = +i["Horsepower(HP)"];
        i.city_mileage = +i["City Miles Per Gallon"];
        i.highway_mileage = +i["Highway Miles Per Gallon"];
      });

      // Compute the scales’ domains
      xScale
        .domain(
          d3.extent(data, function(d) {
            return d.retail_price;
          })
        )
        .nice(); // set the X-axis to be Retail Price

      yScale
        .domain(
          d3.extent(data, function(d) {
            return d.horsepower;
          })
        )
        .nice(); // set the Y-axis to be Horsepower

      // Add the X-axis
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(xTicks)
        .tickPadding(10)
        .tickSizeInner(-plotHeight) // draw complete lines
        .tickSizeOuter(0); // no ticks outside

      // Add the Y-axis
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(yTicks)
        .tickPadding(10)
        .tickSizeInner(-plotWidth) // draw complete lines
        .tickSizeOuter(0); // no ticks outside

      // Draw the axes
      yAxisGroup.call(yAxis);
      xAxisGroup.call(xAxis);

      // Add the data points
      svg
        .selectAll(".point")
        .data(data)
        .enter()
        .append("path")
        .classed("point", true)
        .attr(
          "d",
          d3
            .symbol()
            .type(function(d) {
              // shape according to drive type
              if (d.awd == 1 && d.rwd == 0) {
                return d3.symbolTriangle; // AWD => Triangle
              } else if (d.awd == 0 && d.rwd == 1) {
                return d3.symbolCircle; // RWD => Circle
              } else if (d.awd == 0 && d.rwd == 0) {
                return d3.symbolSquare; // FWD => Square
              }
            })
            .size(() => {
              return 128;
            }) // increase the mark size
        )
        .attr("transform", d => {
          // shift the points according to the padding to scale properly
          return `translate(
                ${xScale(d.retail_price) + padding.left}
                ${yScale(d.horsepower) + padding.top}
          )`;
        })
        .style("fill", d => {
          return colorScale(d.type);
        }) // color according to type of vehicle
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
      
//       // Pan and zoom
//       const zoom = d3.zoom()
//         .scaleExtent([.5, 20])
//         .extent([[0, 0], [plotWidth, plotHeight]])
//         .on("zoom", zoomed);
      
//       function zoomed() {
//         // create new scale ojects based on event
//         var new_xScale = d3.event.transform.rescaleX(xScale);
//         var new_yScale = d3.event.transform.rescaleY(yScale);
        
//         // update axes
//         xAxisGroup.call(xAxis.scale(new_xScale));
//         yAxisGroup.call(yAxis.scale(new_yScale));
//         svg
//         .selectAll(".point").data(data)
//         .attr("transform", d => {
//           var new_x_scale = new_xScale(d.retail_price + padding.left);
//           var new_y_scale = new_xScale(d.retail_price + padding.left);
          
//           return `translate(${new_x_scale} ${new_y_scale})`;
//         });
//       }
      
    }
  );
};
