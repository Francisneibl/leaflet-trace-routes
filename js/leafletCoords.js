let imageObj = new Image();
let pathsRoute = [];
let markers = [];
let map = null;
let route = null;
let imageOverlay = null;
let dashArray = '1'

function getMaxBounds(){
  return L.latLngBounds(L.latLng(imageObj.height, imageObj.width), L.latLng(0,0));
}
function initializeMap(){
  map = L.map('map', {
    crs: L.CRS.Simple,
    maxBounds: getMaxBounds(),
    minZoom: -3
  });
  map.setZoom(map.getBoundsZoom(getMaxBounds(), false));
  
  route = new L.polyline(pathsRoute, {
    color: "#51CFFE",
    weight: "1.5",
    dashArray: "1.5, 2.5",
    dashOffset: "0",
  }).addTo(map);
  imageOverlay = L.imageOverlay(imageObj.src, getMaxBounds()).addTo(map);
  map.fitBounds(getMaxBounds());
  map.on('click', (e)=> {
    pathsRoute.push([e.latlng.lat, e.latlng.lng]);
    updateMarkers();
    updateRoute();
    console.log(pathsRoute);
  });
}
function changeMap(){
  map.setMaxBounds(getMaxBounds());
  map.setZoom(map.getBoundsZoom(getMaxBounds(), false));
  imageOverlay.setUrl(imageObj.src);
  imageOverlay.setBounds(getMaxBounds());
  pathsRoute = [];
  updateMarkers();
  updateRoute();
}
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

const inputImage = document.getElementById('image-map');
inputImage.addEventListener('change', (e)=>{
  let file = e.target.files[0];
  const reader = new FileReader();
  imageObj.onload = (_)=>{
    if(!map){
      initializeMap()
      return;
    }
    changeMap()
  }
  imageObj.src = URL.createObjectURL(file);
});

const buttonOpenSetting = document.getElementById('button-drawer-settings');
buttonOpenSetting.addEventListener('click', (e)=>{
  const drawerSetting = document.getElementById('drawer-settings');
  const navBar = document.getElementById('nav-bar');
  navBar.toggleAttribute('transform');
  drawerSetting.toggleAttribute('open');
});

const selectStyleRoutes = document.getElementById('select-style');
const dropDownContent = document.getElementById('drop-down-styles');
selectStyleRoutes.addEventListener('click',(e)=>{
  dropDownContent.toggleAttribute('show');
});

const styleItems = document.getElementsByClassName('style-item');
if(styleItems.length > 0){
  for(item of styleItems){
    item.addEventListener('click', onChangeStyleRoute.bind(this, item))
  }
}

function onChangeStyleRoute(item, e){
  if(e.target.tagName == 'svg'){
    dashArray = item.getAttribute('stroke-dasharray');
    selectStyleRoutes.children[0].remove();
    selectStyleRoutes.appendChild(e.target.cloneNode(true));
    dropDownContent.toggleAttribute('show');
  }
}