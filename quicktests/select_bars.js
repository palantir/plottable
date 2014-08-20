
function makeData() {
  return [makeRandomData(50), makeRandomData(50)];

}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

            var dataseries = data[0].slice(0, 20);

            var xScale = new Plottable.Scale.Linear();
            var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

            var yScale = new Plottable.Scale.Linear();
            var yAxis = new Plottable.Axis.Numeric(yScale, "left");

            var barPlot = new Plottable.Plot.VerticalBar(dataseries, xScale, yScale);
            var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
            var renderGroup = gridlines.merge(barPlot);
            var title = new Plottable.Component.TitleLabel("reset");

            new Plottable.Template.StandardChart()
                          .titleLabel(title)
                          .xAxis(xAxis).yAxis(yAxis)
                          .center(renderGroup)
                          .renderTo(svg);

    //callbacks
            cb_drag = function(start, end) {
                if (start == null || end == null) {return;}
                var minX = Math.min(start.x, end.x);
                var maxX = Math.max(start.x, end.x);
                var minY = Math.min(start.y, end.y);
                var maxY = Math.max(start.y, end.y);
                barPlot.selectBar({min: minX, max: maxX},
                                  {min: minY, max: maxY},
                                       true);
                drag_interaction.clearBox();
            }

            cb_click = function(x, y) {
                barPlot.selectBar(x, y, true);
            }

            cb_reset = function() {
                barPlot.deselectAll();
            }

    //register interactions
            var drag_interaction = new
            Plottable.Interaction.XYDragBox(renderGroup)
            .dragend(cb_drag)
            .registerWithComponent();

            var click_interaction = new
            Plottable.Interaction.Click(renderGroup)
            .callback(cb_click)
            .registerWithComponent();

            var reset_interaction = new
            Plottable.Interaction.Click(title)
            .callback(cb_reset)
            .registerWithComponent();

}
