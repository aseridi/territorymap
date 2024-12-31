import * as d3 from "d3";
import { FeatureCollection, Geometry } from "geojson";
import dividedData from "../data/dividedfile.json"; // New GeoJSON file

// Define interfaces for GeoJSON data and sales data
interface GeoJsonProperties {
  name: string;
  density?: number; // Optional density property
  salesRep?: string; // Optional sales representative name
  salesRepContact?: string; // Optional sales representative contact info
}

interface GeoJsonFeature {
  type: "Feature";
  properties: GeoJsonProperties;
  geometry: GeoJSON.Geometry;
}

interface GeoJson {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

interface SalesData {
  [stateName: string]: { salesRep: string; salesRepContact: string };
}

// Extract the states GeoJSON features
const states = dividedData as unknown as FeatureCollection<Geometry, GeoJsonProperties>;


// Define territories
const territories: { [territoryName: string]: string[] } = {
  Northeast: [
    "New York North",
    "New York South",
    "Vermont",
    "New Hampshire",
    "Connecticut",
    "Massachusetts",
    "New Jersey",
    "Rhode Island",
    "Maine",
  ],
  Midwest1: ["Michigan", "Indiana", "Ohio", "West Virginia","Pennsylvania West"],
  MidAtlantic: [
    "Pennsylvania East",
    "Maryland",
    "Delaware",
    "District of Columbia",
    "Virginia",
  ],
  Southeast1: ["North Carolina", "South Carolina", "Tennessee", "Kentucky"],
  Southeast2: ["Georgia", "Alabama", "Mississippi"],
  Florida: ["Florida"],
  Midwest2: [
    "North Dakota",
    "South Dakota",
    "Illinois",
    "Wisconsin",
    "Minnesota",
    "Iowa",
  ],
  SouthCentral1: ["Arkansas", "Oklahoma", "Missouri"],
  SouthCentral2: ["Louisiana", "Texas North"], // South of Fort Worth (need more precise data)
  TexasNorth: ["Texas South"], // North of Fort Worth (need more precise data)
  Northwest: ["Washington", "Oregon", "Idaho", "Montana", "Alaska"],
  MountainPlains: [
    "Utah",
    "Colorado",
    "New Mexico",
    "Wyoming",
    "Nebraska",
    "Kansas",
  ],
  Southwest: ["Arizona", "California South", "Nevada East", "Hawaii"], // South of Bay Area
  CaliforniaNorth: ["California North", "Nevada West"], // North of Bay Area
};

// Example sales data (replace with actual data)
const salesData: SalesData = {
  Alabama: { salesRep: "John Doe", salesRepContact: "john.doe@email.com" },
  Alaska: { salesRep: "Jane Smith", salesRepContact: "jane.smith@email.com" },
  // Add remaining states as needed
};

// Set SVG dimensions

const width = 960;

const height = 600;

const svg = d3
  .select("#map")

  .attr("width", width)

  .attr("height", height);

// Define projection

const projection = d3
  .geoAlbersUsa()

  .scale(1300)

  .translate([width / 2, height / 2]);

// Create geoPath function with projection

const path = d3.geoPath().projection(projection);

// Create tooltip element

const tooltip = d3
  .select("body")
  .append("div")

  .attr("class", "tooltip")

  .style("opacity", 0)

  .style("position", "absolute")

  .style("background", "white")

  .style("border", "1px solid grey")

  .style("border-radius", "5px")

  .style("padding", "10px")

  .style("pointer-events", "none");
// Draw states with data and interactivity
svg
  .append("g")
  .selectAll("path")
  .data(states.features) // Use features directly
  .enter()
  .append("path")
  .attr("d", (d) => path(d as GeoJSON.Feature<Geometry, GeoJsonProperties>) || "")
  .attr("fill", "#303642")
  .attr("stroke", "#f0e2d8")
  .attr("id", (d: GeoJsonFeature) => d.properties.name.replace(/ /g, ""))
  .on("mouseover", (event: MouseEvent, d: GeoJsonFeature) => {
    const currentStateName = d.properties.name;

    // Find the territory the current state belongs to
    let currentTerritory: string | undefined;
    for (const territory in territories) {
      if (territories[territory].includes(currentStateName)) {
        currentTerritory = territory;
        break;
      }
    }

    // Highlight states in the same territory
    if (currentTerritory) {
      for (const stateName of territories[currentTerritory]) {
        d3.select(`#${stateName.replace(/ /g, "")}`).attr(
          "fill",
          stateName === currentStateName ? "#25ade5" : "rgba(37, 173, 229, 0.5)"
        );
      }
    }

    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0.9);
    tooltip
      .html(
        `${d.properties.name}<br/>Sales Rep: ${
          salesData[d.properties.name]?.salesRep || "N/A"
        }<br/>Contact: ${
          salesData[d.properties.name]?.salesRepContact || "N/A"
        }`
      )
      .style("left", event.pageX + "px")
      .style("top", event.pageY - 28 + "px");
  })
  .on("mouseout", (event: MouseEvent, d: GeoJsonFeature) => {
    const currentStateName = d.properties.name;
    let currentTerritory: string | undefined;

    for (const territory in territories) {
      if (territories[territory].includes(currentStateName)) {
        currentTerritory = territory;
        break;
      }
    }

    if (currentTerritory) {
      for (const stateName of territories[currentTerritory]) {
        d3.select(`#${stateName.replace(/ /g, "")}`).attr("fill", "#303642");
      }
    }

    tooltip.transition().duration(500).style("opacity", 0);
  })
  .on("mousemove", (event: MouseEvent) => {
    tooltip.style("left", event.pageX + "px").style("top", event.pageY - 28 + "px");
  });