function makeData() {
  "use strict";

}

function run(div, data, Plottable) {
  "use strict";

  function processDatum(d) {
    d.Date = new Date(d.Date);
    d["Adj Close"] = parseFloat(d["Adj Close"]);
  }

  // load GOOG
  d3.csv("/quicktests/data/GOOG_20140401_20140901.csv")
    .get(function(error, rows) {
      var goog = rows.reverse();
      goog.forEach(processDatum);

      // load AAPL
      d3.csv("/quicktests/data/AAPL_20140401_20140901.csv")
        .get(function(error, rows) {
          var aapl = rows.reverse();
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
          for (var i=1; i<aapl.length; i++) {
            var totalVal = getValue(i);
            diffData.push({
              "Date": aapl[i].Date,
              "net change": totalVal - diffData[i-1]["total value"],
              "total value": totalVal
            });
          }

          var xScale = new Plottable.Scale.Time();
          var xAxis = new Plottable.Axis.Time(xScale, "bottom");
          var xAxisTop = new Plottable.Axis.Time(xScale, "top");

          var yScale_aapl = new Plottable.Scale.Linear();
          var yAxis_aapl = new Plottable.Axis.Numeric(yScale_aapl, "right").showEndTickLabels(true);
          var label_aapl = new Plottable.Component.AxisLabel("AAPL", "right");

          var yScale_goog = new Plottable.Scale.Linear();
          var yAxis_goog = new Plottable.Axis.Numeric(yScale_goog, "left").xAlign("right").showEndTickLabels(true);
          var label_goog = new Plottable.Component.AxisLabel("GOOG", "left");

          var colorScale = new Plottable.Scale.Color();

          var aaplSource = new Plottable.Dataset(aapl, {name: "AAPL"} );
          var googSource = new Plottable.Dataset(goog, {name: "GOOG"} );

          var line_aapl = new Plottable.Plot.Line(xScale, yScale_aapl).animate(true)
                                  .addDataset("aapl", aaplSource)
                                  .project("x", "Date", xScale)
                                  .project("y", "Adj Close", yScale_aapl)
                                  .project("stroke", function(d, i, m) { return m.name; }, colorScale)
                                  .automaticallyAdjustYScaleOverVisiblePoints(true);
          var line_goog = new Plottable.Plot.Line(xScale, yScale_goog).animate(true)
                                  .addDataset("goog", googSource)
                                  .project("x", "Date", xScale)
                                  .project("y", "Adj Close", yScale_goog)
                                  .project("stroke", function(d, i, m) { return m.name; }, colorScale)
                                  .automaticallyAdjustYScaleOverVisiblePoints(true);

          // should be one line plot, pending #917

          var legend = new Plottable.Component.Legend(colorScale);
          legend.maxEntriesPerRow(1);
          legend.yAlign("top").xOffset(-5);
          var plotArea = new Plottable.Component.Group([line_aapl, line_goog, legend]);

          var yScale_diff = new Plottable.Scale.Linear();
          var yAxis_diff = new Plottable.Axis.Numeric(yScale_diff, "left");

          var DAY_MILLIS = 24 * 60 * 60 * 1000;
          var bar_diff = new Plottable.Plot.Bar(xScale, yScale_diff).animate(true)
                                  .addDataset(diffData)
                                  .project("x", "Date", xScale)
                                  .project("y", "net change", yScale_diff)
                                  .project("width", function() { return xScale.scale(DAY_MILLIS) - xScale.scale(0); })
                                  .project("fill", function(d) {
                                    return d["net change"] > 0 ? Plottable.Core.Colors.FERN : Plottable.Core.Colors.CERISE_RED;
                                  });

          var table = new Plottable.Component.Table([
                            [null      , null      , xAxisTop, null      , null      ],
                            [label_goog, yAxis_goog, plotArea, yAxis_aapl, label_aapl],
                            [null      , null      , bar_diff, null      , null      ],
                            [null      , null      , xAxis   , null      , null      ]]);

          table.rowWeight(2, 0.3);

          var svg = div.append("svg").attr("height", 480);
          table.renderTo(svg);

          var pzi = new Plottable.Interaction.PanZoom(xScale, null);
          plotArea.registerInteraction(pzi);
          plotArea.registerInteraction(
            new Plottable.Interaction.Key()
                                     .on(65, function() {
                                       xScale.autoDomain();
                                       pzi.resetZoom();
                                     })
          );

        });
    });

}
