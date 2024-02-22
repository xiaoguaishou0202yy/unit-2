// Add all scripts to the JS folder
/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};


//Flannery scaling ratio
var minValue;

function calcMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var region of data.features){
        //loop through each year

        var years=[1995,2005,2010,2015,2020,2021,2022];
            for (var year in years) {
                //get population for current year
                var value = Number(String(region.properties[years[year]+"_ImCIF"]).replaceAll(',','')); 
                //add value to array
                console.log(years[year]+"_ImCIF",value)
                allValues.push(value);
            } 

    
    //add value to array
    }

    //console.log(allValues)

    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data){
    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "1995_ImCIF";

    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(String(feature.properties[attribute]).replace(',',''));

            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: onEachFeature
    }).addTo(map);
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/Imports_Exports_Regions.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){ 
            //calculate minimum data value
            minValue = calcMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })           

};

document.addEventListener('DOMContentLoaded',createMap)