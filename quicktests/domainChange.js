
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

    var boringData = function () {
        return [{x: 0, y: 0}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 2, y: 6}, {x: 30, y: 70}];
    };

  var dataseries = new Plottable.DataSource(boringData());

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  xScale.domain([0, 3]);
  yScale.domain([0, 8]);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var xAxis2 = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");

  //rendering
  var linePlot = new Plottable.Plot.Line(dataseries, xScale, yScale);
  var scatterPlot = new Plottable.Plot.Scatter(dataseries, xScale, yScale);

  var autoXLabel = new Plottable.Component.Label("autodomain X");
  var focusXLabel = new Plottable.Component.Label("focus X");
  var autoYLabel = new Plottable.Component.Label("autodomain Y");
  var focusYLabel = new Plottable.Component.Label("focus Y");

  var basicTable = new Plottable.Component.Table([
    [yAxis, yAxis2, linePlot.merge(scatterPlot)],
    [null, null, xAxis],
    [null, null, xAxis2]
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

  var xAutoInteraction = new
      Plottable.Interaction.Click(autoXLabel)
      .callback(xAuto)
      .registerWithComponent();
  var yAutoInteraction = new
      Plottable.Interaction.Click(autoYLabel)
      .callback(yAuto)
      .registerWithComponent();
  var xFocusInteraction = new
      Plottable.Interaction.Click(focusXLabel)
      .callback(xFocus)
      .registerWithComponent();
  var yFocusInteraction = new
      Plottable.Interaction.Click(focusYLabel)
      .callback(yFocus)
      .registerWithComponent();

}
