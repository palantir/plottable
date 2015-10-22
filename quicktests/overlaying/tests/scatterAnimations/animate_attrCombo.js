
function makeData() {
    "use strict";
}

function run(svg, data, Plottable, keyFunction) {
    "use strict";
    var dataIndex = 0;
    var colorFcn = function (d) {
        if (d.name === "France") { return "blue"; }
        if (d.name === "Germany") { return "red"; }
        if (d.name === "Uruguay") { return "green"; }
        return "gray";
    };

    d3.json("/quicktests/overlaying/data/worldcup.json", function (json) {
      var xScale = new Plottable.Scales.Linear().domain([0, 20]);
      var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

      var yScale = new Plottable.Scales.Linear().domain([0, 20]);
      var yAxis = new Plottable.Axes.Numeric(yScale, "left");

      data = json;
      var ds = new Plottable.Dataset(data.wc2014);
      if (ds.keyFunction) {
        ds.keyFunction(keyFunction);
      }
      var attrAnimator = new Plottable.Animators.Attr();
      var transformfn = function() {
        var transform = d3.transform(this.attributes.transform.value);
        transform.translate[1] = yScale.scale(0);
        return transform.toString();
      };
      //var proj = { height: function () { return 0; } };
      // make a size 0 circle that can get animated
      var proj = {
        transform: transformfn,
        d: Plottable.SymbolFactories.circle()(0)
      };
      var endproj = {
        d: Plottable.SymbolFactories.circle()(0),
        opacity: .3,
        fill: "#DDD"
      };
      attrAnimator
        .stepDuration(3000)
        .stepDelay(0)
        .startAttrs(proj)
        .endAttrs(endproj);

      var circleRenderer = new Plottable.Plots.Scatter().addDataset(ds)
        .animator(Plottable.Plots.Animator.MAIN, attrAnimator)
        .size(16)
        .x(function(d) { return d.GA; }, xScale)
        .y(function(d) { return d.GF; }, yScale)
        .attr("opacity", .9)
        .animated(true)
        .attr("fill", colorFcn);

      var circleChart = new Plottable.Components.Table([
        [yAxis, circleRenderer],
        [null, xAxis]
      ]);
      circleChart.renderTo(svg);

      var cb = function() {
        switch (dataIndex) {
        case 0:
          ds.data(data.wc2006);
          dataIndex = 1;
          break;
        case 1:
          ds.data(data.wc2010);
          dataIndex = 2;
          break;
        case 2:
          ds.data(data.wc2014);
          dataIndex = 0;
          break;
        }
      };

      new Plottable.Interactions.Click().onClick(cb).attachTo(circleRenderer);
    });
}
//# sourceURL=scatterAnimations/animate_attrCombo.js
