// Add all scripts to the JS folder

/* Example from Leaflet Quick Start Guide*/

var map = L.map('map').setView([51.505, -0.09], 13); //set the initial map view with center and zoom level

//add tile layer to the map using OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, //set maximum zoom level
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map); //add the tile layer to the map

var marker = L.marker([51.5, -0.09]).addTo(map); //add a marker to the map at specific position

var circle = L.circle([51.508, -0.11], { //add a circle to the map
    color: 'red', //outline color
    fillColor: '#f03',
    fillOpacity: 0.5,   
    radius: 500 
}).addTo(map);

var polygon = L.polygon([ //add a polygon to the map with specified coordinates
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//bind a popup message to the elements in the map
marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//create a standalone popup and open it at specific position
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//create a popup object
var popup = L.popup();

//function to handle map click events
function onMapClick(e) {
    popup
        .setLatLng(e.latlng) //set the popup position to the clicked location
        .setContent("You clicked the map at " + e.latlng.toString()) //set the popup content
        .openOn(map); //open the popup on the map
}

map.on('click', onMapClick); //add a click event listener to the map; call the opMapClick function when clicked