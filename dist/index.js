import * as d3 from "d3";
import usStates from "../data/us-states.json";
console.log(usStates);
// Define the dimensions of the map
var width = 960;
var height = 600;
// Define a tooltip
var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("font-size", "12px");
// Define the SVG canvas
var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
// Define a projection to convert coordinates to pixels
var projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
// Define a path generator using the projection
var path = d3.geoPath(); // Specify the generic type explicitly
// Load the GeoJSON file
d3.json("./data/us-states.json").then(function (data) {
    // Draw the map
    svg
        .selectAll("path")
        .data(data.features) // Use the features array in your GeoJSON
        .enter()
        .append("path")
        .attr("d", function (d) { return path(d) || ""; }) // Cast `d` to `GeoJSON.Feature`
        .attr("fill", "#ddd")
        .attr("stroke", "#333")
        .on("mouseover", function (event, d) {
        tooltip
            .html("\n        <strong>".concat(d.properties.name, "</strong><br>\n        Density: ").concat(d.properties.density, "\n      "))
            .style("visibility", "visible");
    })
        .on("mousemove", function (event) {
        tooltip
            .style("top", "".concat(event.pageY + 10, "px"))
            .style("left", "".concat(event.pageX + 10, "px"));
    })
        .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
    });
});
