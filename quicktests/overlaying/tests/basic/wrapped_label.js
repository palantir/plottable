function makeData() {
    "use strict";

    return [
        { y: "none", x: 550 },
        { y: "government", x: 500 },
        { y: "contractor", x: 330 },
        { y: "developer (inhouse)", x: 300 },
        { y: "developer (outsourced)", x: 270 },
        { y: "corporation", x: 210 },
        { y: "unknown", x: 115 },
        { y: "retired", x: 55 },
        { y: "x", x: 25 },
        { y: "y", x: 15 },
        { y: "z", x: 10 },
    ];
  }

  function run(div, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Category();

    var dataset = new Plottable.Dataset(data);
    var horizontalBarPlot = new Plottable.Plots.Bar("horizontal")
                                .addDataset(dataset)
                                .x(function(d) { return d.x; }, xScale)
                                .y(function(d) { return d.y; }, yScale)
                                .labelsEnabled(true)
                                .attr("opacity", 0.8);

    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Category(yScale, "left");

    var longString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non pretium diam. Sed dolor turpis, maximus sit amet bibendum vel, elementum eu urna. Nam nunc ligula, placerat non consequat nec, mollis eu velit. Morbi odio sapien, posuere ut hendrerit at, hendrerit vitae nulla. Donec fringilla, felis sed vehicula viverra, dui lectus commodo dolor, non viverra nisl tellus vitae orci. Donec pharetra mauris enim, a porttitor augue bibendum vitae. Maecenas magna risus, tempus eu dapibus a, eleifend ac orci. Nam iaculis scelerisque velit non congue. Nullam sodales augue vel erat mattis, at volutpat eros tristique. Nam varius mattis lectus, ut eleifend velit ullamcorper eget.";
    // var label = new Plottable.Components.Label(longString);
    var botLabel = new Plottable.Components.WrappedLabel(longString).maxLines(4);
    var leftLabel = new Plottable.Components.WrappedLabel(longString).angle(-90).maxLines(2);
    var rightLabel = new Plottable.Components.WrappedLabel(longString).angle(90).maxLines(2);

    var chart = new Plottable.Components.Table([
      [leftLabel, yAxis, horizontalBarPlot, rightLabel],
      [null, null, xAxis],
      [null, null, botLabel],
    ]);

    chart.renderTo(div);
  }
