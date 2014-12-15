function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

//test for update on data change

function run(div, data, Plottable) {
  "use strict";

    var svg = div.append("svg").attr("height", 500);

    var numPts = 5;

    var dataseries1 = new Plottable.Dataset(data[0].splice(0, 5));

    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");


    var barPlot = new Plottable.Plot.VerticalBar(xScale, yScale)
        .addDataset(dataseries1)
        .animate(true)
        .project("x", "x", xScale)
        .project("y", "y", yScale);

    var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale)
        .addDataset(dataseries1)
        .attr("fill", function() { return "purple"; })
        .animate(true)
        .project("x", "x", xScale)
        .project("y", "y", yScale);

    var renderGroup = barPlot.merge(scatterPlot);

    var basicTable = new Plottable.Component.Table()
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
        new Plottable.Interaction.Click().callback(cb)
    );

}
