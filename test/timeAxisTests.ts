///<reference path="testReference.ts" />

var assert = chai.assert;

describe("TimeAxis", () => {
  it("draws tick labels correctly (horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Time();
    scale.range([0, SVG_WIDTH]);
    var timeAxis = new Plottable.Axis.Time(scale, "bottom");
    timeAxis.renderTo(svg);

    var tickLabels = timeAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = timeAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    var i: number;
    var markBB: ClientRect;
    var labelBB: ClientRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      var markCenter = (markBB.left + markBB.right) / 2;
      labelBB = tickLabels[0][i].getBoundingClientRect();
      var labelCenter = (labelBB.left + labelBB.right) / 2;
      assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
    }
    svg.remove();
  });

  it("tick labels don't overlap in a constrained space", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Time();
    scale.range([0, SVG_WIDTH]);
    var timeAxis = new Plottable.Axis.Time(scale, "bottom");
    timeAxis.renderTo(svg);

    function boxesOverlap(boxA: ClientRect, boxB: ClientRect) {
      if (boxA.right < boxB.left) { return false; }
      if (boxA.left > boxB.right) { return false; }
      if (boxA.bottom < boxB.top) { return false; }
      if (boxA.top > boxB.bottom) { return false; }
      return true;
    }
    var visibleTickLabels = timeAxis.element
                              .selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS)
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

        assert.isFalse(boxesOverlap(box1, box2), "tick labels don't overlap");
      }
    }

    timeAxis.orient("bottom");
    visibleTickLabels = timeAxis.element
                          .selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    numLabels = visibleTickLabels[0].length;
    for (i = 0; i < numLabels; i++) {
      for (j = i + 1; j < numLabels; j++) {
        box1 = visibleTickLabels[0][i].getBoundingClientRect();
        box2 = visibleTickLabels[0][j].getBoundingClientRect();

        assert.isFalse(boxesOverlap(box1, box2), "tick labels don't overlap");
      }
    }

    svg.remove();
  });
});
