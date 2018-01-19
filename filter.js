var fs = require('fs');
var mappingContent = fs.readFileSync('signs.tsv', 'utf8').split("\n")
var signMap = {}
var lineno=1
mappingContent.forEach(function(line){
  var arr = line.split(/\|/)
  if (arr[1]) {
    // Test that it's valid javascript
    try {
      o = eval(arr[1]);
      signMap[arr[0]] = o;
    } catch (e) {
      console.log("Line "+lineno+": "+e.message)
    }
    lineno = lineno+1
  }
})
var content = fs.readFileSync('bays-pretty.geojson', 'utf8')
content = JSON.parse(content)

var bays = content.features;
for (var i = bays.length - 1; i >= 0; i--) {
  var bay = bays[i];
  if (bay.properties.signinfo in signMap) {
    bay.properties.restrictions = signMap[bay.properties.signinfo];
  }
}
fs.writeFile("./bays-with-restrictions.geojson", JSON.stringify(content), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("File has been created");
});
