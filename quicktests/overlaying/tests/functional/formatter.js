function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

    var largeX = function(d){
         d.x = d.x * 100000000;
    };

  var bigNumbers = [];
  deepCopy(data[0], bigNumbers);
  bigNumbers.forEach(largeX);
  var dataseries1 = new Plottable.Dataset(bigNumbers);

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

  var custFormatter = function() { return "= ' w ' ="; };

  var plot = new Plottable.Plots.Line().addDataset(dataseries1);
  plot.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var basicTable = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);
  var formatChoices = new Plottable.Components.Table([[IdTitle, GenTitle, FixTitle],[CurrTitle, null, PerTitle], [SITitle, null, CustTitle]]);
  var bigTable = new Plottable.Components.Table([[basicTable],[formatChoices]]);
  formatChoices.xAlignment("center");

  bigTable.renderTo(svg);

  function useIdentityFormatter() {
    xAxis.formatter(Plottable.Formatters.identity());
    yAxis.formatter(Plottable.Formatters.identity());
  }
  function useGeneralFormatter() {
    xAxis.formatter(Plottable.Formatters.general(2));
    yAxis.formatter(Plottable.Formatters.general(2));
  }
  function useFixedFormatter() {
    xAxis.formatter(Plottable.Formatters.fixed(2));
    yAxis.formatter(Plottable.Formatters.fixed(2));
  }
  function useCurrencyFormatter() {
    xAxis.formatter(Plottable.Formatters.currency(2, "$", true));
    yAxis.formatter(Plottable.Formatters.currency(2, "$", true));
  }
  function usePercentageFormatter() {
    xAxis.formatter(Plottable.Formatters.percentage(2));
    yAxis.formatter(Plottable.Formatters.percentage(2));
  }
  function useSIFormatter() {
     xAxis.formatter(Plottable.Formatters.siSuffix(2));
     yAxis.formatter(Plottable.Formatters.siSuffix(2));
  }
  function useCustomFormatter() {
     xAxis.formatter(custFormatter);
     yAxis.formatter(custFormatter);
  }

  new Plottable.Interactions.Click().onClick(useIdentityFormatter).attachTo(IdTitle);
  new Plottable.Interactions.Click().onClick(useGeneralFormatter).attachTo(GenTitle);
  new Plottable.Interactions.Click().onClick(useFixedFormatter).attachTo(FixTitle);
  new Plottable.Interactions.Click().onClick(useCurrencyFormatter).attachTo(CurrTitle);
  new Plottable.Interactions.Click().onClick(usePercentageFormatter).attachTo(PerTitle);
  new Plottable.Interactions.Click().onClick(useSIFormatter).attachTo(SITitle);
  new Plottable.Interactions.Click().onClick(useCustomFormatter).attachTo(CustTitle);

}
