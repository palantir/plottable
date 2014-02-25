window.onload = function() {
    var dataseries = makeRandomData(50);

    var svg = d3.select("#selection-demo");
    svg.attr("width", 480).attr("height", 320);
    var xScale = new LinearScale();
    var xAxis = new XAxis(xScale, "bottom");
    var yScale = new LinearScale();
    var yAxis = new YAxis(yScale, "left");
    var renderAreaD1 = new CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Table([[yAxis, renderAreaD1],
                                [null, xAxis]]);

    var areaInteraction = new AreaInteraction(renderAreaD1); // attach a new AreaInteraction to the render area
    var lastSelection = null; // initially, nothing is selected
    var selectPoints = function(pixelArea) {
        if (lastSelection != null) {
            lastSelection.classed("seleted-point", false); // clear out the last set of selected points
        }
        var selectionArea = renderAreaD1.invertXYSelectionArea(pixelArea);
        var selected = renderAreaD1.getSelectionFromArea(selectionArea);
        selected.classed("selected-point", true); // set a selected class on the points
        lastSelection = selected;
    };
    areaInteraction.callback(selectPoints); // add selectPoints as a callback when a selection is made

    basicTable.anchor(svg).computeLayout().render();
};
