
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

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  xScale.domain([0, 3]);
  yScale.domain([0, 8]);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var xAxis2 = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");

  //rendering
  var linePlot = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries);
  linePlot.project("x", "x", xScale).project("y", "y", yScale);
  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries);
  scatterPlot.project("x", "x", xScale).project("y", "y", yScale);

  var autoXLabel = new Plottable.Component.Label("autodomain X");
  var focusXLabel = new Plottable.Component.Label("focus X");
  var autoYLabel = new Plottable.Component.Label("autodomain Y");
  var focusYLabel = new Plottable.Component.Label("focus Y");

  var labelTable = new Plottable.Component.Table([
    [autoXLabel, focusXLabel],
    [autoYLabel, focusYLabel]
  ]);

  var basicTable = new Plottable.Component.Table([
    [yAxis, yAxis2, linePlot.merge(scatterPlot)],
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

  autoXLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(xAuto)
  );
  autoYLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(yAuto)
  );
  focusXLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(xFocus)
  );
  focusYLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(yFocus)
  );

}
