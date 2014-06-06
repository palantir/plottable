var quicktests = (quicktests || []);

var quicktest = function(svg, data, Plottable) {

      var circleRenderer;
      var xScale = new Plottable.Scale.Linear();
      var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

      var yScale = new Plottable.Scale.Linear();
      var yAxis = new Plottable.Axis.YAxis(yScale, "left");

      circleRenderer = new Plottable.CircleRenderer(data[0].slice(0, 21), xScale, yScale);
      circleRenderer.project("r", 8);
      circleRenderer.project("opacity", 0.75);
      circleRenderer.animate(doAnimate);

      var circleChart = new Plottable.Table([[yAxis, circleRenderer],
                                               [null,  xAxis]]);
      circleChart.renderTo(svg);
}

quicktests.push(quicktest);





