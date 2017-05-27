var fs = require('fs');
var bays = JSON.parse(fs.readFileSync('bays.geojson', 'utf8')).features;
for (var i = bays.length - 1; i >= 0; i--) {
  var bay = bays[i];
  console.log(bay.properties.parktime_mins, bay.properties.signinfo);
}