///<reference path="../lib/d3.d.ts" />

///<reference path="../src/table.ts" />
///<reference path="../src/renderer.ts" />
///<reference path="../src/interaction.ts" />
///<reference path="../src/labelComponent.ts" />
///<reference path="../src/axis.ts" />
///<reference path="../src/scale.ts" />
///<reference path="exampleUtil.ts" />

if ((<any> window).demoName === "tsc-demo") {

var yScale = new LinearScale();
var xScale = new LinearScale();
var left = new YAxis(yScale, "left");
var data = makeRandomData(1000, 200);
var renderer = new LineRenderer(data, xScale, yScale);
var bottomAxis = new XAxis(xScale, "bottom");

var chart = new Table([[left, renderer]
                      ,[null, bottomAxis]]);

var outerTable = new Table([ [new TitleLabel("A Chart")],
                             [chart] ])
outerTable.xMargin = 10;
outerTable.yMargin = 10;

var svg = d3.select("#table");
outerTable.anchor(svg);
outerTable.computeLayout();
outerTable.render();
}
