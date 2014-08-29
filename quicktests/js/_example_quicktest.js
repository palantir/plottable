// make data goes at the top of each quicktest.
// it returns an array of arrays of data
// the data is in the form {x: 0, y: 0}
function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}


//EVERYTHING the test needs goes inside of run
function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);

  //declare scales, axes, plots, titles, labels, legends, gridlines, etc

  //create the graph with: new Plottable.Component.Table();

  plot.renderTo("svg");

  //define any callbacks

  //define any interactions
}
