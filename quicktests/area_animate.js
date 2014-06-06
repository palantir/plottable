var quicktest = function(svg, data, Plottable) {

      var doAnimate = true;
      var areaRenderer;
      var xScale = new Plottable.Scale.Linear();
      var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.YAxis(yScale, "left");

      areaRenderer = new Plottable.Plot.Area(data[0].slice(0, 21), xScale, yScale);
      areaRenderer.project("opacity", 0.75);
      areaRenderer.animate(doAnimate);

      var areaChart = new Plottable.Component.Table([[yAxis, areaRenderer],
                                               [null,  xAxis]]);
      areaChart.renderTo(svg);
}

quicktest.quicktestName = "area_animate";
quicktests.push(quicktest);
