///<reference path="../testReference.ts" />

describe("InterpolatedColorLegend", () => {
  const SWATCH_SELECTOR = ".swatch";
  const SWATCH_CONTAINER_SELECTOR = ".swatch-container";
  const SWATCH_BBOX_SELECTOR = ".swatch-bounding-box";
  const BACKGROUND_SELECTOR = ".background-fill";
  const ORIENTATIONS = ["horizontal", "left", "right"];

  describe("Basic Usage", () => {
    const SVG_HEIGHT = 400;
    const SVG_WIDTH = 400;

    let svg: d3.Selection<void>;
    let colorScale: Plottable.Scales.InterpolatedColor;
    let legend: Plottable.Components.InterpolatedColorLegend;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      colorScale = new Plottable.Scales.InterpolatedColor();
      legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    });

    function assertBasicRendering() {
      const scaleDomain = colorScale.domain();
      const legendContent = legend.content();

      const swatches = legendContent.selectAll(SWATCH_SELECTOR);
      assert.strictEqual(d3.select(swatches[0][0]).attr("fill"),
                        colorScale.scale(scaleDomain[0]),
                        "first swatch's color corresponds with first domain value");
      assert.strictEqual(d3.select(swatches[0][swatches[0].length - 1]).attr("fill"),
                        colorScale.scale(scaleDomain[1]),
                        "last swatch's color corresponds with second domain value");

      const defaultNumSwatches = (<any> Plottable.Components.InterpolatedColorLegend)._DEFAULT_NUM_SWATCHES;
      assert.operator(swatches.size(), ">=", defaultNumSwatches, "there are at least 11 swatches");

      const swatchContainer = legendContent.select(SWATCH_CONTAINER_SELECTOR);
      const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();
      const swatchBoundingBox = legendContent.select(SWATCH_BBOX_SELECTOR);
      const boundingBoxBCR = (<Element> swatchBoundingBox.node()).getBoundingClientRect();
      assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, boundingBoxBCR),
                    "bounding box contains all swatches");

      const elementBCR = (<Element> legendContent.node()).getBoundingClientRect();
      assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, elementBCR),
                    "swatches are drawn within the legend's element");

      const formattedDomainValues = scaleDomain.map(legend.formatter());
      const labels = legendContent.selectAll("text");
      const labelTexts = labels[0].map((textNode: HTMLScriptElement) => textNode.textContent);
      assert.deepEqual(labelTexts, formattedDomainValues, "formatter is used to format label text");
    }

    it("renders correctly when horizontal", () => {
      legend.renderTo(svg);

      assertBasicRendering();

      const legendContent = legend.content();
      const labels = legendContent.selectAll("text");
      const swatchContainer = legendContent.select(SWATCH_CONTAINER_SELECTOR);
      const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

      const lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
      const upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
      assert.operator(lowerLabelBCR.right, "<=", swatchContainerBCR.left, "first label to left of swatches");
      assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");

      svg.remove();
    });

    it("renders correctly when oriented right", () => {
      legend.orientation("right");
      legend.renderTo(svg);

      assertBasicRendering();

      const legendContent = legend.content();
      const labels = legendContent.selectAll("text");
      const swatchContainer = legendContent.select(SWATCH_CONTAINER_SELECTOR);
      const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

      const lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
      const upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
      assert.operator(swatchContainerBCR.right, "<=", lowerLabelBCR.left, "first label to right of swatches");
      assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");
      assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

      svg.remove();
    });

    it("renders correctly when oriented left", () => {
      legend.orientation("left");
      legend.renderTo(svg);

      assertBasicRendering();

      const legendContent = legend.content();
      const labels = legendContent.selectAll("text");
      const swatchContainer = legendContent.select(SWATCH_CONTAINER_SELECTOR);
      const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

      const lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
      const upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
      assert.operator(lowerLabelBCR.left, "<=", swatchContainerBCR.left, "first label to left of swatches");
      assert.operator(upperLabelBCR.left, "<=", swatchContainerBCR.left, "second label to left of swatches");
      assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

      svg.remove();
    });

    it("does not crash when font-size is 0px", () => {
      legend.renderTo(svg);
      const style = legend.content().append("style");
      style.attr("type", "text/css");
      style.text(".plottable .interpolated-color-legend text { font-size: 0px; }" +
                 ".plottable .interpolated-color-legend { display: none; }");
      const textHeight = (<any> legend)._measurer.measure().height;

      assert.doesNotThrow(() => legend.expands(true), Error, "it does not throw error when text height is 0");
      assert.strictEqual(textHeight, 0, "text height is set to 0");
      style.remove();
      svg.remove();
    });

    it("re-renders when scale domain updates", () => {
      legend.orientation("horizontal");
      legend.renderTo(svg);

      colorScale.domain([0, 85]);
      assertBasicRendering();

      svg.remove();
    });

    it("checks input of orientation", () => {
      assert.doesNotThrow(() => legend.orientation("horizontal"), "can set orientation to horizontal");
      assert.doesNotThrow(() => legend.orientation("right"), "can set orientation to right");
      assert.doesNotThrow(() => legend.orientation("left"), "can set orientation to left");

      // HACKHACK #2661: Cannot assert errors being thrown with description
      (<any> assert).throws(() => legend.orientation("blargh"), Error, "not a valid orientation", "error on invalid orientation");
      svg.remove();
    });

    it("triggers layout computation on orientation change", () => {
      legend.renderTo(svg);

      const widthBefore = legend.width();
      const heightBefore = legend.height();

      legend.orientation("right");
      assert.notEqual(legend.width(), widthBefore, "proportions changed (width)");
      assert.notEqual(legend.height(), heightBefore, "proportions changed (height)");
      svg.remove();
    });

    ORIENTATIONS.forEach((orientation: string) => {
      ["width", "height"].forEach((constrain: string) => {
        it(`renders correctly when ${constrain} is constrained in ${orientation} orientation`, () => {
          let value: number;
          if (orientation === "horizontal") {
            value = constrain === "width" ? 100 : 35;
          } else {
            value = constrain === "width" ? 45 : 100;
          }
          svg.attr(constrain, value);
          legend.orientation(orientation);
          legend.renderTo(svg);
          assertBasicRendering();
          svg.remove();
        });
      });
    });

    it("has the same number of swatches as its height when vertical", () => {
      legend.renderTo(svg);
      legend.orientation("left").expands(false);
      const numSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
      const swatchContainer = legend.content().select(SWATCH_CONTAINER_SELECTOR);
      const swatchContainerHeight = (<Element> swatchContainer.node()).getBoundingClientRect().height;
      legend.expands(true);
      const newNumSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
      const swatchContainerExpandedHeight = (<Element> swatchContainer.node()).getBoundingClientRect().height;
      assert.closeTo(numSwatches, swatchContainerHeight, 1, "non-expanded left legend has one swatch per pixel");
      assert.closeTo(newNumSwatches, swatchContainerExpandedHeight, 1, "expanded left legend has one swatch per pixel");
      svg.remove();
    });

    it("has the same number of swatches as its width when horizontal", () => {
      legend.renderTo(svg);
      legend.orientation("horizontal").expands(false);
      const numSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
      const swatchContainer = legend.content().select(SWATCH_CONTAINER_SELECTOR);
      const swatchContainerWidth = (<Element> swatchContainer.node()).getBoundingClientRect().width;
      legend.expands(true);
      const newNumSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
      const swatchContainerExpandedWidth = (<Element> swatchContainer.node()).getBoundingClientRect().width;
      assert.closeTo(numSwatches, swatchContainerWidth, 1, "non-expanded left legend has one swatch per pixel");
      assert.closeTo(newNumSwatches, swatchContainerExpandedWidth, 1, "expanded left legend has one swatch per pixel");
      svg.remove();
    });
  });

  describe("Expanding", () => {
    const SVG_HEIGHT = 400;
    const SVG_WIDTH = 400;

    let svg: d3.Selection<void>;
    let colorScale: Plottable.Scales.InterpolatedColor;
    let legend: Plottable.Components.InterpolatedColorLegend;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      colorScale = new Plottable.Scales.InterpolatedColor();
      legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    });

    it("fixes height if expand is set to false or orientation is horizontal", () => {
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

    it("fixes width if expand is set to false or orientation is vertically", () => {
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
      legend.orientation("left");
      legend.expands(true);
      legend.renderTo(svg);
      assert.strictEqual(legend.height(), SVG_HEIGHT, "legend height is the same as svg height");
      svg.remove();
    });

    it("spams the entire width if oriented horizontally and expand is set to true", () => {
      legend.expands(true);
      legend.renderTo(svg);
      assert.strictEqual(legend.width(), SVG_WIDTH, "legend width is the same as svg width");
      svg.remove();
    });

    it("has more swatches than default when expand is true", () => {
      legend.renderTo(svg);
      ORIENTATIONS.forEach((orientation) => {
        legend.orientation(orientation).expands(false);
        const numSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
        legend.expands(true);
        const newNumSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
        assert.operator(newNumSwatches, ">", numSwatches, `there are more swatches when expanded (orientation: ${orientation})`);
      });
      svg.remove();
    });

  });

  describe("Padding", () => {
    const SVG_HEIGHT = 400;
    const SVG_WIDTH = 400;

    let svg: d3.Selection<void>;
    let colorScale: Plottable.Scales.InterpolatedColor;
    let legend: Plottable.Components.InterpolatedColorLegend;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      colorScale = new Plottable.Scales.InterpolatedColor();
      legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    });

    it("does not have padding on ends of vertical legends", () => {
      legend.renderTo(svg);
      const orientations = ["left", "right"];
      orientations.forEach((orientation) => {
        legend.orientation(orientation).expands(true);
        const height = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect().height;
        assert.closeTo(height, SVG_HEIGHT, window.Pixel_CloseTo_Requirement,
          "actual height is SVG_HEIGHT with orientation: " + orientation);
      });
      svg.remove();
    });

    it("pads left-oriented legends correctly", () => {
      legend.orientation("left");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      let legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      let swatchWidth = swatchBoundingRect.width;
      let swatchEdge = swatchBoundingRect.right;
      let legendEdge = legendBoundingRect.right;
      let padding = legendEdge - swatchEdge;
      assert.closeTo(swatchWidth, padding, window.Pixel_CloseTo_Requirement,
        "padding is approximately equal to swatch width");
      legend.expands(true);
      swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      swatchWidth = swatchBoundingRect.width;
      swatchEdge = swatchBoundingRect.right;
      legendEdge = legendBoundingRect.right;
      padding = legendEdge - swatchEdge;
      assert.closeTo(swatchWidth, padding, window.Pixel_CloseTo_Requirement,
        "padding is approximately equal to swatch width when expanded");
      svg.remove();
    });

    it("pads right-oriented legends correctly", () => {
      legend.orientation("right");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      let legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      let swatchWidth = swatchBoundingRect.width;
      let swatchEdge = swatchBoundingRect.left;
      let legendEdge = legendBoundingRect.left;
      let padding = swatchEdge - legendEdge;
      // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
      assert.closeTo(swatchWidth, padding, 2,
        "padding is approximately equal to swatch width");
      legend.expands(true);
      swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
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
      legend.orientation("horizontal");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      let legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      let swatchHeight = swatchBoundingRect.height;
      let swatchEdge = swatchBoundingRect.bottom;
      let legendEdge = legendBoundingRect.bottom;
      let padding = legendEdge - swatchEdge;
      assert.closeTo(swatchHeight, padding, window.Pixel_CloseTo_Requirement,
        "padding is approximately equal to swatch height");
      legend.expands(true);
      swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      swatchHeight = swatchBoundingRect.height;
      swatchEdge = swatchBoundingRect.bottom;
      legendEdge = legendBoundingRect.bottom;
      padding = legendEdge - swatchEdge;
      assert.closeTo(swatchHeight, padding, window.Pixel_CloseTo_Requirement,
        "padding is approximately equal to swatch height when expanded");
      svg.remove();
    });
  });

  describe("Constrained situations", () => {
    let svg: d3.Selection<void>;
    let colorScale: Plottable.Scales.InterpolatedColor;
    let legend: Plottable.Components.InterpolatedColorLegend;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      colorScale = new Plottable.Scales.InterpolatedColor();
      legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    });

    it("degrades padding when height is constrained in horizontal orientation", () => {
      legend.orientation("horizontal");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      const unconstrainedSwatchHeight = swatchBoundingRect.height;
      const textHeight = unconstrainedSwatchHeight;
      const constrainedHeight = textHeight;
      svg.attr("height", constrainedHeight);
      legend.redraw();
      const legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      const topPadding = swatchBoundingRect.top - legendBoundingRect.top;
      const bottomPadding = legendBoundingRect.bottom - swatchBoundingRect.bottom;
      assert.operator(topPadding, "<", textHeight, "top padding degrades to be smaller than textHeight");
      assert.operator(bottomPadding, "<", textHeight, "bottom padding degrades to be smaller than textHeight");
      svg.remove();
    });

    it("degrades padding when width is constrained in left orientation", () => {
      legend.orientation("left");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      const unconstrainedSwatchWidth = swatchBoundingRect.width;
      const textHeight = unconstrainedSwatchWidth;
      const constrainedWidth = textHeight * 2;
      svg.attr("width", constrainedWidth);
      legend.redraw();
      const legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      const leftPadding = legendBoundingRect.right - swatchBoundingRect.right;
      assert.operator(leftPadding, "<", textHeight, "right-side padding degrades to be smaller than textHeight");
      svg.remove();
    });

    it("degrades padding when width is constrained in right orientation", () => {
      legend.orientation("right");
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      const unconstrainedSwatchWidth = swatchBoundingRect.width;
      const textHeight = unconstrainedSwatchWidth;
      const constrainedWidth = textHeight * 2;
      svg.attr("width", constrainedWidth);
      legend.redraw();
      const legendBoundingRect = (<Element> legend.background().select(BACKGROUND_SELECTOR).node()).getBoundingClientRect();
      swatchBoundingRect = (<Element> legend.content().select(SWATCH_CONTAINER_SELECTOR).node()).getBoundingClientRect();
      const leftPadding = swatchBoundingRect.left - legendBoundingRect.left;
      assert.operator(leftPadding, "<", textHeight, "left-side padding degrades to be smaller than textHeight");
      svg.remove();
    });

    it("degrades gracefully when width is very constrained", () => {
      legend.orientation("horizontal");
      legend.renderTo(svg);
      const constrainedWidth = 30;
      svg.attr("width", constrainedWidth);
      assert.doesNotThrow(() => legend.redraw(), Error, "rendering in a small space should not error");
      const numSwatches = legend.content().selectAll(SWATCH_SELECTOR).size();
      assert.strictEqual(0, numSwatches, "no swatches are drawn");
      svg.remove();
    });

  });

  describe("Title Element", () => {
    let svg: d3.Selection<void>;
    let colorScale: Plottable.Scales.InterpolatedColor;
    let legend: Plottable.Components.InterpolatedColorLegend;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      colorScale = new Plottable.Scales.InterpolatedColor();
      legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    });

    it("adds formatted title element to each swatch", () => {
      const formatter = Plottable.Formatters.percentage(2);
      legend.formatter(formatter);
      legend.renderTo(svg);

      const entries = legend.content().selectAll("rect.swatch");
      assert.operator(entries.size(), ">=", 11, "there is at least 11 swatches");
      entries.each(function(d, i) {
        const swatch = d3.select(this);
        assert.strictEqual(swatch.select("title").text(), formatter(d));
      });
      svg.remove();
    });

    it("does not create title elements if configuration is set to false", () => {
      Plottable.Configs.ADD_TITLE_ELEMENTS = false;
      legend.renderTo(svg);

      const entries = legend.content().selectAll("rect.swatch");
      assert.operator(entries.size(), ">=", 11, "there is at least 11 swatches");
      const titles = entries.selectAll("title");
      assert.strictEqual(titles.size(), 0, "no titles should be rendered");
      svg.remove();
    });
  });
});
