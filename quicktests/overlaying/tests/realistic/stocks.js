function makeData() {
  "use strict";

}

function run(container, data, Plottable) {
  "use strict";

  function processDatum(d) {
    d.Date = new Date(d.Date);
    d["Adj Close"] = parseFloat(d["Adj Close"]);
  }

  // load GOOG
  d3.csv("data/GOOG_20140401_20140901.csv")
    .get(function(error, rows) {
      var goog = rows.reverse();
      goog.forEach(processDatum);

      // load AAPL
      d3.csv("data/AAPL_20140401_20140901.csv")
        .get(function(aaplError, aaplRows) {
          var aapl = aaplRows.reverse();
          aapl.forEach(processDatum);

          // process and create chart
          var numGOOG = 3, numAAPL = 23;
          function getValue(i) { return numAAPL * aapl[i]["Adj Close"] + numGOOG * goog[i]["Adj Close"]; }

          // calculate gain/loss each day
          var diffData = [
            {
              "Date": aapl[0].Date,
              "net change": 0,
              "total value": getValue(0)
            }
          ];
          for (var i = 1; i < aapl.length; i++) {
            var totalVal = getValue(i);
            diffData.push({
              "Date": aapl[i].Date,
              "net change": totalVal - diffData[i - 1]["total value"],
              "total value": totalVal
            });
          }

          var extentFcnA = function() { return [new Date("2014-08-22"), new Date("2014-08-25")]; };

          var xScale = new Plottable.Scales.Time();
          xScale.addIncludedValuesProvider(extentFcnA);

          var xAxis = new Plottable.Axes.Time(xScale, "bottom");
          var xAxisTop = new Plottable.Axes.Time(xScale, "top");

          var yScaleAAPL = new Plottable.Scales.Linear();
          var yAxisAAPL = new Plottable.Axes.Numeric(yScaleAAPL, "right").showEndTickLabels(true);
          var labelAAPL = new Plottable.Components.AxisLabel("AAPL").angle(90);

          var yScaleGOOG = new Plottable.Scales.Linear();
          var yAxisGOOG = new Plottable.Axes.Numeric(yScaleGOOG, "left").xAlignment("right").showEndTickLabels(true);
          var labelGOOG = new Plottable.Components.AxisLabel("GOOG").angle(-90);

          var colorScale = new Plottable.Scales.Color();

          var aaplSource = new Plottable.Dataset(aapl, {name: "AAPL"} );
          var googSource = new Plottable.Dataset(goog, {name: "GOOG"} );

          var lineAAPL = new Plottable.Plots.Line().animated(true)
                                  .addDataset(aaplSource)
                                  .x(function(d) { return d.Date; }, xScale)
                                  .y(function(d) { return d["Adj Close"]; }, yScaleAAPL)
                                  .interpolator("cardinal")
                                  .attr("stroke", function(d, index, dataset) { return dataset.metadata().name; }, colorScale);
          lineAAPL.autorangeMode("y");
          var lineGOOG = new Plottable.Plots.Line().animated(true)
                                  .addDataset(googSource)
                                  .x(function(d) { return d.Date; }, xScale)
                                  .y(function(d) { return d["Adj Close"]; }, yScaleGOOG)
                                  .interpolator("cardinal")
                                  .attr("stroke", function(d, index, dataset) { return dataset.metadata().name; }, colorScale);
          lineGOOG.autorangeMode("y");

          // should be one line plot, pending #917

          var legend = new Plottable.Components.Legend(colorScale);
          legend.maxEntriesPerRow(1);
          legend.yAlignment("top");
          var plotArea = new Plottable.Components.Group([lineAAPL, lineGOOG, legend]);

          var yScaleDiff = new Plottable.Scales.Linear();

          var DAY_MILLIS = 24 * 60 * 60 * 1000;
          var barDiff = new Plottable.Plots.Bar("vertical").animated(true)
                                  .addDataset(new Plottable.Dataset(diffData))
                                  .x(function(d) { return d.Date; }, xScale)
                                  .y(function(d) { return d["net change"]; }, yScaleDiff)
                                  .attr("width", function() { return xScale.scale(DAY_MILLIS) - xScale.scale(0); })
                                  .attr("fill", function(d) {
                                    return d["net change"] > 0 ? colorScale.range()[2] : colorScale.range()[6];
                                  });

          var table = new Plottable.Components.Table([
                            [null,       null,       xAxisTop, null,       null],
                            [labelGOOG,  yAxisGOOG,   plotArea, yAxisAAPL,  labelAAPL],
                            [null,       null,       barDiff,  null,       null],
                            [null,       null,       xAxis,    null,       null]]);

          table.rowWeight(2, 0.3);

          table.renderTo(container);

          var pzi = new Plottable.Interactions.PanZoom(xScale, null);
          pzi.attachTo(plotArea);
          var keyInteraction = new Plottable.Interactions.Key();
          if (typeof keyInteraction.onKeyPress === "function") {
            keyInteraction.onKeyPress(65, function() {
                                       xScale.autoDomain();
                                     });
          } else {
            keyInteraction.onKey(65, function() {
                                       xScale.autoDomain();
                                     });
          }
          keyInteraction.attachTo(plotArea);

        });
    });

}
