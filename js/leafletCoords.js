let imageObj = new Image();
imageObj.src = '../images/teste.png';
let pathsRoute = [];
let markers = [];

function getMaxBounds(){
  return L.latLngBounds(L.latLng(imageObj.height, imageObj.width), L.latLng(0,0));
}
 
const map = L.map('map', {
  crs: L.CRS.Simple,
  maxBounds: getMaxBounds(),
  zoom: 0,
  minZoom: -3
});

let route = new L.polyline(pathsRoute, {
  color: "#51CFFE",
  weight: "1.5",
  dashArray: "1.5, 2.5",
  dashOffset: "0",
}).addTo(map);
let imageOverlay = L.imageOverlay(imageObj.src, getMaxBounds()).addTo(map);
map.fitBounds(getMaxBounds());

map.on('click', (e)=> {
  pathsRoute.push([e.latlng.lat, e.latlng.lng]);
  updateMarkers();
  updateRoute();
  console.log(pathsRoute);
});

function updateMarkers(){
  markers.map(marker => marker.remove());
  pathsRoute.map((coords, index)=>{
    markers.push(
      L.marker(coords, {draggable: true, title: `${index}`})
        .on('drag', updatePointCoords.bind(this, index))
        .on('contextmenu', deletePoint.bind(this, index))
        .addTo(map)
    );
  });
}

function updatePointCoords(index, event){
  let newCoords = event.target && event.target._latlng;
  pathsRoute[index] = [newCoords.lat, newCoords.lng];
  updateRoute();
}

function deletePoint(index, event){
  pathsRoute.splice(index, 1);
  updateMarkers();
  updateRoute();
}

function updateRoute(){
  route.setLatLngs(pathsRoute);
  route.redraw();
}

function exportPaths(){
  leafletCoords = pathsRoute.map(path => transformCoordinatesToLeaflet(path));
  let string = `${
    pathsRoute.map(path=>{
      return '['+path+'],' + '\n'
    })
  }`.replaceAll(',[', '[');
  
  let blob = new Blob([string], {type: "text/plain:charset=utf-8"});
  saveAs(blob, 'routes.json');
}
function copyPathsToClipBoard(){
  leafletCoords = pathsRoute.map(path => transformCoordinatesToLeaflet(path));
  let string = `${
    leafletCoords.map(path=>{
      return '['+path+'],' + '\n'
    })
  }`.replaceAll(',[', '[');

  navigator.clipboard.writeText(string);
}

function transformCoordinatesToLeaflet(coords){
  let y = imageObj.height - Math.round(coords[0]);
  let x = Math.round(coords[1]);
  let result = [x,y];
  return result;
}


