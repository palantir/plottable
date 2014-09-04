function makeData() {
  "use strict";

  var  data1 = [{month: "January", avg: 2.75, city: "Palo Alto"}, {month: "February", avg: 3.07, city: "Palo Alto"},{month: "March", avg: 2.26, city: "Palo Alto"},{month: "April", avg: 0.98, city: "Palo Alto"},{month: "May", avg: 0.47, city: "Palo Alto"},{month: "June", avg: 0.1, city: "Palo Alto"},{month: "July", avg: 0.02, city: "Palo Alto"},{month: "August", avg: 0.01, city: "Palo Alto"},{month: "September", avg: 0.18, city: "Palo Alto"},{month: "October", avg: 0.64, city: "Palo Alto"},{month: "November", avg: 1.64, city: "Palo Alto"},{month: "December", avg: 2.56, city: "Palo Alto"}];
  var  data2 = [{month: "January", avg: 4.21, city: "San Francisco"}, {month: "February", avg: 4.10, city: "San Francisco"},{month: "March", avg: 2.74, city: "San Francisco"},{month: "April", avg: 1.18, city: "San Francisco"},{month: "May", avg: 0.72, city: "San Francisco"},{month: "June", avg: 0.15, city: "San Francisco"},{month: "July", avg: 0.01, city: "San Francisco"},{month: "August", avg: 0.04, city: "San Francisco"},{month: "September", avg: 0.19, city: "San Francisco"},{month: "October", avg: 0.94, city: "San Francisco"},{month: "November", avg: 2.50, city: "San Francisco"},{month: "December", avg: 4.00, city: "San Francisco"}];
  var  data3 = [{month: "January", avg: 2.99, city: "San Jose"}, {month: "February", avg: 3.32, city: "San Jose"},{month: "March", avg: 2.04, city: "San Jose"},{month: "April", avg: 1.06, city: "San Jose"},{month: "May", avg: 0.39, city: "San Jose"},{month: "June", avg: 0.09, city: "San Jose"},{month: "July", avg: 0.00, city: "San Jose"},{month: "August", avg: 0.0, city: "San Jose"},{month: "September", avg: 0.23, city: "San Jose"},{month: "October", avg: 0.78, city: "San Jose"},{month: "November", avg: 1.88, city: "San Jose"},{month: "December", avg: 2.12, city: "San Jose"}];

  return [data1, data2, data3];
}

function run(div, data, Plottable){
  "use strict";

  var svg = div.append("svg").attr("height", "80%");
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color();

  yScale.domain([0, 5.5]).ticks(5);

  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis1 = new Plottable.Axis.Numeric(yScale, "left");
  var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");
  var yAxis3 = new Plottable.Axis.Numeric(yScale, "left");


  var palo_alto_bar = new Plottable.Plot.VerticalBar(data[0], xScale, yScale)
    .animate(true)
    .project("x", "month", xScale)
    .project("y", "avg", yScale)
    .project("fill", "city", colorScale);

  var san_francisco_bar = new Plottable.Plot.VerticalBar(data[1], xScale, yScale)
    .animate(true)
    .project("x", "month", xScale)
    .project("y", "avg", yScale)
    .project("fill", "city", colorScale);

  var san_jose_bar = new Plottable.Plot.VerticalBar(data[2], xScale, yScale)
    .animate(true)
    .project("x", "month", xScale)
    .project("y", "avg", yScale)
    .project("fill", "city", colorScale);

  var legend = new Plottable.Component.HorizontalLegend(colorScale);
  var title = new Plottable.Component.TitleLabel("Average Rainfall in Different Cities between 2013-2014", "horizontal" );


  legend.xAlign("right");

  var g1 = new Plottable.Component.Gridlines(null, yScale);
  var g2 = new Plottable.Component.Gridlines(null, yScale);
  var g3 = new Plottable.Component.Gridlines(null, yScale);
  palo_alto_bar     = g1.merge(palo_alto_bar);
  san_francisco_bar = g2.merge(san_francisco_bar);
  san_jose_bar      = g3.merge(san_jose_bar);

  var chart = new Plottable.Component.Table([
                  [null    ,   title            ],
                  [null    ,   legend           ],
                  [yAxis1  ,   palo_alto_bar    ],
                  [yAxis2  ,   san_francisco_bar],
                  [yAxis3  ,   san_jose_bar     ],
                  [null    ,   xAxis            ]]);

  chart.renderTo(svg);
}
