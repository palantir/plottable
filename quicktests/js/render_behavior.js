//broken

function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);

  var d = data[0].slice(10, 15);
  var dataseries = new Plottable.Dataset(d);
  var i = 0;

  //Axis
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var barPlot = new Plottable.Plot.Area(dataseries, xScale, yScale).animate("true");

  var label1  = new Plottable.Component.Label("dataset.data()", "horizontal");
  var label2  = new Plottable.Component.Label("change width + resize", "horizontal");
  var label3  = new Plottable.Component.Label("remove + renderTo", "horizontal");
  var label4  = new Plottable.Component.Label("_render()", "horizontal");

  var basicTable = new Plottable.Component.Table([[yAxis, barPlot],
   [null, xAxis],
   [null, label1],
   [null, label2],
   [null, label3],
   [null, label4]]);

  basicTable.renderTo(svg);

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

  new Plottable.Interaction.Click(label1)
              .callback(newData)
              .registerWithComponent();

  new Plottable.Interaction.Click(label2)
              .callback(changeWidth)
              .registerWithComponent();

  new Plottable.Interaction.Click(label3)
              .callback(removeAndRenderTo)
              .registerWithComponent();

  new Plottable.Interaction.Click(label4)
              .callback(function(){basicTable._render();})
              .registerWithComponent();
}
