function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

    var dataseries1 = data[0].slice();
    var dataseries2 = data[0].slice();

    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis0 = new Plottable.Axis.Numeric(xScale, "bottom");
    var xAxis1 = new Plottable.Axis.Numeric(xScale, "bottom");
    var xAxis2 = new Plottable.Axis.Numeric(xScale, "bottom");
    var xAxis3 = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis0 = new Plottable.Axis.Numeric(yScale, "left");
    var yAxis1 = new Plottable.Axis.Numeric(yScale, "left");
    var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");
    var yAxis3 = new Plottable.Axis.Numeric(yScale, "left");

    //test Component constructor (default, should be no issues)



    var renderAreaD0 = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries1);
    renderAreaD0.project("x", "x", xScale).project("y", "y", yScale);
    var renderAreaD1 = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries2)
                                      .attr( "stroke", d3.functor("red"));
    renderAreaD1.project("x", "x", xScale).project("y", "y", yScale);
    var renderAreaD2 = new Plottable.Plot.Area(xScale, yScale).addDataset(dataseries1);
    renderAreaD2.project("x", "x", xScale).project("y", "y", yScale);
    var renderAreaD3 = new Plottable.Plot.Area(xScale, yScale).addDataset(dataseries2)
                                      .attr( "fill", d3.functor("red"));
    renderAreaD3.project("x", "x", xScale).project("y", "y", yScale);


    //test merge:
    //empty component + empty component

    var basicTable0 = new Plottable.Component.Table().addComponent(yAxis0, 0, 0);

    //empty component + XYRenderer
    var basicTable1 = new Plottable.Component.Table().addComponent(renderAreaD0, 0, 1);


    //XYRenderer + empty component
    var basicTable2 = new Plottable.Component.Table().addComponent(yAxis2, 0, 0)
                                          .addComponent(renderAreaD1, 0, 1)
                                          .addComponent(xAxis2, 1, 1);
    //XYRenderer + XYRenderer
    var renderGroup3 = renderAreaD3.below(renderAreaD2);
    var basicTable3 = new Plottable.Component.Table().addComponent(renderGroup3, 0, 1)
                                          .addComponent(xAxis3, 1, 1);

    var bigtable = new Plottable.Component.Table();

    var line1 = new Plottable.Component.Label("Tables in Tables", "horizontal");
    var line2 = new Plottable.Component.Label("for Dan", "horizontal");

    bigtable = new Plottable.Component.Table().addComponent(basicTable0, 0, 0)
                                          .addComponent(basicTable1, 0, 2)
                                          .addComponent(basicTable2, 3, 0)
                                          .addComponent(basicTable3, 3, 2)
                                          .addComponent(line1, 1, 1)
                                          .addComponent(line2, 2, 1);
    bigtable.renderTo(svg);


}
