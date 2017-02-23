function makeData() {
  "use strict";
  var blueSet = makeRandomData(20);
  var redSet = makeRandomData(20);
  return [blueSet, redSet];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var defaultTitleText = "Hover over points";
  var title = new Plottable.Components.TitleLabel(defaultTitleText);

  var ds1 = new Plottable.Dataset(data[0], { color: "blue", size: 20 });
  var ds2 = new Plottable.Dataset(data[1], { color: "red", size: 30 });

  var plot = new Plottable.Plots.Scatter();
  plot.addDataset(ds1);
  plot.addDataset(ds2);
  plot.size(function(d, i, dataset) { return dataset.metadata().size; });
  plot.attr("fill", function(d, i, dataset) { return dataset.metadata().color; });
  plot.x(function(d) { return d.x; }, xScale);
  plot.y(function(d) { return d.y; }, yScale);

  var chart = new Plottable.Components.Table([
      [null, title],
      [yAxis, plot],
      [null, xAxis]]);

  chart.renderTo(svg);

  var hoverCircle = plot.foreground().append("circle").attrs({
                                               "stroke": "black",
                                               "fill": "none",
                                               "r": 15
                                             })
                                             .style("visibility", "hidden");

  var pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove(function(p) {
    var datum;
    var position;
    if (typeof plot.entityNearest === "function") {
      var nearestEntity = plot.entityNearest(p);
      if (nearestEntity != null) {
        datum = nearestEntity.datum;
        position = nearestEntity.position;
      }
    } else {
      var cpd = plot.getClosestPlotData(p);
      if (cpd.data.length > 0) {
        datum = cpd.data[0];
        position = cpd.pixelPoints[0];
      }
    }
    if (datum != null) {
      var xString = datum.x.toFixed(2);
      var yString = datum.y.toFixed(2);
      title.text("[ " + xString + ", " + yString + " ]");
      hoverCircle.attrs({
        "cx": position.x,
        "cy": position.y
      }).style("visibility", "visible");
    } else {
      title.text(defaultTitleText);
      hoverCircle.style("visibility", "hidden");
    }
  });
  pointer.onPointerExit(function() {
    title.text(defaultTitleText);
    hoverCircle.style("visibility", "hidden");
  });
  pointer.attachTo(plot);
}
