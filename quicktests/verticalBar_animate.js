var quicktests = (quicktests || []);

var quicktest = function(svg, data, Plottable) {

      var vBarRenderer;
      var xScale = new Plottable.Scale.Linear();
      var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.YAxis(yScale, "left");

      vBarRenderer = new Plottable.Plot.verticalBar(data[0].slice(0, 6), xScale, yScale);
      vBarRenderer.project("opacity", 0.75);
      vBarRenderer.animate(doAnimate);

      var vBarChart = new Plottable.Table([[yAxis, vBarRenderer],
                                               [null,  xAxis]]);
      vBarChart.renderTo(svg);
}

quicktests.push(quicktest);
