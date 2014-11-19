
function makeData() {
  "use strict";
  return [makeRandomData(25),makeRandomData(25)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);


  var d1 = new Plottable.Dataset(data[0], { user_key: "ud1" });
  var d2 = new Plottable.Dataset(data[1], { user_key: "ud2" });

  var colorScale1 = new Plottable.Scale.Color("Category20b");
  colorScale1.domain(["ud1", "ud2"]);

  var colorScale2 = new Plottable.Scale.Color("Category20c");
  colorScale2.domain(["d1", "d2"]);


  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis1 = new Plottable.Axis.Numeric(yScale, "left");
  var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");

  var linePlotUserMetadata = new Plottable.Plot.Line(xScale, yScale)
      .addDataset("d1", d1)
      .addDataset("d2", d2)
      .attr("stroke", function (d, i, u) { return u.user_key; }, colorScale1);

  var linePlotPlotMetadata = new Plottable.Plot.Line(xScale, yScale)
      .addDataset("d1", d1)
      .addDataset("d2", d2)
      .attr("stroke", function (d, i, u, m) { return m.datasetKey; }, colorScale2);


  var basicTable = new Plottable.Component.Table([
    [yAxis1, linePlotUserMetadata],
    [yAxis2, linePlotPlotMetadata],
    [null, xAxis]
    ]);

  basicTable.renderTo(svg);


}
