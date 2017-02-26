function makeData() {
  "use strict";
  return [{team: "Detroit Tigers", x: "4/1/1901", x2: "8/1/2015",
           y: 0, y2: 1,
           fill: "#DE4406", stroke: "#001742"},

          {team: "Detroit Wolverines", x: "4/1/1881", x2: "8/1/1888",
           y: 1, y2: 2,
           fill: "#f5f5dc", stroke: "#CF0032"},

           {team: "Detroit Stars", x: "4/1/1919", x2: "8/1/1931",
           y: 2, y2: 3,
           fill: "#00529B", stroke: "#CF0032"},

           {team: "Detroit Stars", x: "4/1/1933", x2: "8/1/1933",
           y: 2, y2: 3,
           fill: "#00529B", stroke: "#CF0032"},

           {team: "Detroit Stars", x: "4/1/1937", x2: "8/1/1937",
           y: 2, y2: 3,
           fill: "#00529B", stroke: "#CF0032"},

           {team: "Detroit Stars", x: "4/1/1954", x2: "8/1/1957",
           y: 2, y2: 3,
           fill: "#00529B", stroke: "#CF0032"},

           {team: "Detroit Stars", x: "4/1/1959", x2: "8/1/1959",
           y: 2, y2: 3,
           fill: "#00529B", stroke: "#CF0032"}
         ];
}

function run(container, data, Plottable) {
  "use strict";
  var timeFormatStart = function (d) { return d3.timeParse("%m/%d/%Y")(d.x); };
  var timeFormatEnd = function (d) { return d3.timeParse("%m/%d/%Y")(d.x2); };

  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Category();
  yScale.innerPadding(0.25).outerPadding(0.25);
  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
  var yAxis = new Plottable.Axes.Category(yScale, "left");
  var plot = new Plottable.Plots.Rectangle();
  plot.addDataset(new Plottable.Dataset(data));
  plot.x(timeFormatStart, xScale)
  .y(function(d) { return d.team; }, yScale)
  .x2(timeFormatEnd, xScale)
  .attr("fill", function(d) { return d.fill; })
  .attr("stroke", function(d) { return d.stroke; });

  var table = new Plottable.Components.Table([[yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(container);
}
