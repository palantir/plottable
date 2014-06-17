// Will receive function arguments: (svg, data, Plottable)

var doAnimate = true;
var lineRenderer;
var xScale = new Plottable.Scale.Linear();
var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

var yScale = new Plottable.Scale.Linear();
var yAxis = new Plottable.Axis.YAxis(yScale, "left");

lineRenderer = new Plottable.Plot.Line(data[0].slice(0, 20), xScale, yScale);
lineRenderer.project("opacity", 0.75);
lineRenderer.animate(doAnimate);

var lineChart = new Plottable.Component.Table([[yAxis, lineRenderer],
                                         [null,  xAxis]]);
lineChart.renderTo(svg);

addRemove = function(x, y){
	lineRenderer.remove();
	lineChart.addComponent(0, 1, lineRenderer);
}

    window.xy = new Plottable.Interaction.Click(lineRenderer)
        .callback(addRemove)
        .registerWithComponent();


