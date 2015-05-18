function makeData() {
  "use strict";
  return [{team: "Detroit Tigers", x1: "4/1/1901", x2: "8/1/2015",
                 y1: 0, y2: 1,
                 fill: "#DE4406", stroke: "#001742"},

                {team: "Detroit Wolverines", x1: "4/1/1881", x2: "8/1/1888",
                 y1: 1, y2: 2,
                 fill: "#f5f5dc", stroke: "#CF0032"},

                 {team: "Detroit Stars", x1: "4/1/1919", x2: "8/1/1931",
                 y1: 2, y2: 3,
                 fill: "#00529B", stroke: "#CF0032"},

                 {team: "Detroit Stars", x1: "4/1/1933", x2: "8/1/1933",
                 y1: 2, y2: 3,
                 fill: "#00529B", stroke: "#CF0032"},

                 {team: "Detroit Stars", x1: "4/1/1937", x2: "8/1/1937",
                 y1: 2, y2: 3,
                 fill: "#00529B", stroke: "#CF0032"},

                 {team: "Detroit Stars", x1: "4/1/1954", x2: "8/1/1957",
                 y1: 2, y2: 3,
                 fill: "#00529B", stroke: "#CF0032"},

                 {team: "Detroit Stars", x1: "4/1/1959", x2: "8/1/1959",
                 y1: 2, y2: 3,
                 fill: "#00529B", stroke: "#CF0032"}
               ];
}

function run(svg, data, Plottable) {
  "use strict";

  var timeFormatStart = function (data) { return d3.time.format("%m/%d/%Y").parse(data.x1);};
  var timeFormatEnd = function (data) { return d3.time.format("%m/%d/%Y").parse(data.x2);};

  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Category();
  yScale.innerPadding(0.25).outerPadding(0.25);
  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
  var yAxis = new Plottable.Axes.Category(yScale, "left");
  var plot = new Plottable.Plots.Grid(xScale, yScale);
  plot.addDataset(new Plottable.Dataset(data));
  plot.x(timeFormatStart, xScale)
  .y(function(d) { return d.team; }, yScale)
  .x2(timeFormatEnd, xScale)
  .attr("fill", function(d) { return d.fill; })
  .attr("stroke", function(d) { return d.stroke; });

  var table = new Plottable.Components.Table([[yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(svg);
}
