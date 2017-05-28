L.mapbox.accessToken = 'pk.eyJ1Ijoic2ltb25jb3plbnMiLCJhIjoiY2ozNXFvMm1yMDFkcjMycGx4aDB0ODR5aCJ9.QcSlKzB7-abD8smOOacV_A';

var hideClass = {
   "Accessible": 1,
   "Bus Stop": 1,
   "Clearway": 1,
   "Loading Zone": 1,
   "Motorbike": 1,
   "No Parking": 1,
   "No Standing": 1,
   "Permit": 1,
   "Reserved": 1,
   "Restricted": 1,
   "Taxi Zone": 1
}

var hidden = function(feature) {
  parkingClass = feature.properties.class;
  if (parkingClass in hideClass) { return true }
  var minTime = $("input[name=how-long]:checked").val();
  var hideMetered = $("#hide-metered").is(":checked")
  if (feature.properties.parktime_mins > 0 && feature.properties.parktime_mins < minTime) {
    return true
  }
  if (hideMetered) {
    if (feature.properties.meternumber) { return true }
    if (parkingClass == "Multibay Metered" || parkingClass == "Metered") { return true }
  }
  return false;
}
var styleBay = function(feature) {
  if (hidden(feature)) {
    return { color: "#ffffff", opacity: 0.1 }
  }
  if (feature.properties.meternumber) {
    return { color: "#000000", opacity: 1 }
  }
    if (feature.properties.parktime_mins >= 180) {
        return {color: "#00ff00", opacity: 1};
    }
    if (feature.properties.parktime_mins >= 120) {
        return {color: "#00ffff", opacity: 1};
    }
    if (feature.properties.parktime_mins > 0 && feature.properties.parktime_mins < 15) {
        return {color: "#ff0000", opacity: 1};
    }
    return {color: "#000000", opacity: 1};
}

var createPopup = function (feature, layer) {
  var p = feature.properties
  if (!p) return;
  content = "";
  if (p.signinfo) {
    content = content + "<b>"+p.signinfo+"</b><br/>"
  }
  if (p.parktime_mins) {
    content = content + "<b>"+p.parktime_mins+" mins</b><br/>"
  }
  if (p.class && p.class != "Signed") {
    content = content + "<b>Type</b>: "+p.class+"<br/>"
  }
  if (p.baynumber) {
    content = content + "<b>Bay Number</b>: "+p.baynumber+"<br/>"
  }
  layer.bindPopup(content)
}

/* Let's go */
  map = L.mapbox.map('mapid', 'mapbox.streets',{
    center: [-41.44,147.15],
    zoom: 17,
    minZoom: 13,
    maxBounds: [
      [-41.392779, 147.239112],
      [-41.498549, 147.060928]
    ]
  })
  /* Controls to locate the user */
  var lc = L.control.locate({
    cacheLocation: true,
    keepCurrentZoomLevel: true,
    flyTo: true,
    locateOptions: {
                 maxZoom: 17,
                enableHighAccuracy: true
  }}).addTo(map);
  lc.start();

  /* features */
  var gj = L.geoJSON(bays, {
      onEachFeature: createPopup,
      style: styleBay
    }).addTo(map);

  $("#myButtons :input, #myButtons2 :input").change(function() {
    console.log("Click!")
    gj.setStyle(styleBay);
  })
