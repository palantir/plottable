function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

    var large_x = function(d){
         d.x = d.x*100000000;
    };


  var big_numbers = [];
  deep_copy(data[0], big_numbers);
  big_numbers.forEach(large_x);
  var dataseries1 = new Plottable.Dataset(big_numbers);


  //Axis
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var IdTitle = new Plottable.Components.Label("Identity");
  var GenTitle = new Plottable.Components.Label("General");
  var FixTitle = new Plottable.Components.Label("Fixed");
  var CurrTitle = new Plottable.Components.Label("Currency");
  var PerTitle = new Plottable.Components.Label("Percentage");
  var SITitle = new Plottable.Components.Label("SI");
  var CustTitle = new Plottable.Components.Label("Custom");

  var custFormatter = function(d) { return "= ' w ' ="; };

var plot;
try {
  plot = new Plottable.Plots.Line().addDataset(dataseries1);
} catch(err) {
  plot = new Plottable.Plots.Line(xScale, yScale).addDataset(dataseries1);
}

  plot.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var basicTable = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);
  var formatChoices = new Plottable.Components.Table([[IdTitle, GenTitle, FixTitle],[CurrTitle, null, PerTitle], [SITitle, null, CustTitle]]);
  var bigTable = new Plottable.Components.Table([[basicTable],[formatChoices]]);
  formatChoices.xAlignment("center");

  bigTable.renderTo(svg);


  function identity_frmt() {
    xAxis.formatter(Plottable.Formatters.identity());
    yAxis.formatter(Plottable.Formatters.identity());
  }
  function general_frmt() {
    xAxis.formatter(Plottable.Formatters.general(2));
    yAxis.formatter(Plottable.Formatters.general(2));
  }
  function fixed_frmt() {
    xAxis.formatter(Plottable.Formatters.fixed(2));
    yAxis.formatter(Plottable.Formatters.fixed(2));
  }
  function currency_frmt() {
    xAxis.formatter(Plottable.Formatters.currency(2, '$', true));
    yAxis.formatter(Plottable.Formatters.currency(2, '$', true));
  }
  function percentage_frmt() {
    xAxis.formatter(Plottable.Formatters.percentage(2));
    yAxis.formatter(Plottable.Formatters.percentage(2));
  }
  function SI_frmt() {
     xAxis.formatter(Plottable.Formatters.siSuffix(2));
     yAxis.formatter(Plottable.Formatters.siSuffix(2));
  }
  function custom_frmt() {
     xAxis.formatter(custFormatter);
     yAxis.formatter(custFormatter);
  }

  new Plottable.Interactions.Click().onClick(identity_frmt).attachTo(IdTitle);
  new Plottable.Interactions.Click().onClick(general_frmt).attachTo(GenTitle);
  new Plottable.Interactions.Click().onClick(fixed_frmt).attachTo(FixTitle);
  new Plottable.Interactions.Click().onClick(currency_frmt).attachTo(CurrTitle);
  new Plottable.Interactions.Click().onClick(percentage_frmt).attachTo(PerTitle);
  new Plottable.Interactions.Click().onClick(SI_frmt).attachTo(SITitle);
  new Plottable.Interactions.Click().onClick(custom_frmt).attachTo(CustTitle);

}
