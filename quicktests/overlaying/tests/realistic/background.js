function makeData() {
  "use strict";
   var create_data = function(step, x_init, y_init, decrease){
      var d = [];
      while(x_init <= 10){
          var o = {};
         o.x = x_init;
         x_init += step;
         o.y = y_init;
         y_init *= decrease;
         d.push(o);
      } 
      return d;
  }  
  var data1 = create_data(.5, 0, 10, .95);
  var data2 = create_data(.5, 0, 9, .90);
  var data3 = create_data(.5, 0, 8, .80);

  return [data1, data2, data3];
}

function run(svg, data, Plottable){
  "use strict";
 
  var data1 = [];
  var data2 = [];
  var data3 = [];
  deep_copy(data[0], data1);   
  deep_copy(data[1], data2);   
  deep_copy(data[2], data3);   
    
  var xScale = new Plottable.Scale.Linear();
  xScale.domain([0, 10]);
  var xAxis = new Plottable.Axis.Numeric(xScale, 'bottom');
  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, 'left');    
  
  var plot1 = new Plottable.Plot.Area(xScale, yScale);
  plot1.addDataset(data1);
  plot1.project("x", "x", xScale).project("y", "y", yScale);
  plot1.project("fill", '#923458')
  .project("opacity", .2)
  .project("stroke-width", 0);
                
  var plot2 = new Plottable.Plot.Area(xScale, yScale);
  plot2.addDataset(data2);
  plot2.project("x", "x", xScale).project("y", "y", yScale);
  plot2.project("fill", '#923458')
  .project("opacity", .3)
  .project("stroke-width", 0);
      
  var plot3 = new Plottable.Plot.Area(xScale, yScale);
  plot3.addDataset(data3);
  plot3.project("x", "x", xScale).project("y", "y", yScale);
  plot3.project("fill", '#923458')
  .project("opacity", .4)
  .project("stroke-width", 0);
  
  var cs = new Plottable.Scale.Color();
  cs.domain(["#434343", "#923458", "#384658"]);
  cs.range(["#434343", "#923458", "#38ff58"]);
  var legend = new Plottable.Component.Legend(cs);
  
  var plots = plot1.merge(plot2).merge(plot3);
  var label = new Plottable.Component.Label("TITLE LABEL");
  
  var table = new Plottable.Component.Table([[null, label, null],
                                             [yAxis, plots, legend],
                                             [null, xAxis, null]]);
 
  table.renderTo(svg);
        
  plots.background()
  .select('.background-fill')
  .style('fill', '#923458')
  .style('opacity', .1);

  xAxis.background()
  .select('.background-fill')
  .style('fill', '#120378')
  .style('opacity', .1);
  
  yAxis.background()
  .select('.background-fill')
  .style('fill', '#bba411')
  .style('opacity', .1);
  
  label.background()
  .select('.background-fill')
  .style('fill', '#358923')
  .style('opacity', .3);
  
  legend.background()
  .select('.background-fill')
  .style('fill', '#33e4e9')
  .style('opacity', .1);

}


