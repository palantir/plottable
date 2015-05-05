function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

//test for update on data change

function run(svg, data, Plottable) {
  "use strict";

    var numPts = 5;

    var dataseries1 = new Plottable.Dataset(data[0].slice(0, 5));

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");


    var barPlot = new Plottable.Plots.Bar(xScale, yScale, true)
        .addDataset(dataseries1)
        .animate(true)
        .project("x", "x", xScale)
        .project("y", "y", yScale);

    var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale)
        .addDataset(dataseries1)
        .attr("fill", function() { return "purple"; })
        .animate(true)
        .project("x", "x", xScale)
        .project("y", "y", yScale);

    var renderGroup = barPlot.below(scatterPlot);

    var basicTable = new Plottable.Components.Table()
                .addComponent(2, 0, yAxis)
                .addComponent(2, 1, renderGroup)
                .addComponent(3, 1, xAxis);

    basicTable.renderTo(svg);


    var cb = function(x, y){
        if(numPts === 5){
            dataseries1.data(data[1].slice(0, 10));
            numPts = 10;
        } else {
            dataseries1.data(data[0].slice(0, 5));
            numPts = 5;
        }
    };

    renderGroup.registerInteraction(
        new Plottable.Interactions.Click().onClick(cb)
    );

}
