function makeData() {
    return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
    var svg = div.append("svg").attr("height", 500);

        var renderers = [];

        var numRenderers = 5;
        var names = ["bat", "cat", "mat", "rat", "pat"];
        var colorScale = new Plottable.Scale.Color();
        if (colorScale.range().length === 0) { // cross-compatibility on color scale change
            colorScale = new Plottable.Scale.Color("10");
        }
        colorScale.domain(names);
        var colors = colorScale.range();

        var xScale = new Plottable.Scale.Linear();
        var yScale = new Plottable.Scale.Linear();

        for (var i=0; i<numRenderers; i++) {
            var d = data[0].slice(i*10, i*10 + 10);
            var renderer = new Plottable.Plot.Scatter(d, xScale, yScale);
            renderers.push(renderer);
        }

        var cg = new Plottable.Component.Group();
        renderers.forEach(function(renderer, i) {
            renderer
            .project("fill", function() { return colors[i]; })
            .project("r", function(){ return 6;})
            cg.merge(renderer);
        });

        var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
        var yAxis = new Plottable.Axis.Numeric(yScale, "left");

        var chart = new Plottable.Component.Table([
                                  [yAxis, cg],
                                  [null,  xAxis]
                                ]);

        var legendLabel = new Plottable.Component.TitleLabel("fat");
        var legend = new Plottable.Component.Legend(colorScale);
        var legendTable = new Plottable.Component.Table([[legendLabel], [legend]]);

        var outerTable = new Plottable.Component.Table([[chart, legendTable]]);
        outerTable.renderTo(svg);

        cb = function(start, end) {
            if (start == null || end == null) {return;}
            var xMin = Math.min(start.x, end.x);
            var xMax = Math.max(start.x, end.x);
            var yMin = Math.min(start.y, end.y);
            var yMax = Math.max(start.y, end.y);
            var invertedXMin = xScale.invert(xMin);
            var invertedXMax = xScale.invert(xMax);
            var invertedYMin = yScale.invert(yMax);
            var invertedYMax = yScale.invert(yMin);
            xScale.domain([invertedXMin, invertedXMax]);
            yScale.domain([invertedYMin, invertedYMax]);
            dragboxInteraction.clearBox();
        }

        var dragboxInteraction = new Plottable.Interaction.XYDragBox(cg)
             .dragend(cb)
             .registerWithComponent();

        cb2 = function(xy) {
            xScale.autoDomain();
            yScale.autoDomain();
        }

        var doubleClickInteraction = new Plottable.Interaction.DoubleClick(cg)
             .callback(cb2)
             .registerWithComponent();

}
