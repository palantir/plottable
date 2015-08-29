function makeData() {
  "use strict";
  return [{hospital: "yes", hour: "12 AM", percent: 2.8},
          {hospital: "yes", hour: "1 AM", percent: 2.9},
          {hospital: "yes", hour: "2 AM", percent: 2.7},
          {hospital: "yes", hour: "3 AM", percent: 2.7},
          {hospital: "yes", hour: "4 AM", percent: 2.7},
          {hospital: "yes", hour: "5 AM", percent: 2.7},
          {hospital: "yes",	hour: "6 AM", percent: 2.8},
          {hospital: "yes", hour: "7 AM", percent: 4.5},
          {hospital: "yes", hour: "8 AM", percent: 6.3},
          {hospital: "yes", hour: "9 AM", percent: 5.1},
          {hospital: "yes", hour: "10 AM", percent: 5.0},
          {hospital: "yes", hour: "11 AM", percent: 5.0},
          {hospital: "no", hour: "12 AM", percent: 4.2},
          {hospital: "no", hour: "1 AM", percent: 5.0},
          {hospital: "no", hour: "2 AM", percent: 5.0},
          {hospital: "no", hour: "3 AM", percent: 5.2},
          {hospital: "no", hour: "4 AM", percent: 5.2},
          {hospital: "no", hour: "5 AM", percent: 4.9},
          {hospital: "no", hour: "6 AM", percent: 4.6},
          {hospital: "no", hour: "7 AM", percent: 4.4},
          {hospital: "no", hour: "8 AM", percent: 4.2},
          {hospital: "no", hour: "9 AM", percent: 3.9},
          {hospital: "no", hour: "10 AM", percent: 3.8},
          {hospital: "no", hour: "11 AM", percent: 3.7}
         ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Category();
  var cs = new Plottable.Scales.InterpolatedColor();
  cs.range(["#ADD8E6", "#67818A"]);

  var xAxis = new Plottable.Axes.Category(xScale, "top");
  var yAxis = new Plottable.Axes.Category(yScale, "left");
  var plot = new Plottable.Plots.Rectangle();
  plot.addDataset(new Plottable.Dataset(data));
  plot.x(function(d){ return d.hospital; }, xScale)
      .y(function(d) { return d.hour; }, yScale)
      .label(function(d) { return d.percent.toString() + "%";  })
      .labelsEnabled(true)
      .attr("fill", function(d) { return d.percent; }, cs);

  var label = new Plottable.Components.Label("Born in hospital?", 0);
  var legend = new Plottable.Components.InterpolatedColorLegend(cs).xAlignment("center");

  var table = new Plottable.Components.Table([[null, legend],
                                              [null, label],
                                              [null, xAxis],
                                              [yAxis, plot]]);
  table.renderTo(svg);
}
