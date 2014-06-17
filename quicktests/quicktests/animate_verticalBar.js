// Will receive function arguments: (svg, data, Plottable)

var doAnimate = true;
var vBarRenderer;
var xScale = new Plottable.Scale.Linear();
var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

var yScale = new Plottable.Scale.Linear();
var yAxis = new Plottable.Axis.YAxis(yScale, "left");

vBarRenderer = new Plottable.Plot.VerticalBar(data[0].slice(0, 6), xScale, yScale);
vBarRenderer.project("opacity", 0.75);
vBarRenderer.animate(doAnimate);

var vBarChart = new Plottable.Component.Table([[yAxis, vBarRenderer],
                                         [null,  xAxis]]);
vBarChart.renderTo(svg);

addRemove = function(x, y){
	vBarRenderer.remove();
	vBarChart.addComponent(0, 1, vBarRenderer);
}

    window.xy = new Plottable.Interaction.Click(vBarRenderer)
        .callback(addRemove)
        .registerWithComponent();
