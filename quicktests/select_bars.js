
function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
  
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
        data = _.cloneDeep(data);


            var dataseries = data[0].slice(0, 20);

            var xScale = new Plottable.Scale.Linear();
            var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

            var yScale = new Plottable.Scale.Linear();
            var yAxis = new Plottable.Axis.Numeric(yScale, "left");

            renderAreaD1 = new Plottable.Plot.VerticalBar(dataseries, xScale, yScale);
            var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
            var renderGroup = gridlines.merge(renderAreaD1);
            var title = new Plottable.Component.TitleLabel("reset");

            new Plottable.Template.StandardChart()
                          .titleLabel(title)
                          .xAxis(xAxis).yAxis(yAxis)
                          .center(renderGroup)
                          .renderTo(svg);

    //callbacks
            cb_drag = function(xy) {
                if (xy == null) {return;}
                var invertedXMin = xScale.invert(xy.xMin);
                var invertedXMax = xScale.invert(xy.xMax);
                var invertedYMin = yScale.invert(xy.yMax);
                var invertedYMax = yScale.invert(xy.yMin);
                renderAreaD1.selectBar({min: xy.xMin, max: xy.xMax}, 
                                       {min: xy.yMin, max: xy.yMax}, 
                                       true);
            }
            
            cb_click = function(x, y) {
                renderAreaD1.selectBar(x, y, true);
            }
            
            cb_reset = function() {
                renderAreaD1.deselectAll();
            }        
            
    //register interactions        
            var drag_interaction = new            
            Plottable.Interaction.XYDragBox(renderGroup)
            .callback(cb_drag)
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