
function makeChartWithAreaInteraction() {
    var dataseries = makeRandomData(50);

    var svg = d3.select("#selection-demo");
    svg.attr("width", 480).attr("height", 320);
    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom");
    var yScale = new Plottable.LinearScale();
    var yAxis = new Plottable.YAxis(yScale, "left");
    var renderAreaD1 = new Plottable.CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Plottable.Table([[yAxis, renderAreaD1],
                                          [null, xAxis]]);

    var areaInteraction = new Plottable.AreaInteraction(renderAreaD1); // attach a new AreaInteraction to the render area
    var lastSelection = null; // initially, nothing is selected
    var selectPoints = function(pixelArea) {
        if (lastSelection != null) {
            lastSelection.classed("selected-point", false); // clear out the last set of selected points
        }
        var selectionArea = renderAreaD1.invertXYSelectionArea(pixelArea);
        var selected = renderAreaD1.getSelectionFromArea(selectionArea);
        selected.classed("selected-point", true); // set a selected class on the points
        lastSelection = selected;
    };
    areaInteraction.callback(selectPoints); // add selectPoints as a callback when a selection is made

    basicTable.anchor(svg).computeLayout().render();
};

window.onload = makeChartWithAreaInteraction;
