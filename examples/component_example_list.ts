///<reference path="exampleReference.ts" />

var ordinalDomain: string[] = ["a", "b", "c", "d", "e"];
var ordinalData = [{x: "a", y: 3}, {x: "b", y: -2}, {x: "c", y: 4}, {x: "d", y: -3}, {x: "e", y: 5}];
var quantitativeData = [{x: -2, y: 15}, {x: 1, y: 20}, {x: 4, y: -3}, {x: 8, y: 0}, {x: 10, y: -10}];
var quantitativeData2 = [{x: -2, y: 20}, {x: 5, y: -10}, {x: 7, y: 10}, {x: 10, y: 7}];
var colors = new Plottable.Scale.Color("Category10").range();

function generateSVG(width = 400, height = 400): D3.Selection {
  var parent: D3.Selection = d3.select("body");
  return parent.append("svg").attr("width", width).attr("height", height);
}

function makeTitle(text: string) {
  var svg = generateSVG(400, 50);
  new Plottable.Component.Label(text, "horizontal").renderTo(svg);
}

function axis(type: string, orientation: string) {
  var svg = generateSVG();
  var axis: Plottable.Abstract.Axis;
  if (type === "numeric") {
    var lscale = new Plottable.Scale.Linear();
    axis = new Plottable.Axis.Numeric(lscale, orientation);
  } else if (type === "category") {
    var oscale = new Plottable.Scale.Ordinal();
    oscale.domain (ordinalDomain);
    axis = new Plottable.Axis.Category(oscale, orientation);
  } else {
    throw new Error ("unrecognized type: " + type);
  }
  axis.renderTo(svg);
}

function catAxisWrap(orientation: string) {
  var svg = generateSVG();
  var scale = new Plottable.Scale.Ordinal();
  scale.domain([
    "Brazil",
    "United States of America",
    "Tatooine",
    "People's Republic of China",
    "United Kingdom of Great Britain and Northern Ireland"
  ]);
  var axis = new Plottable.Axis.Category(scale, orientation);
  axis.renderTo(svg);
}

function verticalBarPlot() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();

  xScale.domain(ordinalDomain);

  var ds = new Plottable.Dataset(ordinalData);
  var plot = new Plottable.Plot.VerticalBar(ds, xScale, yScale);
  plot.renderTo(svg);
}

function horizontalBarPlot() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Ordinal();

  yScale.domain(ordinalDomain);
  var ds = new Plottable.Dataset(ordinalData);
  // need to reverse the x/y data
  var plot = new Plottable.Plot.HorizontalBar(ds, xScale, yScale)
    .project("x", "y", xScale).project("y", "x", yScale);
  plot.renderTo(svg);
}

function gridPlot() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Ordinal();
  var colorScale = new Plottable.Scale.InterpolatedColor();

  xScale.domain(["a", "b", "c"]);
  yScale.domain(["d", "e", "f"]);
  colorScale.domain([0, 10]);
  var data = [{x: "a", y: "d", value: 3}, {x: "a", y: "e", value: 4}, {x: "a", y: "f", value: 7},
        {x: "b", y: "d", value: 1}, {x: "b", y: "e", value: 6}, {x: "b", y: "f", value: 8},
        {x: "c", y: "d", value: 9}, {x: "c", y: "e", value: 2}, {x: "c", y: "f", value: 5}];

  var plot = new Plottable.Plot.Grid(data, xScale, yScale, colorScale);
  plot.renderTo(svg);
}

function getXYPlot(type: string, data: any[]): Plottable.Abstract.Plot {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var ds = new Plottable.Dataset(data);

  var plot: Plottable.Abstract.Plot;
  switch(type) {
    case "area":
      plot = new Plottable.Plot.Area(ds, xScale, yScale);
      break;
    case "line":
      plot = new Plottable.Plot.Line(ds, xScale, yScale);
      break;
    case "scatter":
      plot = new Plottable.Plot.Scatter(ds, xScale, yScale);
      break;
  }
  return plot;
}

function makeXYPlot(type: string) {
  var svg = generateSVG();

  var plot = getXYPlot(type, quantitativeData);
  plot.renderTo(svg);
}

function makeXYPlotMulti(type: string) {
  var svg = generateSVG();


  var plot = getXYPlot(type, quantitativeData);
  var plot2 = getXYPlot(type, quantitativeData2);
  if (type === "line") {
    plot.project("stroke", colors[0]);
    plot2.project("stroke", colors[1]);
  } else {
    plot.project("fill", colors[0]);
    plot2.project("fill", colors[1]);
  }
  var group = new Plottable.Component.Group([plot, plot2]);
  group.renderTo(svg);
}

function makeAreaStroke() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var ds = new Plottable.Dataset(quantitativeData);

  var plot = new Plottable.Plot.Area(ds, xScale, yScale);
  plot.project("stroke", colors[0]);
  plot.project("fill", colors[0]);
  plot.renderTo(svg);
}

function label(text: string, orientation: string) {
  var svg = generateSVG();
  new Plottable.Component.Label(text, orientation).renderTo(svg);
}

function legend() {
  var svg = generateSVG();
  var colorScale = new Plottable.Scale.Color("category10");
  var legend = new Plottable.Component.Legend(colorScale);
  legend.toggleCallback(() => {return;}); // empty function, just to turn toggling on
  legend.hoverCallback(() => {return;});
  legend.scale().domain(ordinalDomain);
  legend.renderTo(svg);
}

function gridline(showVertical: boolean, showHorizontal: boolean) {
  var svg = generateSVG();
  var xScale = showVertical ? new Plottable.Scale.Linear() : null;
  var yScale = showHorizontal ? new Plottable.Scale.Linear() : null;

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var xAxis = showVertical ? new Plottable.Axis.Numeric(xScale, "bottom") : null;
  var yAxis = showHorizontal ? new Plottable.Axis.Numeric(yScale, "left") : null;
  var table = new Plottable.Component.Table([[yAxis, gridlines], [null, xAxis]]);
  table.renderTo(svg);
}

function xydrag() {
  var svg = generateSVG();
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var plot = new Plottable.Plot.Scatter(quantitativeData, xScale, yScale);

    plot.renderTo(svg);
    plot.registerInteraction(
      new Plottable.Interaction.XYDragBox(plot).callback(() => {return;})
    );
}

function xdrag() {
  var svg = generateSVG();
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var plot = new Plottable.Plot.Area(quantitativeData, xScale, yScale);

    plot.renderTo(svg);
    plot.registerInteraction(
      new Plottable.Interaction.XDragBox().callback(() => {return;})
    );
}

function panZoomInteraction() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var table = new Plottable.Component.Table([[yAxis, gridlines], [null, xAxis]]);
  table.renderTo(svg);
  table.registerInteraction(
    new Plottable.Interaction.PanZoom(xScale, yScale)
  );
}

function animate1() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var plot1 = new Plottable.Plot.Line(quantitativeData, xScale, yScale).animate(true);
  var plot2 = new Plottable.Plot.Line(quantitativeData2, xScale, yScale).animate(true);

  plot1.project("stroke", colors[0]);
  plot2.project("stroke", colors[1]);

  var renderGroup = new Plottable.Component.Group([plot1, plot2, gridlines]);
  var table = new Plottable.Component.Table([[yAxis, renderGroup], [null, xAxis]]);
  table.renderTo(svg);
}

function animate2() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var plot1 = new Plottable.Plot.Area(quantitativeData, xScale, yScale).animate(true);
  var plot2 = new Plottable.Plot.Area(quantitativeData2, xScale, yScale).animate(true);

  plot1.project("fill", colors[0]);
  plot2.project("fill", colors[1]);

  var renderGroup = new Plottable.Component.Group([plot1, plot2, gridlines]);
  var table = new Plottable.Component.Table([[yAxis, renderGroup], [null, xAxis]]);
  table.renderTo(svg);
}

function animate3() {
  var svg = generateSVG();
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot1 = new Plottable.Plot.VerticalBar(ordinalData, xScale, yScale).animate(true);

  var table = new Plottable.Component.Table([[yAxis, plot1], [null, xAxis]]);
  table.renderTo(svg);
}
