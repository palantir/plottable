function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

    var dataseries1 = makeRandomData(20);
    var dataseries2 = makeRandomData(50);

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



    var renderAreaD0 = new Plottable.Plot.Line(dataseries1, xScale, yScale);
    var renderAreaD1 = new Plottable.Plot.Line(dataseries2, xScale, yScale)
                                      .project( "stroke", d3.functor("red"));
    var renderAreaD2 = new Plottable.Plot.Area(dataseries1, xScale, yScale);
    var renderAreaD3 = new Plottable.Plot.Area(dataseries2, xScale, yScale)
                                      .project( "fill", d3.functor("red"));


    //test merge:
    //empty component + empty component

    var basicTable0 = new Plottable.Component.Table().addComponent(0,0, yAxis0);

    //empty component + XYRenderer
    var basicTable1 = new Plottable.Component.Table().addComponent(0,1, renderAreaD0);


    //XYRenderer + empty component
    var basicTable2 = new Plottable.Component.Table().addComponent(0,0, yAxis2)
                                          .addComponent(0,1, renderAreaD1)
                                          .addComponent(1,1,xAxis2);
    //XYRenderer + XYRenderer
    var renderGroup3 = renderAreaD3.merge(renderAreaD2);
    var basicTable3 = new Plottable.Component.Table().addComponent(0,1, renderGroup3)
                                          .addComponent(1,1,xAxis3);

    var bigtable = new Plottable.Component.Table();

    var line1 = new Plottable.Component.Label("Tables in Tables", "horizontal");
    var line2 = new Plottable.Component.Label("for Dan", "horizontal");

    bigtable = new Plottable.Component.Table().addComponent(0,0, basicTable0)
                                          .addComponent(0,2, basicTable1)
                                          .addComponent(3,0, basicTable2)
                                          .addComponent(3,2,basicTable3)
                                          .addComponent(1, 1, line1)
                                          .addComponent(2, 1, line2);
    bigtable.renderTo(svg);


}
