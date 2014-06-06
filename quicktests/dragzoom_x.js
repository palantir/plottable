var quicktests = (quicktests || []);

var quicktest = function(svg, data, Plottable){

        var dataseries = data[0].slice(0, 21);
        var dataseries_top = data[1].slice(0, 21);
        for (var i = 0; i < 20; ++i) {
          dataseries_top[i].x = dataseries[i].x;
          dataseries_top[i].y += dataseries[i].y;
        }

        var xScale = new Plottable.Scale.Linear();
        var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

        var yScale = new Plottable.Scale.Linear();
        var yAxis = new Plottable.Axis.YAxis(yScale, "left");

        var y0Accessor = function(d, i) { return dataseries[i].y; }

        var renderAreaD1 = new Plottable.Plot.Area(dataseries, xScale, yScale);
        var renderAreaD2 = new Plottable.Plot.Area(dataseries_top, xScale, yScale, "x", "y", y0Accessor);

        var fillAccessor = function() { return "steelblue"; }
        var fillAccessorTop = function() { return "pink"; }
        renderAreaD1.project("fill", fillAccessor)
        renderAreaD2.project("fill", fillAccessorTop)

        var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
        var renderGroup = new Plottable.Component.Group([gridlines, renderAreaD1, renderAreaD2]);

        var chart = new Plottable.Template.StandardChart()
                        .center(renderGroup).xAxis(xAxis).yAxis(yAxis)
                        .renderTo("#x-test");

        window.x = new Plottable.Interaction.XDragBox(renderGroup).setupZoomCallback(xScale, null).registerWithComponent();

}

quicktests.push(quicktest)
