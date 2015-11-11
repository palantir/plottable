///<reference path="../testReference.ts" />

describe("InterpolatedColorLegend", () => {
  let svg: d3.Selection<void>;
  let colorScale: Plottable.Scales.InterpolatedColor;
  let SVG_HEIGHT = 400;
  let SVG_WIDTH = 400;
  beforeEach(() => {
    svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    colorScale = new Plottable.Scales.InterpolatedColor();
  });

  function assertBasicRendering(legend: Plottable.Components.InterpolatedColorLegend) {
    let scaleDomain = colorScale.domain();
    let legendElement: d3.Selection<void> = (<any> legend)._element;

    let swatches = legendElement.selectAll(".swatch");
    assert.strictEqual(d3.select(swatches[0][0]).attr("fill"),
                       colorScale.scale(scaleDomain[0]),
                       "first swatch's color corresponds with first domain value");
    assert.strictEqual(d3.select(swatches[0][swatches[0].length - 1]).attr("fill"),
                       colorScale.scale(scaleDomain[1]),
                       "last swatch's color corresponds with second domain value");
    let defaultNumSwatches = (<any> Plottable.Components.InterpolatedColorLegend)._DEFAULT_NUM_SWATCHES;
    assert.operator(swatches.size(), ">=", defaultNumSwatches, "there are at least 11 swatches");

    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();
    let swatchBoundingBox = legendElement.select(".swatch-bounding-box");
    let boundingBoxBCR = (<Element> swatchBoundingBox.node()).getBoundingClientRect();
    assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, boundingBoxBCR),
                  "bounding box contains all swatches");

    let elementBCR = (<Element> legendElement.node()).getBoundingClientRect();
    assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, elementBCR),
                  "swatches are drawn within the legend's element");

    let formattedDomainValues = scaleDomain.map((<any> legend)._formatter);
    let labels = legendElement.selectAll("text");
    let labelTexts = labels[0].map((textNode: HTMLScriptElement) => textNode.textContent);
    assert.deepEqual(labelTexts, formattedDomainValues, "formatter is used to format label text");
  }

  it("renders correctly when horizontal", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    assertBasicRendering(legend);

    let legendElement: d3.Selection<void> = (<any> legend)._element;
    let labels = legendElement.selectAll("text");
    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

    let lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
    let upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
    assert.operator(lowerLabelBCR.right, "<=", swatchContainerBCR.left, "first label to left of swatches");
    assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");

    svg.remove();
  });

  it("renders correctly when oriented right", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("right");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    let legendElement: d3.Selection<void> = (<any> legend)._element;
    let labels = legendElement.selectAll("text");
    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

    let lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
    let upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
    assert.operator(swatchContainerBCR.right, "<=", lowerLabelBCR.left, "first label to right of swatches");
    assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");
    assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

    svg.remove();
  });

  it("renders correctly when oriented left", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    let legendElement: d3.Selection<void> = (<any> legend)._element;
    let labels = legendElement.selectAll("text");
    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

    let lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
    let upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
    assert.operator(lowerLabelBCR.left, "<=", swatchContainerBCR.left, "first label to left of swatches");
    assert.operator(upperLabelBCR.left, "<=", swatchContainerBCR.left, "second label to left of swatches");
    assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

    svg.remove();
  });

  it("does not crash when font-size is 0px", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    let style = legend.content().append("style");
    style.attr("type", "text/css");
    style.text(".plottable .interpolated-color-legend text { font-size: 0px; }" +
               ".plottable .interpolated-color-legend { display: none; }");
    let textHeight = (<any> legend)._measurer.measure().height;

    assert.doesNotThrow(() => legend.expands(true), Error, "it does not throw error when text height is 0");
    assert.strictEqual(textHeight, 0, "text height is set to 0");
    style.remove();
    svg.remove();
  });

  it("re-renders when scale domain updates", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("horizontal");
    legend.renderTo(svg);

    colorScale.domain([0, 85]);
    assertBasicRendering(legend);

    svg.remove();
  });

  it("returns same formatter if setting null formatter", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(new Plottable.Scales.InterpolatedColor());
    let formatter = Plottable.Formatters.percentage(2);
    legend.formatter(formatter);
    legend.renderTo(svg);

    let returnedFormatter = legend.formatter(null);
    assert.strictEqual(formatter, returnedFormatter, "passing null to formatter() should not change formatter");

    svg.remove();
  });

  it("orientation() input-checking", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);

    legend.orientation("horizontal"); // should work
    legend.orientation("right"); // should work
    legend.orientation("left"); // should work

    assert.throws(() => legend.orientation("blargh"), "not a valid orientation");
    svg.remove();
  });

  it("orient() triggers layout computation", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    let widthBefore = legend.width();
    let heightBefore = legend.height();

    legend.orientation("right");
    assert.notEqual(legend.width(), widthBefore, "proportions changed (width)");
    assert.notEqual(legend.height(), heightBefore, "proportions changed (height)");
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: horizontal)", () => {
    svg.attr("width", 100);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("horizontal");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: horizontal)", () => {
    let constrainedHeight = 35;
    svg.attr("height", constrainedHeight);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("horizontal");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when width is constrained when oriented right", () => {
    let constrainedWidth = 45;
    svg.attr("width", constrainedWidth);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("right");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained when oriented right", () => {
    svg.attr("height", 100);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("right");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when width is constrained when oriented left", () => {
    let constrainedWidth = 45;
    svg.attr("width", constrainedWidth);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained when oriented left", () => {
    svg.attr("height", 100);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("fixed height if expand is set to false or orientation is horizontal", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    assert.isTrue(legend.fixedHeight(), "height is fixed on default");

    legend.expands(true);
    assert.isTrue(legend.fixedHeight(), "height is fixed oriented horizontally");

    legend.orientation("left");
    assert.isFalse(legend.fixedHeight(), "height is not fixed oriented vertically");

    legend.orientation("right");
    assert.isFalse(legend.fixedHeight(), "height is not fixed oriented vertically");

    legend.expands(false);
    assert.isTrue(legend.fixedHeight(), "height is fixed when expand is set to false");

    svg.remove();
  });

  it("fixed width if expand is set to false or orientation is vertically", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    assert.isTrue(legend.fixedWidth(), "width is fixed on default");

    legend.expands(true);
    assert.isFalse(legend.fixedWidth(), "width is not fixed oriented horizontally");

    legend.orientation("left");
    assert.isTrue(legend.fixedWidth(), "width is fixed oriented vertically");

    legend.orientation("right");
    assert.isTrue(legend.fixedWidth(), "width is fixed oriented vertically");

    legend.expands(false);
    legend.orientation("horizontal");
    assert.isTrue(legend.fixedWidth(), "width is fixed when expand is set to false");

    svg.remove();
  });

  it("spams the entire height if oriented vertically and expand is set to true", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.expands(true);
    legend.renderTo(svg);
    assert.strictEqual(legend.height(), SVG_HEIGHT, "legend height is the same as svg height");
    svg.remove();
  });

  it("spams the entire width if oriented horizontally and expand is set to true", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.expands(true);
    legend.renderTo(svg);
    assert.strictEqual(legend.width(), SVG_WIDTH, "legend width is the same as svg width");
    svg.remove();
  });

  it("has more swatches than default when expand is true", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    let orientations = ["horizontal", "left", "right"];
    orientations.forEach((orientation) => {
      legend.orientation(orientation).expands(false);
      let numSwatches = legend.content().selectAll(".swatch").size();
      legend.expands(true);
      let newNumSwatches = legend.content().selectAll(".swatch").size();
      assert.operator(newNumSwatches, ">", numSwatches, `there are more swatches when expanded (orientation: ${orientation})`);
    });
    svg.remove();
  });

  it("has the same number of swatches as its height when vertical", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    legend.orientation("left").expands(false);
    let numSwatches = legend.content().selectAll(".swatch").size();
    let swatchContainer = legend.content().select(".swatch-container");
    let swatchContainerHeight = (<Element> swatchContainer.node()).getBoundingClientRect().height;
    legend.expands(true);
    let newNumSwatches = legend.content().selectAll(".swatch").size();
    let swatchContainerExpandedHeight = (<Element> swatchContainer.node()).getBoundingClientRect().height;
    assert.closeTo(numSwatches, swatchContainerHeight, 1, "non-expanded left legend has one swatch per pixel");
    assert.closeTo(newNumSwatches, swatchContainerExpandedHeight, 1, "expanded left legend has one swatch per pixel");
    svg.remove();
  });

  it("has the same number of swatches as its width when horizontal", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    legend.orientation("horizontal").expands(false);
    let numSwatches = legend.content().selectAll(".swatch").size();
    let swatchContainer = legend.content().select(".swatch-container");
    let swatchContainerWidth = (<Element> swatchContainer.node()).getBoundingClientRect().width;
    legend.expands(true);
    let newNumSwatches = legend.content().selectAll(".swatch").size();
    let swatchContainerExpandedWidth = (<Element> swatchContainer.node()).getBoundingClientRect().width;
    assert.closeTo(numSwatches, swatchContainerWidth, 1, "non-expanded left legend has one swatch per pixel");
    assert.closeTo(newNumSwatches, swatchContainerExpandedWidth, 1, "expanded left legend has one swatch per pixel");
    svg.remove();
  });

  it("does not have padding on ends of vertical legends", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    let orientations = ["left", "right"];
    orientations.forEach((orientation) => {
      legend.orientation(orientation).expands(true);
      let height = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect().height;
      assert.closeTo(height, SVG_HEIGHT, window.Pixel_CloseTo_Requirement, "actual height is SVG_HEIGHT with orientation: " + orientation);
    });
    svg.remove();
  });

  it("pads left-oriented legends correctly", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("left");
    legend.renderTo(svg);
    let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
    let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
    let swatchWidth = swatchBoundingRect.width;
    let swatchEdge = swatchBoundingRect.right;
    let legendEdge = legendBoundingRect.right;
    let padding = legendEdge - swatchEdge;
    assert.closeTo(swatchWidth, padding, window.Pixel_CloseTo_Requirement,
      "padding is approximately equal to swatch width");
    legend.expands(true);
    swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
    legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
    swatchWidth = swatchBoundingRect.width;
    swatchEdge = swatchBoundingRect.right;
    legendEdge = legendBoundingRect.right;
    padding = legendEdge - swatchEdge;
    assert.closeTo(swatchWidth, padding, window.Pixel_CloseTo_Requirement,
      "padding is approximately equal to swatch width when expanded");
    svg.remove();
  });

  it("pads right-oriented legends correctly", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("right");
    legend.renderTo(svg);
    let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
    let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
    let swatchWidth = swatchBoundingRect.width;
    let swatchEdge = swatchBoundingRect.left;
    let legendEdge = legendBoundingRect.left;
    let padding = swatchEdge - legendEdge;
    // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
    assert.closeTo(swatchWidth, padding, 2,
      "padding is approximately equal to swatch width");
    legend.expands(true);
    swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
    legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
    swatchWidth = swatchBoundingRect.width;
    swatchEdge = swatchBoundingRect.left;
    legendEdge = legendBoundingRect.left;
    padding = swatchEdge - legendEdge;
    // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
    assert.closeTo(swatchWidth, padding, 2,
      "padding is approximately equal to swatch width when expanded");
    svg.remove();
  });

  it("pads horizontal legends correctly", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("horizontal");
    legend.renderTo(svg);
    let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
    let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
    let swatchHeight = swatchBoundingRect.height;
    let swatchEdge = swatchBoundingRect.bottom;
    let legendEdge = legendBoundingRect.bottom;
    let padding = legendEdge - swatchEdge;
    assert.closeTo(swatchHeight, padding, window.Pixel_CloseTo_Requirement,
      "padding is approximately equal to swatch height");
    legend.expands(true);
    swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
    legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
    swatchHeight = swatchBoundingRect.height;
    swatchEdge = swatchBoundingRect.bottom;
    legendEdge = legendBoundingRect.bottom;
    padding = legendEdge - swatchEdge;
    assert.closeTo(swatchHeight, padding, window.Pixel_CloseTo_Requirement,
      "padding is approximately equal to swatch height when expanded");
    svg.remove();
  });

  describe("Constrained situations", () => {
    it("horizontal legends degrade padding when height is constrained", () => {
      let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("horizontal");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let unconstrainedSwatchHeight = swatchBoundingRect.height;
      let textHeight = unconstrainedSwatchHeight;
      let constrainedHeight = textHeight;
      svg.attr("height", constrainedHeight);
      legend.redraw();
      let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let topPadding = swatchBoundingRect.top - legendBoundingRect.top;
      let bottomPadding = legendBoundingRect.bottom - swatchBoundingRect.bottom;
      assert.operator(topPadding, "<", textHeight, "top padding degrades to be smaller than textHeight");
      assert.operator(bottomPadding, "<", textHeight, "bottom padding degrades to be smaller than textHeight");
      svg.remove();
    });

    it("left legends degrade padding when width is constrained", () => {
      let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("left");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let unconstrainedSwatchWidth = swatchBoundingRect.width;
      let textHeight = unconstrainedSwatchWidth;
      let constrainedWidth = textHeight * 2;
      svg.attr("width", constrainedWidth);
      legend.redraw();
      let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let leftPadding = legendBoundingRect.right - swatchBoundingRect.right;
      assert.operator(leftPadding, "<", textHeight, "right-side padding degrades to be smaller than textHeight");
      svg.remove();
    });

    it("right legends degrade padding when width is constrained", () => {
      let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("right");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let unconstrainedSwatchWidth = swatchBoundingRect.width;
      let textHeight = unconstrainedSwatchWidth;
      let constrainedWidth = textHeight * 2;
      svg.attr("width", constrainedWidth);
      legend.redraw();
      let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let leftPadding = swatchBoundingRect.left - legendBoundingRect.left;
      assert.operator(leftPadding, "<", textHeight, "left-side padding degrades to be smaller than textHeight");
      svg.remove();
    });
    it("degrades gracefully when width is very constrained", () => {
      let legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation("horizontal");
      legend.renderTo(svg);
      let constrainedWidth = 30;
      svg.attr("width", constrainedWidth);
      assert.doesNotThrow(() => legend.redraw(), Error, "rendering in a small space should not error");
      let numSwatches = legend.content().selectAll(".swatch").size();
      assert.strictEqual(0, numSwatches, "no swatches are drawn");
      svg.remove();
    });

  });

  describe("title", () => {
    it("adds formatted title element to each swatch", () => {
      let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
      let formatter = Plottable.Formatters.percentage(2);
      legend.formatter(formatter);
      legend.renderTo(svg);

      let entries = legend.content().selectAll("rect.swatch");
      assert.operator(entries.size(), ">=", 11, "there is at least 11 swatches");
      entries.each(function(d, i) {
        let swatch = d3.select(this);
        assert.strictEqual(swatch.select("title").text(), formatter(d));
      });
      svg.remove();
    });

    it("does not create title elements if configuration is set to false", () => {
      let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
      Plottable.Configs.ADD_TITLE_ELEMENTS = false;
      legend.renderTo(svg);

      let entries = legend.content().selectAll("rect.swatch");
      assert.operator(entries.size(), ">=", 11, "there is at least 11 swatches");
      let titles = entries.selectAll("title");
      assert.strictEqual(titles.size(), 0, "no titles should be rendered");
      svg.remove();
    });
  });
});
