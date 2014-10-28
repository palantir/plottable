///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeAxis", () => {
    it("can not initialize vertical time axis", () => {
        var scale = new Plottable.Scale.Time();
        assert.throws(() => new Plottable.Axis.Time(scale, "left"), "unsupported");
        assert.throws(() => new Plottable.Axis.Time(scale, "right"), "unsupported");
    });

    it("major and minor intervals arrays are the same length", () => {
        assert.equal(Plottable.Axis.Time._majorIntervals.length, Plottable.Axis.Time._minorIntervals.length,
                "major and minor interval arrays must be same size");
    });

    it("Computing the default ticks doesn't error out for edge cases", () => {
      var svg = generateSVG(400, 100);
      var scale = new Plottable.Scale.Time();
      var axis = new Plottable.Axis.Time(scale, "bottom");
      scale.range([0, 400]);

      // very large time span
      assert.doesNotThrow(() => scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(50000, 0, 1, 0, 0, 0, 0)]));
      axis.renderTo(svg);

      // very small time span
      assert.doesNotThrow(() => scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(0, 0, 1, 0, 0, 0, 100)]));
      axis.renderTo(svg);

      svg.remove();
  });

  it("Tick labels don't overlap", () => {
    var svg = generateSVG(400, 100);
    var scale = new Plottable.Scale.Time();
    scale.range([0, 400]);
    var axis = new Plottable.Axis.Time(scale, "bottom");

    function checkDomain(domain: any[]) {
      scale.domain(domain);
      axis.renderTo(svg);

      function checkLabelsForContainer(container: D3.Selection) {
        var visibleTickLabels = container
                .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
                .filter(function(d: any, i: number) {
                  return d3.select(this).style("visibility") === "visible";
                });
        var numLabels = visibleTickLabels[0].length;
        var box1: ClientRect;
        var box2: ClientRect;
        for (var i = 0; i < numLabels; i++) {
          for (var j = i + 1; j < numLabels; j++) {
            box1 = visibleTickLabels[0][i].getBoundingClientRect();
            box2 = visibleTickLabels[0][j].getBoundingClientRect();

            assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
          }
        }
      }

      checkLabelsForContainer(axis._minorTickLabels);
      checkLabelsForContainer(axis._majorTickLabels);
    }
    // 100 year span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
    // 1 year span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
    // 1 month span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
    // 1 day span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
    // 1 hour span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
    // 1 minute span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
    // 1 second span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 0, 1, 0)]);

      svg.remove();
  });
});
