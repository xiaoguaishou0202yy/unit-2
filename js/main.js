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
var dataStats={};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var region of data.features){
        //loop through each year

        var years=[1995,2005,2010,2015,2020,2021,2022];
            for (var year in years) {
                //get population for current year
                var value = Number(String(region.properties[years[year]+"_ImCIF"]).replaceAll(',','')); 
                allValues.push(value);
            } 

    
    //add value to array
    }

    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

}


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.5;
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

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

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[0];
    this.importsCIF = this.properties[attribute];
    this.formatted = "<p><b>Region:</b> " + this.properties.Region + "</p><p><b>Imports CIF in " + this.year + ":</b> " + this.importsCIF + " millions of US dollars</p>";
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    //console.log(attribute);


    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(String(feature.properties[attribute]).replaceAll(',',''));

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    var popupContent = new PopupContent(feature.properties, attribute);

    //create another popup based on the first
    var popupContent2 = Object.create(popupContent);

    //change the formatting of popup 2
    popupContent2.formatted = "<h2>" + popupContent.importsCIF + " millions of dollars</h2>";

    //add popup to circle marker    
    layer.bindPopup(popupContent2.formatted);

    console.log(popupContent.formatted) //original popup content

    //bind the popup to the circle marker
    layer.bindPopup(popupContent2.formatted, {
        offset: new L.Point(0,-options.radius) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Create new sequence controls
function createSequenceControls(attributes){

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // ... initialize other DOM elements
            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());    // add listeners after adding control}

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
            //console.log(index);

            updatePropSymbols(attributes[index]);

        })
    })

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        //get the new index value
        var index = this.value;
        console.log(index);
        updatePropSymbols(attributes[index]);
    });

};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    var year = attribute.split("_")[0];
    //update temporal legend
    document.querySelector("span.year").innerHTML = year;

    //attribute=attributes[index]
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attribute values
            Numattr=Number(String(props[attribute]).replaceAll(',',''))
            var radius = calcPropRadius(Numattr);

            layer.setRadius(radius);

            if (Numattr>100000) {
                
                var radius=calcPropRadius(Numattr);
                layer.setRadius(radius);
                layer.setStyle({fillColor:"#ff7800"});
                console.log(radius)
            } else if (Numattr>10000) {
                layer.setRadius(5);
                layer.setStyle({fillColor:"#ff7800"});
            } else {
                layer.setRadius(5);
                layer.setStyle({fillColor:"#ffffff"});
            }

            var popupContent = new PopupContent(props, attribute);  

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();
        };

    })

    updateLegend(attribute);
};

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
            container.innerHTML = '<p class="temporalLegend">Population in <span class="year">1995</span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="100px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 99 - radius;

                //circle string
                svg +=
                '<circle class="legend-circle" id="' +
                circles[i] +
                '" r="' +
                radius +
                '"cy="' +
                cy +
                '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';

                //evenly space out labels
                var textY = i * 20 + 20;

                //text string
                svg +=
                '<text id="' +
                circles[i] +
                '-text" x="65" y="' +
                textY +
                '">' +
                Math.round(dataStats[circles[i]] * 100) / 100 +
                " million" +
                "</text>";
            };

            //close svg string  
            svg += "</svg>"; 

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    
};


function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
      max = -Infinity;
  
    map.eachLayer(function (layer) {
      //get the attribute value
      if (layer.feature) {
        var attributeValue = Number(String(layer.feature.properties[attribute]).replaceAll(',',''));
        //test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //set mean
    var mean = (max + min) / 2;
  
    //return values as an object
    return {
      max: max,
      mean: mean,
      min: min,
    };
  }





function updateLegend(attribute) {
    //create content for legend
    var year = attribute.split("_")[0];
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
  
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(attribute);
  
    for (var key in circleValues) {
      //get the radius
      var radius = calcPropRadius(circleValues[key]);
  
      document.querySelector("#" + key).setAttribute("cy", 99 - radius);
      document.querySelector("#" + key).setAttribute("r", radius)
  
      document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100) / 100 + " million";
  
      /*$("#" + key).attr({
        cy: 59 - radius,
        r: radius,
      });
  
      $("#" + key + "-text").text(
        Math.round(circleValues[key] * 100) / 100 + " million"
      );*/
    }
  }

//Above Example 3.10...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("ImCIF") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    //console.log(attributes);

    return attributes;
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    fetch("data/Imports_Exports_Regions.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){ 
            //calculate minimum data value
            var attributes = processData(json);
            calcStats(json);
            //call function to create proportional symbols
            createPropSymbols(json,attributes);
            createSequenceControls(attributes);
            createLegend(attributes)
        })           

};

document.addEventListener('DOMContentLoaded',createMap)