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
  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var widthProjector = function(d, i, m) {
    return (d.x*3 + 3);
  };

  //rendering
  var renderAreaD1 = new Plottable.Plots.Bar(xScale, yScale, true)
                                  .addDataset(dataseries1)
                                  .attr("width", widthProjector)
                                  .project("x", "x", xScale)
                                  .project("y", "y", yScale)
                                  .animate(true);

  //title + legend
  var title1 = new Plottable.Components.TitleLabel( "Category Axis", "horizontal");
  var label = new Plottable.Components.Label("Width is 3*d.x + 3", "horizontal");

  var xAxisTable = new Plottable.Components.Table([[xAxis],[label]]);
  var basicTable = new Plottable.Components.Table().addComponent(title1, 0, 2)
                                          .addComponent(yAxis, 1, 1)
                                          .addComponent(renderAreaD1, 1, 2)
                                          .addComponent(xAxisTable, 2, 2);

  basicTable.renderTo(svg);
}
