function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

    var dataset1 = new Plottable.Dataset(data[0]);
    var dataset2 = new Plottable.Dataset(data[0]);

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var xAxis2 = new Plottable.Axes.Numeric(xScale, "bottom");
    var xAxis3 = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis0 = new Plottable.Axes.Numeric(yScale, "left");
    var yAxis2 = new Plottable.Axes.Numeric(yScale, "left");

    //test Component constructor (default, should be no issues)

    var renderAreaD0 = new Plottable.Plots.Line().addDataset(dataset1);
    renderAreaD0.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var renderAreaD1 = new Plottable.Plots.Line().addDataset(dataset2)
                                      .attr( "stroke", d3.functor("red"));
    renderAreaD1.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var renderAreaD2 = new Plottable.Plots.Area().addDataset(dataset1);
    renderAreaD2.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var renderAreaD3 = new Plottable.Plots.Area().addDataset(dataset2)
                                      .attr( "fill", d3.functor("red"));
    renderAreaD3.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);

    //test merge:
    //empty component + empty component

    var basicTable0 = new Plottable.Components.Table().add(yAxis0, 0, 0);

    //empty component + XYRenderer
    var basicTable1 = new Plottable.Components.Table().add(renderAreaD0, 0, 1);

    //XYRenderer + empty component
    var basicTable2 = new Plottable.Components.Table().add(yAxis2, 0, 0)
                                          .add(renderAreaD1, 0, 1)
                                          .add(xAxis2, 1, 1);
    //XYRenderer + XYRenderer
    var renderGroup3 = new Plottable.Components.Group([renderAreaD3, renderAreaD2]);
    var basicTable3 = new Plottable.Components.Table().add(renderGroup3, 0, 1)
                                          .add(xAxis3, 1, 1);

    var bigtable = new Plottable.Components.Table();

    var line1 = new Plottable.Components.Label("Tables in Tables", 0);
    var line2 = new Plottable.Components.Label("for Dan", 0);

    bigtable = new Plottable.Components.Table().add(basicTable0, 0, 0)
                                          .add(basicTable1, 0, 2)
                                          .add(basicTable2, 3, 0)
                                          .add(basicTable3, 3, 2)
                                          .add(line1, 1, 1)
                                          .add(line2, 2, 1);
    bigtable.renderTo(div);
}
