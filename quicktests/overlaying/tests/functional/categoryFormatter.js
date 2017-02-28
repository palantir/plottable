function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(container, data, Plottable) {
  "use strict";

  data = [{x: "0", y: 1}, {x: "1", y: 2}, {x: "2", y: 4}, {x: "3", y: 6}, {x: "4", y: 5}, {x: "5", y: 3}, {x: "6", y: 0.5}];
  var DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var Emp = ["Justin", "Cassie", "Brandon", "Roger", "Dan", "Lewin", "Brian"];

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var IdTitle = new Plottable.Components.Label("Identity");
  var DowTitle = new Plottable.Components.Label("Day of Week");
  var EmpIDTitle = new Plottable.Components.Label("Emp ID");

  var DOWFormatter = function(d) {
      return DOW[d % 7];
  };
  var EmpIDFormatter = function(d) {
      return Emp[d % 7];
  };

  var plot = new Plottable.Plots.Bar().addDataset(new Plottable.Dataset(data));
  plot.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var basicTable = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);
  var formatChoices = new Plottable.Components.Table([[IdTitle], [DowTitle], [EmpIDTitle]]);
  var bigTable = new Plottable.Components.Table([[basicTable], [formatChoices]]);
  formatChoices.xAlignment("center");

  bigTable.renderTo(container);

  function useIdentityFormatter() {
    xAxis.formatter(Plottable.Formatters.identity());
  }
  function useDOWFormatter() {
     xAxis.formatter(DOWFormatter);
  }
  function useEmpIdFormatter() {
     xAxis.formatter(EmpIDFormatter);
  }

  new Plottable.Interactions.Click().onClick(useIdentityFormatter).attachTo(IdTitle);
  new Plottable.Interactions.Click().onClick(useDOWFormatter).attachTo(DowTitle);
  new Plottable.Interactions.Click().onClick(useEmpIdFormatter).attachTo(EmpIDTitle);

}
