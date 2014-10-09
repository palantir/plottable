
function makeData() {
  "use strict";

  return makeRandomData(50);

}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var ds = new Plottable.Dataset(data);

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var linePlot = new Plottable.Plot.Line(xScale, yScale).addDataset(ds);
  
  var focusXLabel = new Plottable.Component.Label("focus X");
  var autoYLabel = new Plottable.Component.Label("custom adjustment Y algorithm");

  var basicTable = new Plottable.Component.Table([
    [yAxis, linePlot],
    [null, xAxis],
    [focusXLabel, autoYLabel]
    ]);

  basicTable.renderTo(svg);

  function yAuto(){
    linePlot.adjustmentYScaleDomainAlgorithm(function (dataSets, xDomain) {
      var visiblePoints = dataSets[0].data().filter(function(d) { return d.x >= xDomain[0] && d.x <= xDomain[1]; });
      var yValues = visiblePoints.map(function(d) { return d.y; });
      return [d3.min(yValues), d3.max(yValues)];
    });
  }
  function xFocus(){
    xScale.domain([0.25, 0.5]);
  }

  autoYLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(yAuto)
  );
  focusXLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(xFocus)
  );
}
