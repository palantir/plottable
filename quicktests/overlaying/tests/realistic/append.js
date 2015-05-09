function makeData() {
  "use strict";
  var d = [];

  return [d];
}

function run(svg, data, Plottable){
  "use strict";
  data = [];
  var dataset = new Plottable.Dataset(data);
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Scatter(xScale, yScale, false);
  plot.addDataset(dataset);
  plot.project("x", "x", xScale)
  .project("y", "y", yScale);

  var defaultTopTitleText = "n = new point, d = delete last point";
  var title_t = new Plottable.Components.Label(defaultTopTitleText);
  var title_b = new Plottable.Components.Label("a = mark selection[0], c = clear");
  var table = new Plottable.Components.Table([[null, title_t],
                                             [null, title_b],
                                             [yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(svg);

  var pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove(function(p) {
    var cpd = plot.getClosestPlotData(p);
    if (cpd.data.length > 0) {
      var dist = Math.sqrt(Math.pow((p.x - cpd.pixelPoints[0].x), 2) + Math.pow((p.y - cpd.pixelPoints[0].y), 2));
      if (dist < 15) {
        var xString = cpd.data[0].x.toFixed(2);
        var yString = cpd.data[0].y.toFixed(2);
        title_t.text("[ " + xString + ", " + yString + " ]");
        return;
      }
    }
    title_t.text(defaultTopTitleText);
  });
  pointer.onPointerExit(function() {
    title_t.text(defaultTopTitleText);
  });

  var append = function(num){
      var x = plot.getAllPlotData().pixelPoints[num-48].x;
      var y = plot.getAllPlotData().pixelPoints[num-48].y;
      plot.foreground().append("circle")
           .attr({"stroke": "red",
                  "fill": "red",
                  "r": 5,
                  "cx": x,
                  "cy": y});
  };
  var key = new Plottable.Interactions.Key();
  // add
  key.onKey(78, function(keyData){
      data.push({x: Math.random(), y: Math.random()});
      dataset.data(data);
  });
  // mark
  key.onKey(65, function(keyData){
    append(48);
  });
  // clear
  key.onKey(67, function(keyData){
    plot.foreground().text("");
  });
  // delete
  key.onKey(68, function(keyData){
    if(data.length > 0){
      data.splice(data.length-1,1);
      dataset.data(data);
    }
  });

  pointer.attachTo(plot);
  key.attachTo(plot);
}
