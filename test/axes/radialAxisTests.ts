///<reference path="../testReference.ts" />

describe("RadialAxis", () => {
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 500;
  let svg: d3.Selection<void>;
  let scale: Plottable.Scales.Linear;
  let radiusLimit: number;

  beforeEach(() => {
    svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    scale = new Plottable.Scales.Linear();
    radiusLimit = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2;
    scale.range([0, radiusLimit]);
  });

  it("has correct css class", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    assert.isTrue(axis.hasClass("r-axis"));
    assert.isFalse(axis.hasClass("x-axis"));
    assert.isFalse(axis.hasClass("y-axis"));

    svg.remove();
  });

  it("sets orientation correctly", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    assert.strictEqual(axis.orientation(), "left");
    axis = new Plottable.Axes.RadialAxis(scale, "right");
    assert.strictEqual(axis.orientation(), "right");
    (<any> assert).throws(() => axis = new Plottable.Axes.RadialAxis(scale, "top"), Error,
      "unsupported orientation", "top is not a supported orientation");
    (<any> assert).throws(() => axis = new Plottable.Axes.RadialAxis(scale, "bottom"), Error,
      "unsupported orientation",  "bottom is not a supported orientation");
    (<any> assert).throws(() => axis = new Plottable.Axes.RadialAxis(scale, "horizontal"), Error,
      "unsupported orientation",  "horizontal is not a supported orientation");
    (<any> assert).throws(() => axis = new Plottable.Axes.RadialAxis(scale, "vertical"), Error,
      "unsupported orientation",  "vertical is not a supported orientation");
    svg.remove();
  });

  it("has correct transform value", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);
    let transform = d3.transform(axis.content().attr("transform")).translate;
    assert.strictEqual(transform[0], SVG_WIDTH / 2, "origin is set to the middle of the svg");
    assert.strictEqual(transform[1], SVG_HEIGHT / 2, "origin is set to the middle of the svg");

    svg.remove();
  });

  it("renders correctly (orientation = left)", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);
    let ticks = scale.ticks();
    let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    let tickMarks = axis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks.size(), ticks.length, "there is one mark per tick");
    assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

    for (let i = 0; i < ticks.length; i++) {
      let markBB = (<Element> tickMarks[0][i]).getBoundingClientRect();
      let markCenter = (markBB.top + markBB.bottom) / 2;
      let labelBB = (<Element> tickLabels[0][i]).getBoundingClientRect();
      let labelCenter = (labelBB.top + labelBB.bottom) / 2;
      assert.closeTo(labelCenter, markCenter, 1, `tick label ${i} is centered on mark`);
    }

    svg.remove();
  });

  it("renders correctly (orientation = right)", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "right");
    axis.renderTo(svg);
    let ticks = scale.ticks();
    let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    let tickMarks = axis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks.size(), ticks.length, "there is one mark per tick");
    assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

    for (let i = 0; i < ticks.length; i++) {
      let markBB = (<Element> tickMarks[0][i]).getBoundingClientRect();
      let markCenter = (markBB.top + markBB.bottom) / 2;
      let labelBB = (<Element> tickLabels[0][i]).getBoundingClientRect();
      let labelCenter = (labelBB.top + labelBB.bottom) / 2;
      assert.closeTo(labelCenter, markCenter, 1, `tick label ${i} is centered on mark`);
    }

    svg.remove();
  });

  it("renders correctly with inversed domain", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);
    scale.domain([10, 0]);

    let ticks = scale.ticks();
    let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    let tickMarks = axis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks.size(), ticks.length, "there is one mark per tick");
    assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

    for (let i = 0; i < ticks.length; i++) {
      let markBB = (<Element> tickMarks[0][i]).getBoundingClientRect();
      let markCenter = (markBB.top + markBB.bottom) / 2;
      let labelBB = (<Element> tickLabels[0][i]).getBoundingClientRect();
      let labelCenter = (labelBB.top + labelBB.bottom) / 2;
      assert.closeTo(labelCenter, markCenter, 1, `tick label ${i} is centered on mark`);
    }

    svg.remove();
  });

  it("uses the supplied Formatter", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);

    let formatter = Plottable.Formatters.fixed(2);

    axis.formatter(formatter);

    let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickLabels.each(function(d: any, i: number) {
      let labelText = d3.select(this).text();
      let formattedValue = formatter(d);
      assert.strictEqual(labelText, formattedValue, `The supplied Formatter was used to format the tick label ${i}`);
    });

    svg.remove();
  });

  it("shows end labels if showEndTickLabels() is true", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);

    let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    let firstTickLabel = <Element> tickLabels[0][0];
    let lastTickLabel = <Element> tickLabels[0][tickLabels[0].length - 1];
    assert.isFalse(axis.showEndTickLabels(), "showEndTickLables() returns false by default");
    assert.strictEqual(d3.select(firstTickLabel).style("visibility"), "hidden", "the first label is hidden");
    assert.strictEqual(d3.select(lastTickLabel).style("visibility"), "hidden", "the last label is hidden");

    axis.showEndTickLabels(true);
    tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    firstTickLabel = <Element> tickLabels[0][0];
    lastTickLabel = <Element> tickLabels[0][tickLabels[0].length - 1];
    assert.isTrue(axis.showEndTickLabels(), "showEndTickLables() returns true");
    assert.include(["inherit", "visible"], d3.select(firstTickLabel).style("visibility"), "the first label is shown");
    assert.include(["inherit", "visible"], d3.select(lastTickLabel).style("visibility"), "the last label is shown");

    svg.remove();
  });

  it("spaces labels to avoid overlaps", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);

    [5, 10, 20, 30, 40, 50].forEach((numTicks) => {
      scale.tickGenerator((scale) => {
        let ticks: number[] = [];
        let diff = scale.domainMax() - scale.domainMin();
        for (let i = 0 ; i <= numTicks; i ++ ) {
          ticks.push( scale.domainMin() + diff / numTicks * i );
        }
        return ticks;
      });
      axis.render();

      let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
      assert.strictEqual(tickLabels.size(), numTicks + 1, "there is one label per tick");
      let visibleTickLabelRects: ClientRect[] = [];
      tickLabels.each(function() {
        let label = d3.select(this);
        let visibility = label.style("visibility");
        if ((visibility === "inherit") || (visibility === "visible")) {
          visibleTickLabelRects.push(this.getBoundingClientRect());
        }
      });

      for (let i = 0; i < visibleTickLabelRects.length - 1; i ++ ) {
        let currentLabelRect = visibleTickLabelRects[i];
        let nextLabelRect = visibleTickLabelRects[i + 1];
        assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(currentLabelRect, nextLabelRect),
          `${i}th visable label does not overlap with ${i + 1}th visable label when there are ${numTicks} ticks`);
      }
    });

    svg.remove();
  });

  it("truncates long labels", () => {
    let axis = new Plottable.Axes.RadialAxis(scale, "left");
    axis.renderTo(svg);

    let formatter = (s: any) => s + (s === 0.5 ? "long long long long long long long long long" : "long long");

    axis.formatter(formatter);

    let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickLabels.each(function() {
      let label = d3.select(this);
      let visibility = label.style("visibility");
      if ((visibility === "inherit") || (visibility === "visible")) {
        TestMethods.assertBBoxInclusion(axis.content(), label);
        TestMethods.assertBBoxInclusion(svg, label);
      }
    });
    svg.remove();
  });

});
