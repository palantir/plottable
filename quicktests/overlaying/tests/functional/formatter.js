function makeData() {
  "use strict";

  return [makeRandomData(10), makeRandomData(10)];
}

function run(div, data, Plottable) {
  "use strict";

    var largeX = function(d, i){
         d.x = Math.pow(10, i);
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
  var SSTitle = new Plottable.Components.Label("Short Scale");

  var plot = new Plottable.Plots.Line().addDataset(dataseries1);
  plot.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var basicTable = new Plottable.Components.Table([[yAxis, plot], [null, xAxis]]);
  var formatChoices = new Plottable.Components.Table([[IdTitle, GenTitle, FixTitle], [CurrTitle, null, PerTitle], [SITitle, null, SSTitle]]);
  var bigTable = new Plottable.Components.Table([[basicTable], [formatChoices]]);
  formatChoices.xAlignment("center");

  bigTable.renderTo(div);

  function useIdentityFormatter() {
    xAxis.formatter(Plottable.Formatters.identity(2.1));
    yAxis.formatter(Plottable.Formatters.identity());
  }
  function useGeneralFormatter() {
    xAxis.formatter(Plottable.Formatters.general(7));
    yAxis.formatter(Plottable.Formatters.general(3));
  }
  function useFixedFormatter() {
    xAxis.formatter(Plottable.Formatters.fixed(2.00));
    yAxis.formatter(Plottable.Formatters.fixed(7.00));
  }
  function useCurrencyFormatter() {
    xAxis.formatter(Plottable.Formatters.currency(3, "$", true));
    yAxis.formatter(Plottable.Formatters.currency(3, "$", true));
  }
  function usePercentageFormatter() {
    xAxis.formatter(Plottable.Formatters.percentage(12.3 - 11.3));
    yAxis.formatter(Plottable.Formatters.percentage(2.5 + 1.5));
  }
  function useSIFormatter() {
     xAxis.formatter(Plottable.Formatters.siSuffix(7));
     yAxis.formatter(Plottable.Formatters.siSuffix(14));
  }
  function useSSFormatter() {
     xAxis.formatter(Plottable.Formatters.shortScale(0));
     yAxis.formatter(Plottable.Formatters.shortScale(0));
  }

  new Plottable.Interactions.Click().onClick(useIdentityFormatter).attachTo(IdTitle);
  new Plottable.Interactions.Click().onClick(useGeneralFormatter).attachTo(GenTitle);
  new Plottable.Interactions.Click().onClick(useFixedFormatter).attachTo(FixTitle);
  new Plottable.Interactions.Click().onClick(useCurrencyFormatter).attachTo(CurrTitle);
  new Plottable.Interactions.Click().onClick(usePercentageFormatter).attachTo(PerTitle);
  new Plottable.Interactions.Click().onClick(useSIFormatter).attachTo(SITitle);
  new Plottable.Interactions.Click().onClick(useSSFormatter).attachTo(SSTitle);

}
