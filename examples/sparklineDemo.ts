///<reference path="../lib/d3.d.ts" />

///<reference path="../src/table.ts" />
///<reference path="../src/renderer.ts" />
///<reference path="../src/interaction.ts" />
///<reference path="../src/labelComponent.ts" />
///<reference path="../src/axis.ts" />
///<reference path="../src/scale.ts" />
///<reference path="exampleUtil.ts" />

if ((<any> window).demoName === "sparkline-demo") {

var yScale = new LinearScale();
var xScale = new LinearScale();
var left = new YAxis(yScale, "left");
var data = makeRandomData(1000, 200);
var renderer = new CircleRenderer(data, xScale, yScale);
var bottomAxis = new XAxis(xScale, "bottom");
var xSpark = new LinearScale();
var ySpark = new LinearScale();
var sparkline = new LineRenderer(data, xSpark, ySpark);
sparkline.rowWeight(0.3);

var r1: Component[] = [left, renderer];
var r2: Component[] = [null, bottomAxis];
var r3: Component[] = [null, sparkline];

var chart = new Table([r1, r2, r3]);
chart.xMargin = 10;
chart.yMargin = 10;

var brushZoom = new BrushZoomInteraction(sparkline, xScale, yScale);
var toggleClass = function() {return !d3.select(this).classed("selected-point")};
var cb = (s) => s.classed("selected-point", toggleClass);
var areaInteraction = new AreaInteraction(renderer, null, cb);

var svg = d3.select("#table");
chart.anchor(svg);
chart.computeLayout();
chart.render();


}
