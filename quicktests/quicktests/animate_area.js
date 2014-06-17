// Will receive function arguments: (svg, data, Plottable)

var doAnimate = true;
var areaRenderer;
var xScale = new Plottable.Scale.Linear();
var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

var yScale = new Plottable.Scale.Linear();
var yAxis = new Plottable.Axis.YAxis(yScale, "left");

areaRenderer = new Plottable.Plot.Area(data[0].slice(0, 20), xScale, yScale);
areaRenderer.project("opacity", 0.75);
areaRenderer.animate(doAnimate);

var areaChart = new Plottable.Component.Table([[yAxis, areaRenderer],
                                         [null,  xAxis]]);
areaChart.renderTo(svg);

addRemove = function(x, y){
	areaRenderer.remove();
	areaChart.addComponent(0, 1, areaRenderer);
}

    window.xy = new Plottable.Interaction.Click(areaRenderer)
        .callback(addRemove)
        .registerWithComponent();


