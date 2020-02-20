// Pre-define d3 to avoid error messages in glitch :)
var d3;

const width = 1500, height = 1000;
const nodeRadius = 2.5;

// Waiting until document has loaded
window.onload = () => {
  // YOUR CODE GOES HERE

  // Load the data sets from the following URLs:
  // Flight data set: https://imld.de/docs/lehre/ws_18-19/data-vis/data/flights-airport-5000+.csv
  // Airport data set: https://imld.de/docs/lehre/ws_18-19/data-vis/data/airports.csv

  // get the data
  d3.csv("https://imld.de/docs/lehre/ws_18-19/data-vis/data/flights-airport-5000.csv", function(error, links) {
    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.origin] || (nodes[link.origin] = {name: link.origin});
        link.target = nodes[link.destination] || (nodes[link.destination] = {name: link.destination});
        link.count =+ (link.count);
    });
    
    var force = d3.layout
        .force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(function(d) {
          return d.count/20;
        })
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // add the arrows
    svg
      .append("svg:defs")
      .selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
      .enter()
      .append("svg:marker")    // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    // add the links and the arrows
    var path = svg
      .append("svg:g")
      .selectAll("path")
      .data(force.links())
      .enter()
      .append("svg:path")
      .attr("class", "link")
      .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

    // add the nodes
    node
      .append("circle")
      .attr("r", nodeRadius);

    // add the text 
    node
      .append("text")
      .attr("x", 10)
      .attr("dy", ".65em")
      .text(function(d) { 
        return d.name; 
      });

    // add the curvy lines
    function tick() {
      path
        .attr("d", function(d) {
          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);  
          var tickValue = `M ${d.source.x}, ${d.source.y}A ${dr},${dr} 0 0,1 ${d.target.x}, ${d.target.y}`;
          return tickValue;
        });

        node.attr("transform", function(d) { 
          return `translate( ${d.x}, ${d.y})`; 
        });
    }
  });
}