
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(svg, data, Plottable) {
  "use strict";

    var boringData = function () {
        return [{x: 0, y: 0}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 2, y: 6}, {x: 30, y: 70}];
    };

  var dataseries = new Plottable.Dataset(boringData());

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  xScale.domain([0, 3]);
  yScale.domain([0, 8]);
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var xAxis2 = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis2 = new Plottable.Axes.Numeric(yScale, "left");

  //rendering
  var linePlot = new Plottable.Plots.Line(xScale, yScale).addDataset(dataseries);
  linePlot.project("x", "x", xScale).project("y", "y", yScale);
  var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries);
  scatterPlot.project("x", "x", xScale).project("y", "y", yScale);

  var autoXLabel = new Plottable.Components.Label("autodomain X");
  var focusXLabel = new Plottable.Components.Label("focus X");
  var autoYLabel = new Plottable.Components.Label("autodomain Y");
  var focusYLabel = new Plottable.Components.Label("focus Y");

  var labelTable = new Plottable.Components.Table([
    [autoXLabel, focusXLabel],
    [autoYLabel, focusYLabel]
  ]);

  var basicTable = new Plottable.Components.Table([
    [yAxis, yAxis2, linePlot.below(scatterPlot)],
    [null, null, xAxis],
    [null, null, xAxis2],
    [null, null, labelTable]
    ]);
  basicTable.renderTo(svg);

  function xAuto(){
    xScale.autoDomain();
  }
  function yAuto(){
    yScale.autoDomain();
  }
  function xFocus(){
    xScale.domain([0, 3]);
  }
  function yFocus(){
    yScale.domain([0, 8]);
  }

  new Plottable.Interactions.Click().onClick(xAuto).attachTo(autoXLabel);
  new Plottable.Interactions.Click().onClick(yAuto).attachTo(autoYLabel);
  new Plottable.Interactions.Click().onClick(xFocus).attachTo(focusXLabel);
  new Plottable.Interactions.Click().onClick(yFocus).attachTo(focusYLabel);

}
