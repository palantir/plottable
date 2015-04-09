function makeData() {
  "use strict";
  var d = [];

  return [d];
}

function run(svg, data, Plottable){
  "use strict";
  data = [];
  var dataset = new Plottable.Dataset(data);
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  
  var plot = new Plottable.Plot.Scatter(xScale, yScale, false);
  plot.addDataset(dataset);
  plot.project("x", "x", xScale)
  .project("y", "y", yScale);
  
  var title_t = new Plottable.Component.Label("n = new point, d = delete point");
  var title_b = new Plottable.Component.Label("a = mark selection[0], c = clear");    
  var table = new Plottable.Component.Table([[null, title_t],
                                             [null, title_b],
                                             [yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(svg);
  
  var hover = new Plottable.Interaction.Hover();
  hover.onHoverOver(function(hoverData) {
    var xString = hoverData.data[0].x.toFixed(2);
    var yString = hoverData.data[0].y.toFixed(2);
    title_t.text("[ " + xString + ", " + yString + " ]");
  });
  hover.onHoverOut(function(hoverData) {
    title_t.text("n = new point, d = delete point, c = log points");
  });
  
  var append = function(num){
      var x = plot.getAllPlotData().pixelPoints[num-48].x;
      var y = plot.getAllPlotData().pixelPoints[num-48].y;
      plot.foreground().append("circle")
           .attr({"stroke": "red",
                  "fill": "red",
                  "r": 5,
                  "cx": x,
                  "cy": y});
  };
  var key = new Plottable.Interaction.Key();
  key.on(78, function(keyData){
      data.push({x: Math.random(), y: Math.random()});
      dataset.data(data);
  });
  key.on(65, function(keyData){
      append(48);
  });
  key.on(67, function(keyData){
          plot.foreground().text("");    
  });
  key.on(68, function(keyData){
    if(data.length > 0){
      data.splice(data.length-1,1);
      dataset.data(data);
    }     
  });
  
  plot.registerInteraction(hover);
  plot.registerInteraction(key);
}
