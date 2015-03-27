
function makeData() {
  "use strict";

  return makeRandomData(50);
}

function run(svg, data, Plottable) {
  "use strict";

  var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i",
  "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
  "t", "u", "v", "w", "x", "y", "z"];

  var ds = new Plottable.Dataset();
  var xScale = new Plottable.Scale.Category();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var gridlines = new Plottable.Component.Gridlines(null, yScale);
  var addLabel = new Plottable.Component.Label("add bar");
  var removeLabel = new Plottable.Component.Label("remove bar");

  var widthPicker = function(){
    var availableSpace = xAxis.width();
    var numBars = ds.data().length;
    var w = availableSpace * 0.7 / numBars;
    return w;
  };

  var barRenderer = new Plottable.Plot.Bar(xScale, yScale, true)
                                 .addDataset(ds)
                                 .attr("x", "name", xScale)
                                 .attr("y", "age", yScale)
                                 .attr("width", widthPicker);
  var chart = new Plottable.Component.Table([
                                            [yAxis, gridlines.above(barRenderer)],
                                            [null,  xAxis],
                                            [addLabel, removeLabel]
  ]).renderTo(svg);


  function addBar() {
    var d = ds.data();
    if(d.length < alphabet.length) {
      d.push({ name: alphabet[d.length], age: data[d.length].y });
    }
    ds.data(d);
    barRenderer.attr("width", widthPicker);
  }

  function removeBar() {
    var data2 = ds.data();
    if(data2.length > 0){  data2.pop();   }
    ds.data(data2);
    barRenderer.attr("width", widthPicker);
  }

  addLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(addBar)
  );
  removeLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(removeBar)
  );
}
