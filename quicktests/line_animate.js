var quicktests = (quicktests || []);

var quicktest = function(svg, data, Plottable) {
      
      var doAnimate = true;
      var lineRenderer;
      var xScale = new Plottable.Scale.Linear();
      var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.YAxis(yScale, "left");

      lineRenderer = new Plottable.Plot.Line(data[0].slice(0, 21), xScale, yScale);
      lineRenderer.project("opacity", 0.75);
      lineRenderer.animate(doAnimate);

      var lineaChart = new Plottable.Table([[yAxis, lineRenderer],
                                               [null,  xAxis]]);
      lineChart.renderTo(svg);
}

quicktests.push(quicktest);
