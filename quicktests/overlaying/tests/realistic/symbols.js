function makeData() {
  "use strict";
    var d = [{x: 0, y: 0}];

  return [d];
}

function run(svg, data, Plottable){
  "use strict";
     console.log(data[0]);

    var d = [];
    deep_copy(data[0], d);
    var dataset = new Plottable.Dataset(d);

    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    
    var plot = new Plottable.Plot.Scatter(xScale, yScale);
    plot.addDataset(dataset);
    plot.project("x", "x", xScale)
    .project("y", "y", yScale)
    .project("r", 15)
    .project("symbol", Plottable.SymbolGenerators.d3Symbol( function (datum) {return datum.y>0?(datum.x>0?"triangle-up":"circle"):(datum.x>0?"cross":"triangle-down");}))
    .project("fill", function(datum){return datum.y>0?(datum.x>0?"#00bb00":"#bbbbbb"):(datum.x>0?"#bbbbbb":"#bb0000");});
     
    
    var title = new Plottable.Component.Label("n = new point, d = delete point");
    var cs = new Plottable.Scale.Color();
    var legend = new Plottable.Component.Legend(cs);
    cs.domain(["x+y+", "x+y-", "x-y+", "x-y-"]); 
    cs.range(["#00bb00", "#bbbbbb", "#bbbbbb", "#bb0000"]);
    
    legend.symbolGenerator(Plottable.SymbolGenerators.d3Symbol( function (d, i) {
        if(d === "x+y+"){ return "triangle-up";}
        if(d === "x+y-"){ return "cross";}
        if(d === "x-y+") { return "circle";}
        if(d === "x-y-"){ return "triangle-down";}
    }));
    
    var table = new Plottable.Component.Table([[null, title, null],
                                               [yAxis, plot, legend],
                                               [null, xAxis, null]]);
    table.renderTo(svg);
    
    var hover = new Plottable.Interaction.Hover();
    hover.onHoverOver(function(hoverData) {
      var xString = hoverData.data[0].x.toFixed(2);
      var yString = hoverData.data[0].y.toFixed(2);
      title.text("[ " + xString + ", " + yString + " ]");
    });
    hover.onHoverOut(function(hoverData) {
      title.text("n = new point, d = delete point, c = log points");
    });
    
    var key = new Plottable.Interaction.Key();
    key.on(78, function(keyData){     
        d.push({x: Math.random() - .5, y: Math.random() - .5});
        dataset.data(d);
    });

  key.on(68, function(keyData){
      if(d.length > 0){
        d.splice(d.length-1,1);
        dataset.data(d);
      }     
  });
    
  plot.registerInteraction(hover);
  plot.registerInteraction(key);


}
