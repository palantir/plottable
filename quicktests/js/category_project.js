function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var rawData = data[0].slice(0, 5);
  var change_x = function(elt, i) {
    elt.x = i;
    elt.x = elt.x.toString();
  };
  rawData.forEach(change_x);
  var dataseries1 = new Plottable.Dataset(rawData);
  dataseries1.metadata({name: "series1"});


  //Axis
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");


  var widthProjector = function(d, i, m) {
    return (d.x*3 + 3);
  };

  //rendering
  var renderAreaD1 = new Plottable.Plot.VerticalBar(dataseries1, xScale, yScale)
                                  .project("width", widthProjector)
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
