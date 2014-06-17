// Will receive function arguments: (svg, data, Plottable)

var doAnimate = true;
var hBarRenderer;
var xScale = new Plottable.Scale.Linear();
var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

var yScale = new Plottable.Scale.Linear();
var yAxis = new Plottable.Axis.YAxis(yScale, "left");

hBarRenderer = new Plottable.Plot.HorizontalBar(data[0].slice(0, 6), xScale, yScale);
hBarRenderer.project("opacity", 0.75);
hBarRenderer.animate(doAnimate);

var hBarChart = new Plottable.Component.Table([[yAxis, hBarRenderer],
                                         [null,  xAxis]]);
hBarChart.renderTo(svg);

addRemove = function(x, y){
	hBarRenderer.remove();
	hBarChart.addComponent(0, 1, hBarRenderer);
}

    window.xy = new Plottable.Interaction.Click(hBarRenderer)
        .callback(addRemove)
        .registerWithComponent();
