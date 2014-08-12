//broken

function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

  var d = data[0].slice(10, 15);
  dataseries = new Plottable.DataSource(d);  var basicTable;
  var i;

    i = 0;
    
    //Axis
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    barPlot = new Plottable.Plot.Area(dataseries, xScale, yScale).animate("true");
    
    label1  = new Plottable.Component.Label("dataSource.data()", "horizontal");
    label2  = new Plottable.Component.Label("change width + resize", "horizontal");
    label3  = new Plottable.Component.Label("remove + renderTo", "horizontal");
    label4  = new Plottable.Component.Label("_render()", "horizontal");    
    
    basicTable = new Plottable.Component.Table([[yAxis, barPlot],
                                               [null, xAxis],
                                               [null, label1],
                                               [null, label2],
                                               [null, label3],
                                               [null, label4]]);
 
    basicTable.renderTo(svg);
        
    label1Interaction = new Plottable.Interaction.Click(label1)
    .callback(newData)
    .registerWithComponent();
        
    label2Interaction = new Plottable.Interaction.Click(label2)
    .callback(changeWidth)
    .registerWithComponent();
        
    label3Interaction = new Plottable.Interaction.Click(label3)
    .callback(removeAndRenderTo)
    .registerWithComponent();
        
    label4Interaction = new Plottable.Interaction.Click(label4)
    .callback(function(){basicTable._render();})
    .registerWithComponent();
    


    function newData(){
        var d = data[i%2].slice(0,5);
        dataseries.data(d); 
        i++;
    }
    function changeWidth() {
      svg.attr("width", 300 + (i%5)*40);
      basicTable.resize();
      i++;
    }
    
    function removeAndRenderTo() {
      basicTable.detach();
      basicTable.renderTo(svg);
    }



}
