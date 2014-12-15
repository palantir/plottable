function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50), makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var dataseries1 = new Plottable.Dataset(data[0].slice(0, 20));
  dataseries1.metadata({name: "series1"});
  var dataseries2 = new Plottable.Dataset(data[1].slice(0, 20));
  dataseries2.metadata({name: "series2"});
  var dataseries3 = new Plottable.Dataset(data[2].slice(0, 20));
  dataseries3.metadata({name: "series3"});
  var dataseries4 = new Plottable.Dataset(data[3].slice(0, 20));
  dataseries4.metadata({name: "series4"});
  var colorScale1 = new Plottable.Scale.Color("10");
  colorScale1.domain(["series1", "series2", "series3", "series4"]);

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var colorProjector = function(d, i, m) {
    return colorScale1.scale(m.name);
  };

  var renderAreaD1 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries1)
                                                               .addDataset(dataseries3)
                                                               .addDataset(dataseries4);
  renderAreaD1.project("x", "x", xScale).project("y", "y", yScale);
  var renderAreaD2 = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries2);
  renderAreaD2.project("x", "x", xScale).project("y", "y", yScale);
  renderAreaD1.attr("fill", colorProjector);
  renderAreaD2.attr("stroke", colorProjector);
  var renderAreas = renderAreaD1.merge(renderAreaD2);


  var title1 = new Plottable.Component.TitleLabel( "Four Data Series", "horizontal");
  var legend1 = new Plottable.Component.Legend(colorScale1).maxEntriesPerRow(1);
  var titleTable = new Plottable.Component.Table().addComponent(0,0, title1)
  .addComponent(0,1, legend1);

  var basicTable = new Plottable.Component.Table().addComponent(0,2, titleTable)
              .addComponent(1, 1, yAxis)
              .addComponent(1, 2, renderAreas)
              .addComponent(2, 2, xAxis);

  basicTable.renderTo(svg);
}
