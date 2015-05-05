function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50), makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var dataseries1 = new Plottable.Dataset(data[0].slice(0, 20));
  dataseries1.metadata({name: "series1"});
  var dataseries2 = new Plottable.Dataset(data[1].slice(0, 20));
  dataseries2.metadata({name: "series2"});
  var dataseries3 = new Plottable.Dataset(data[2].slice(0, 20));
  dataseries3.metadata({name: "series3"});
  var dataseries4 = new Plottable.Dataset(data[3].slice(0, 20));
  dataseries4.metadata({name: "series4"});
  var colorScale1 = new Plottable.Scales.Color("10");
  colorScale1.domain(["series1", "series2", "series3", "series4"]);

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var colorProjector = function(d, i, m) {
    return colorScale1.scale(m.name);
  };

  var renderAreaD1 = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries1)
                                                               .addDataset(dataseries3)
                                                               .addDataset(dataseries4);
  renderAreaD1.project("x", "x", xScale).project("y", "y", yScale);
  var renderAreaD2 = new Plottable.Plots.Line(xScale, yScale).addDataset(dataseries2);
  renderAreaD2.project("x", "x", xScale).project("y", "y", yScale);
  renderAreaD1.attr("fill", colorProjector);
  renderAreaD2.attr("stroke", colorProjector);
  var renderAreas = renderAreaD1.above(renderAreaD2);


  var title1 = new Plottable.Components.TitleLabel( "Four Data Series", "horizontal");
  var legend1 = new Plottable.Components.Legend(colorScale1).maxEntriesPerRow(1);
  var titleTable = new Plottable.Components.Table().addComponent(0,0, title1)
  .addComponent(0,1, legend1);

  var basicTable = new Plottable.Components.Table().addComponent(0,2, titleTable)
              .addComponent(1, 1, yAxis)
              .addComponent(1, 2, renderAreas)
              .addComponent(2, 2, xAxis);

  basicTable.renderTo(svg);
}
