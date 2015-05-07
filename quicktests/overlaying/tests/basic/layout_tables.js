function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

    var dataset1 = new Plottable.Dataset(data[0]);
    var dataset2 = new Plottable.Dataset(data[0]);

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var xAxis0 = new Plottable.Axes.Numeric(xScale, "bottom");
    var xAxis1 = new Plottable.Axes.Numeric(xScale, "bottom");
    var xAxis2 = new Plottable.Axes.Numeric(xScale, "bottom");
    var xAxis3 = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis0 = new Plottable.Axes.Numeric(yScale, "left");
    var yAxis1 = new Plottable.Axes.Numeric(yScale, "left");
    var yAxis2 = new Plottable.Axes.Numeric(yScale, "left");
    var yAxis3 = new Plottable.Axes.Numeric(yScale, "left");

    //test Component constructor (default, should be no issues)

    var renderAreaD0 = new Plottable.Plots.Line(xScale, yScale).addDataset(dataset1);
    renderAreaD0.project("x", "x", xScale).project("y", "y", yScale);
    var renderAreaD1 = new Plottable.Plots.Line(xScale, yScale).addDataset(dataset2)
                                      .attr( "stroke", d3.functor("red"));
    renderAreaD1.project("x", "x", xScale).project("y", "y", yScale);
    var renderAreaD2 = new Plottable.Plots.Area(xScale, yScale).addDataset(dataset1);
    renderAreaD2.project("x", "x", xScale).project("y", "y", yScale);
    var renderAreaD3 = new Plottable.Plots.Area(xScale, yScale).addDataset(dataset2)
                                      .attr( "fill", d3.functor("red"));
    renderAreaD3.project("x", "x", xScale).project("y", "y", yScale);


    //test merge:
    //empty component + empty component

    var basicTable0 = new Plottable.Components.Table().addComponent(yAxis0, 0, 0);

    //empty component + XYRenderer
    var basicTable1 = new Plottable.Components.Table().addComponent(renderAreaD0, 0, 1);


    //XYRenderer + empty component
    var basicTable2 = new Plottable.Components.Table().addComponent(yAxis2, 0, 0)
                                          .addComponent(renderAreaD1, 0, 1)
                                          .addComponent(xAxis2, 1, 1);
    //XYRenderer + XYRenderer
    var renderGroup3 = renderAreaD3.below(renderAreaD2);
    var basicTable3 = new Plottable.Components.Table().addComponent(renderGroup3, 0, 1)
                                          .addComponent(xAxis3, 1, 1);

    var bigtable = new Plottable.Components.Table();

    var line1 = new Plottable.Components.Label("Tables in Tables", "horizontal");
    var line2 = new Plottable.Components.Label("for Dan", "horizontal");

    bigtable = new Plottable.Components.Table().addComponent(basicTable0, 0, 0)
                                          .addComponent(basicTable1, 0, 2)
                                          .addComponent(basicTable2, 3, 0)
                                          .addComponent(basicTable3, 3, 2)
                                          .addComponent(line1, 1, 1)
                                          .addComponent(line2, 2, 1);
    bigtable.renderTo(svg);


}
