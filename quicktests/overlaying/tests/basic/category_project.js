function makeData() {
  "use strict";

  return makeRandomData(5);
}

function run(svg, data, Plottable) {
  "use strict";

  var change_x = function(elt, i) {
    elt.x = i.toString(); // wtf is this code
  };
  data.forEach(change_x);
  var dataseries1 = new Plottable.Dataset(data);

  //Axis
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var widthProjector = function(d, i, m) {
    return (d.x*3 + 3);
  };

  //rendering
  var renderAreaD1 = new Plottable.Plot.VerticalBar(xScale, yScale)
                                  .addDataset(dataseries1)
                                  .attr("width", widthProjector)
                                  .project("x", "x", xScale)
                                  .project("y", "y", yScale)
                                  .animate(true);

  //title + legend
  var title1 = new Plottable.Component.TitleLabel( "Category Axis", "horizontal");
  var label = new Plottable.Component.Label("Width is 3*d.x + 3", "horizontal");

  var xAxisTable = new Plottable.Component.Table([[xAxis],[label]]);
  var basicTable = new Plottable.Component.Table().addComponent(0,2, title1)
                                          .addComponent(1, 1, yAxis)
                                          .addComponent(1, 2, renderAreaD1)
                                          .addComponent(2, 2, xAxisTable);

  basicTable.renderTo(svg);
}
