function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

   data = [{x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 4}, {x: 3, y: 6}, {x: 4, y: 5}, {x: 5, y: 3}, {x: 6, y: 0.5}];  
      
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var IdTitle = new Plottable.Component.Label("Identity");
  var DowTitle = new Plottable.Component.Label("Day of Week");
   var EmpIDTitle = new Plottable.Component.Label("Emp ID");

  var DOWFormatter = function(d) { 
      var DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return DOW[d%7];
  };
  var EmpIDFormatter = function(d) {
      var Emp = ["Justin", "Cassie", "Brandon", "Roger", "Dan", "Lewin", "Brian"];
      return Emp[d%7];
  };

  var plot = new Plottable.Plot.Bar(xScale, yScale).addDataset(data);
  plot.project("x", "x", xScale).project("y", "y", yScale);
  var basicTable = new Plottable.Component.Table([[yAxis, plot], [null, xAxis]]);
  var formatChoices = new Plottable.Component.Table([[IdTitle],[DowTitle],[EmpIDTitle]]);
  var bigTable = new Plottable.Component.Table([[basicTable],[formatChoices]]);
  formatChoices.xAlign("center");

  bigTable.renderTo(svg);

  function identity_frmt() {
    xAxis.formatter(Plottable.Formatters.identity());
  }    
  function dow_frmt() {
     xAxis.formatter(DOWFormatter);
  }
  function emp_frmt() {
     xAxis.formatter(EmpIDFormatter);
  }

  IdTitle.registerInteraction(new Plottable.Interaction.Click().callback(identity_frmt));
  DowTitle.registerInteraction(new Plottable.Interaction.Click().callback(dow_frmt));
  EmpIDTitle.registerInteraction(new Plottable.Interaction.Click().callback(emp_frmt));

}
