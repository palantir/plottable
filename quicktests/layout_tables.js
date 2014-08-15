function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
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

  var Plot0 = new Plottable.Plot.Line(dataseries1, xScale, yScale);
  var Plot1 = new Plottable.Plot.Line(dataseries2, xScale, yScale)
  .project( "stroke", function(){return "red"});   
  var Plot2 = new Plottable.Plot.Area(dataseries1, xScale, yScale);
  var Plot3 = new Plottable.Plot.Area(dataseries2, xScale, yScale)
  .project( "fill", function(){return "red"});

  var basicTable0 = new Plottable.Component.Table([[yAxis0]])
  var basicTable1 = new Plottable.Component.Table([[Plot0]])

  var basicTable2 = new Plottable.Component.Table([[yAxis2, Plot1],
    []null, xAxis2]);

  var renderGroup = Plot3.merge(Plot2);
  var basicTable3 = new Plottable.Component.Table([[renderGroup],
    [xAxis3]]);
  
  var line1 = new Plottable.Component.Label("Tables in Tables", "horizontal");
  var line2 = new Plottable.Component.Label("for Dan", "horizontal");
  
  bigtable = new Plottable.Component.Table().addComponent(0,0, basicTable0)
  .addComponent(0,2, basicTable1)
  .addComponent(3,0, basicTable2)
  .addComponent(3,2,basicTable3)  
  .addComponent(1, 1, line1)
  .addComponent(2, 1, line2)

  bigtable.renderTo(svg);
}