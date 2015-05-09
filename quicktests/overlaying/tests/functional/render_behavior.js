//broken

function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var d = data[0].slice(10, 15);
  var dataseries = new Plottable.Dataset(d);
  var i = 0;

  //Axis
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var areaPlot = new Plottable.Plots.Area(xScale, yScale).addDataset(dataseries).animate("true");
  areaPlot.project("x", "x", xScale).project("y", "y", yScale);

  var label1  = new Plottable.Components.Label("dataset.data()", "horizontal");
  var label2  = new Plottable.Components.Label("change width + resize", "horizontal");
  var label3  = new Plottable.Components.Label("remove + renderTo", "horizontal");
  var label4  = new Plottable.Components.Label("_render()", "horizontal");

  var basicTable = new Plottable.Components.Table([[yAxis, areaPlot],
   [null, xAxis],
   [null, label1],
   [null, label2],
   [null, label3],
   [null, label4]]);

  basicTable.renderTo(svg);

  function newData(){
    var d = data[i%2].slice(0,5);
    dataseries.data(d);
    i++;
  }
  function changeWidth() {
    svg.attr("width", 300 + (i%5)*40);
    basicTable.resize();
    i++;
  }

  function removeAndRenderTo() {
    basicTable.detach();
    basicTable.renderTo(svg);
  }

  new Plottable.Interactions.Click().onClick(newData).attachTo(label1);

  new Plottable.Interactions.Click().onClick(changeWidth).attachTo(label2);

  new Plottable.Interactions.Click().onClick(removeAndRenderTo).attachTo(label3);

  new Plottable.Interactions.Click().onClick(function(){basicTable._render();}).attachTo(label4);
}
