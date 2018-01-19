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

var restrictionApplies = function(restriction) {
  var dateObj = new Date()
  var dow = dateObj.getDay(); if (dow==0) { dow=7 };
  var hour = dateObj.getHours() + dateObj.getMinutes()/60;
  if ("day_s" in restriction) {
    if (! (dow >= restriction.day_s && dow <= restriction.day_e)) {
     return false;
    }
  }
  return (hour >= restriction.hour_s && hour <= restriction.hour_e)
}

var restrictionsApply = function(feature) {
  var applies = false;
  var restrictions = feature.properties.restrictions;
  if (!restrictions) { return true}
  // If we don't have times for the restrictions, they always apply.
  restrictions.forEach(function(r) {
    if (restrictionApplies(r)) { applies = true }
  })
  return applies;
}

var hidden = function(feature) {
  if (feature.properties.objectid == 3134) {
    console.log("Testing for hiddenness")
  }
  parkingClass = feature.properties.class;
  var restricted = restrictionsApply(feature)
  if (restricted && parkingClass in hideClass) { return true }
  var minTime =  parseInt($("input[name=how-long]:checked").val(),10);
  var hideMetered =$("#hide-metered").is(":checked")
  if (restricted && parseInt(feature.properties.parktime_mins,10) > 0 && parseInt(feature.properties.parktime_mins,10) < minTime) {
    if (feature.properties.objectid == 3134) {
      console.log("Hiding")
    }
    return true
  }
  if (hideMetered && restricted) {
    if (feature.properties.meternumber) { return true }
    if (parkingClass == "Multibay Metered" || parkingClass == "Metered") { return true }
  }
  return false;
}
var styleBay = function(feature) {
  if (hidden(feature)) {
    return { color: "#ffffff", opacity: 0.1, display: "none" }
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
  var where = feature.geometry.coordinates[0]
  var gourl
  if (where && 0 in where) {
    where = where[0]
    gourl = "https://www.google.com/maps/dir/?api=1&destination="+where[1]+","+where[0]+"&dir_action=navigate"
  }
  var p = feature.properties
  if (!p) return;
  content = "";
  if (p.signinfo) {
    content = content + "<b>"+p.signinfo+"</b><br/>"
  }
  if ("restrictions" in feature.properties) {
    if (restrictionsApply(feature)) {
      content = content + "<b>Restrictions apply now</b><br/>"
    } else {
      content = content + "<b>Restrictions not currently applicable</b><br/>"
    }
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
  if (gourl) {
    content = content + "<a href=\""+gourl+"\">Go!</a>"
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
