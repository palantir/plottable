///<reference path="../testReference.ts" />

describe("InterpolatedColorLegend", () => {
  let svg: d3.Selection<void>;
  let colorScale: Plottable.Scales.InterpolatedColor;
  const SVG_HEIGHT = 400;
  const SVG_WIDTH = 400;
  const HORIZONTAL_ORIENTATIONS = ["top", "bottom"];
  const VERITCAL_ORIENTATIONS = ["left", "right"];
  beforeEach(() => {
    svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    colorScale = new Plottable.Scales.InterpolatedColor();
  });

  function assertBasicRendering(legend: Plottable.Components.InterpolatedColorLegend) {
    const scaleDomain = colorScale.domain();
    const legendElement: d3.Selection<void> = (<any> legend)._element;

    const swatches = legendElement.selectAll(".swatch");
    assert.strictEqual(d3.select(swatches[0][0]).attr("fill"),
                       colorScale.scale(scaleDomain[0]),
                       "first swatch's color corresponds with first domain value");
    assert.strictEqual(d3.select(swatches[0][swatches[0].length - 1]).attr("fill"),
                       colorScale.scale(scaleDomain[1]),
                       "last swatch's color corresponds with second domain value");
    const defaultNumSwatches = (<any> Plottable.Components.InterpolatedColorLegend)._DEFAULT_NUM_SWATCHES;
    assert.operator(swatches.size(), ">=", defaultNumSwatches, "there are at least 11 swatches");

    const swatchContainer = legendElement.select(".swatch-container");
    const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();
    const swatchBoundingBox = legendElement.select(".swatch-bounding-box");
    const boundingBoxBCR = (<Element> swatchBoundingBox.node()).getBoundingClientRect();
    assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, boundingBoxBCR),
                  "bounding box contains all swatches");

    const elementBCR = (<Element> legendElement.node()).getBoundingClientRect();
    assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, elementBCR),
                  "swatches are drawn within the legend's element");

    const formattedDomainValues = scaleDomain.map((<any> legend)._formatter);
    const labels = legendElement.selectAll("text");
    const labelTexts = labels[0].map((textNode: HTMLScriptElement) => textNode.textContent);
    assert.deepEqual(labelTexts, formattedDomainValues, "formatter is used to format label text");
  }

  describe("rendering", () => {
    HORIZONTAL_ORIENTATIONS.forEach((orientation: string) => {
      it(`renders swatches and labels in correct order when oriented ${orientation}`, () => {
        const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
        legend.renderTo(svg);

        assertBasicRendering(legend);

        const legendElement: d3.Selection<void> = (<any> legend)._element;
        const labels = legendElement.selectAll("text");
        const swatchContainer = legendElement.select(".swatch-container");
        const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

        const lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
        const upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
        assert.closeTo(lowerLabelBCR.left, swatchContainerBCR.left, window.Pixel_CloseTo_Requirement, "left align first label ");
        assert.closeTo(upperLabelBCR.right, swatchContainerBCR.right, window.Pixel_CloseTo_Requirement, "right align second label");
        if (orientation === "top") {
          assert.operator(lowerLabelBCR.top, "<=", swatchContainerBCR.top, `first label is to the top of swatches`);
          assert.operator(upperLabelBCR.top, "<=", swatchContainerBCR.top, `second label is to the top of swatches`);
        } else {
          assert.operator(lowerLabelBCR.bottom, ">=", swatchContainerBCR.bottom, `first label is to the bottom of swatches`);
          assert.operator(upperLabelBCR.bottom, ">=", swatchContainerBCR.bottom, `second label is to the bottom of swatches`);
        }
        assert.operator(upperLabelBCR.left, ">=", lowerLabelBCR.right, "lower label is drawn to the left of upper label");
        svg.remove();
      });
    });

    VERITCAL_ORIENTATIONS.forEach((orientation: string) => {
      it(`renders swatches and labels in correct order when oriented ${orientation}`, () => {
        const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
        legend.orientation(orientation);
        legend.renderTo(svg);

        assertBasicRendering(legend);

        const legendElement: d3.Selection<void> = (<any> legend)._element;
        const labels = legendElement.selectAll("text");
        const swatchContainer = legendElement.select(".swatch-container");
        const swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

        const lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
        const upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
        assert.closeTo(lowerLabelBCR.bottom, swatchContainerBCR.bottom, window.Pixel_CloseTo_Requirement, "bottom align first label");
        assert.closeTo(upperLabelBCR.top, swatchContainerBCR.top, window.Pixel_CloseTo_Requirement, "top align second label");
        if (orientation === "left") {
          assert.operator(lowerLabelBCR.left, "<=", swatchContainerBCR.left, `first label is to the left of swatches`);
          assert.operator(upperLabelBCR.left, "<=", swatchContainerBCR.left, `second label is to the left of swatches`);
        } else {
          assert.operator(lowerLabelBCR.right, ">=", swatchContainerBCR.right, `first label is to the right of swatches`);
          assert.operator(upperLabelBCR.right, ">=", swatchContainerBCR.right, `second label is to the right of swatches`);
        }
        assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

        svg.remove();
      });
    });
  });

  it("does not crash when font-size is 0px", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
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
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    colorScale.domain([0, 85]);
    assertBasicRendering(legend);

    svg.remove();
  });

  it("chckeds input for orientation", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);

    HORIZONTAL_ORIENTATIONS.concat(VERITCAL_ORIENTATIONS).forEach((orientation: string) => {
      assert.strictEqual(legend.orientation(orientation), legend, `setting orientation to ${orientation} returns calling legend`);
      assert.strictEqual(legend.orientation(), orientation, `orientation is set to ${orientation}`);
    });

    assert.strictEqual(legend.orientation("horizontal"), legend, `setting orientation to horizontal returns calling legend`);
    assert.strictEqual(legend.orientation(), "bottom", `orientation is set to bottom when input horizontal`);

    assert.throws(() => legend.orientation("blargh"), "not a valid orientation");
    svg.remove();
  });

  it("triggers layout computation on orient", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    const widthBefore = legend.width();
    const heightBefore = legend.height();

    legend.orientation("right");
    assert.notEqual(legend.width(), widthBefore, "proportions changed (width)");
    assert.notEqual(legend.height(), heightBefore, "proportions changed (height)");
    svg.remove();
  });

  HORIZONTAL_ORIENTATIONS.concat(VERITCAL_ORIENTATIONS).forEach((orientation: string) => {
    it(`renders correctly when width is constrained when oriented ${orientation}`, () => {
      svg.attr("width", 100);
      const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
      legend.renderTo(svg);
      assertBasicRendering(legend);
      svg.remove();
    });

    it(`renders correctly when height is constrained when oriented ${orientation}`, () => {
    svg.attr("height", 35);
      const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
      legend.renderTo(svg);
      assertBasicRendering(legend);
      svg.remove();
    });
  });

  it("fixed height if expand is set to false or orientation is horizontal", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    assert.isTrue(legend.fixedHeight(), "height is fixed on default");

    legend.expands(true);

    HORIZONTAL_ORIENTATIONS.forEach((orientation: string) => {
      legend.orientation(orientation);
      assert.isTrue(legend.fixedHeight(), `height is fixed oriented horizontally (${orientation})`);
    });
    VERITCAL_ORIENTATIONS.forEach((orientation: string) => {
      legend.orientation(orientation);
      assert.isFalse(legend.fixedHeight(), `height is not fixed oriented vertically (${orientation})`);
    });

    legend.expands(false);
    HORIZONTAL_ORIENTATIONS.concat(VERITCAL_ORIENTATIONS).forEach((orientation: string) => {
      legend.orientation(orientation);
      assert.isTrue(legend.fixedHeight(), `height is fixed when expand is set to false oriented ${orientation}`);
    });

    svg.remove();
  });

  it("fixed width if expand is set to false or orientation is vertically", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    assert.isTrue(legend.fixedWidth(), "width is fixed on default");

    legend.expands(true);

    HORIZONTAL_ORIENTATIONS.forEach((orientation: string) => {
      legend.orientation(orientation);
      assert.isFalse(legend.fixedWidth(), `width is not fixed oriented horizontally (${orientation})`);
    });
    VERITCAL_ORIENTATIONS.forEach((orientation: string) => {
      legend.orientation(orientation);
      assert.isTrue(legend.fixedWidth(), `width is fixed oriented vertically (${orientation})`);
    });

    legend.expands(false);
    HORIZONTAL_ORIENTATIONS.concat(VERITCAL_ORIENTATIONS).forEach((orientation: string) => {
      legend.orientation(orientation);
      assert.isTrue(legend.fixedWidth(), `width is fixed when expand is set to false oriented ${orientation}`);
    });

    svg.remove();
  });

  it("spams the entire height if oriented vertically and expand is set to true", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.expands(true);
    legend.renderTo(svg);
    assert.strictEqual(legend.height(), SVG_HEIGHT, "legend height is the same as svg height");
    svg.remove();
  });

  it("spams the entire width if oriented horizontally and expand is set to true", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.expands(true);
    legend.renderTo(svg);
    assert.strictEqual(legend.width(), SVG_WIDTH, "legend width is the same as svg width");
    svg.remove();
  });

  it("has more swatches than default when expand is true", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    HORIZONTAL_ORIENTATIONS.concat(VERITCAL_ORIENTATIONS).forEach((orientation) => {
      legend.orientation(orientation).expands(false);
      const numSwatches = legend.content().selectAll(".swatch").size();
      legend.expands(true);
      const newNumSwatches = legend.content().selectAll(".swatch").size();
      assert.operator(newNumSwatches, ">", numSwatches, `there are more swatches when expanded (orientation: ${orientation})`);
    });
    svg.remove();
  });

  it("has the same number of swatches as its height when vertical", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    legend.orientation("left").expands(false);
    const numSwatches = legend.content().selectAll(".swatch").size();
    const swatchContainer = legend.content().select(".swatch-container");
    const swatchContainerHeight = (<Element> swatchContainer.node()).getBoundingClientRect().height;
    legend.expands(true);
    const newNumSwatches = legend.content().selectAll(".swatch").size();
    const swatchContainerExpandedHeight = (<Element> swatchContainer.node()).getBoundingClientRect().height;
    assert.closeTo(numSwatches, swatchContainerHeight, 1, "non-expanded left legend has one swatch per pixel");
    assert.closeTo(newNumSwatches, swatchContainerExpandedHeight, 1, "expanded left legend has one swatch per pixel");
    svg.remove();
  });

  it("has the same number of swatches as its width when horizontal", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    legend.orientation("top").expands(false);
    const numSwatches = legend.content().selectAll(".swatch").size();
    const swatchContainer = legend.content().select(".swatch-container");
    const swatchContainerWidth = (<Element> swatchContainer.node()).getBoundingClientRect().width;
    legend.expands(true);
    const newNumSwatches = legend.content().selectAll(".swatch").size();
    const swatchContainerExpandedWidth = (<Element> swatchContainer.node()).getBoundingClientRect().width;
    assert.closeTo(numSwatches, swatchContainerWidth, 1, "non-expanded left legend has one swatch per pixel");
    assert.closeTo(newNumSwatches, swatchContainerExpandedWidth, 1, "expanded left legend has one swatch per pixel");
    svg.remove();
  });

  it("does not have padding on ends of vertical legends", () => {
    const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);
    VERITCAL_ORIENTATIONS.forEach((orientation) => {
      legend.orientation(orientation).expands(true);
      const height = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect().height;
      assert.closeTo(height, SVG_HEIGHT, window.Pixel_CloseTo_Requirement, "actual height is SVG_HEIGHT with orientation: " + orientation);
    });
    svg.remove();
  });

  VERITCAL_ORIENTATIONS.forEach((orientation: string) => {
    it(`pads ${orientation} legends correctly`, () => {
      const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      let swatchWidth = swatchBoundingRect.width;
      let swatchEdge = orientation === "left" ? swatchBoundingRect.right : swatchBoundingRect.left;
      let legendEdge = orientation === "left" ? legendBoundingRect.right : legendBoundingRect.left;
      let padding = Math.abs(swatchEdge - legendEdge);
      // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
      assert.closeTo(swatchWidth, padding, 2,
        "padding is approximately equal to swatch width");
      legend.expands(true);
      swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      swatchWidth = swatchBoundingRect.width;
      swatchEdge = orientation === "left" ? swatchBoundingRect.right : swatchBoundingRect.left;
      legendEdge = orientation === "left" ? legendBoundingRect.right : legendBoundingRect.left;
      padding = Math.abs(swatchEdge - legendEdge);
      // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
      assert.closeTo(swatchWidth, padding, 2,
        "padding is approximately equal to swatch width when expanded");
      svg.remove();
    });
  });
  HORIZONTAL_ORIENTATIONS.forEach((orientation: string) => {
    it(`pads ${orientation} legends correctly`, () => {
      const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
      legend.renderTo(svg);
      let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      let legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      let swatchHeight = swatchBoundingRect.height;
      let swatchEdge = orientation === "top" ? swatchBoundingRect.bottom : swatchBoundingRect.top;
      let legendEdge = orientation === "top" ? legendBoundingRect.bottom : legendBoundingRect.top;
      let padding = Math.abs(legendEdge - swatchEdge);
      // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
      assert.closeTo(swatchHeight, padding, 2,
        "padding is approximately equal to swatch height");
      legend.expands(true);
      swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
      legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
      swatchHeight = swatchBoundingRect.height;
      swatchEdge = orientation === "top" ? swatchBoundingRect.bottom : swatchBoundingRect.top;
      legendEdge = orientation === "top" ? legendBoundingRect.bottom : legendBoundingRect.top;
      padding = Math.abs(legendEdge - swatchEdge);
      // HACKHACK #2122: two measurement errors in IE combine, and total error = 2
      assert.closeTo(swatchHeight, padding, 2,
        "padding is approximately equal to swatch height when expanded");
      svg.remove();
    });
  });

  describe("Constrained situations", () => {
    VERITCAL_ORIENTATIONS.forEach((orientation: string) => {
      it(`degrades padding when height is constrained for ${orientation} legends `, () => {
        const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
        legend.renderTo(svg);
        let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
        const unconstrainedSwatchHeight = swatchBoundingRect.height;
        const textHeight = unconstrainedSwatchHeight;
        const constrainedHeight = textHeight;
        svg.attr("height", constrainedHeight);
        legend.redraw();
        const legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
        swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
        const topPadding = swatchBoundingRect.top - legendBoundingRect.top;
        const bottomPadding = legendBoundingRect.bottom - swatchBoundingRect.bottom;
        assert.operator(topPadding, "<=", textHeight, "top padding degrades to be smaller than textHeight");
        assert.operator(bottomPadding, "<=", textHeight, "bottom padding degrades to be smaller than textHeight");
        svg.remove();
      });

      it("degrades gracefully when height is very constrained for ${orientation} legends", () => {
        const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
        legend.renderTo(svg);
        const constrainedHeight = 0.5;
        svg.attr("height", constrainedHeight);
        assert.doesNotThrow(() => legend.redraw(), Error, "rendering in a small space should not error");
        const numSwatches = legend.content().selectAll(".swatch").size();
        assert.strictEqual(0, numSwatches, "no swatches are drawn");
        svg.remove();
      });
    });

    HORIZONTAL_ORIENTATIONS.forEach((orientation: string) => {
      it(`degrades padding when width is constrained for ${orientation} legends`, () => {
        const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
        legend.renderTo(svg);
        let swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
        const unconstrainedSwatchWidth = swatchBoundingRect.width;
        const textHeight = unconstrainedSwatchWidth;
        const constrainedWidth = textHeight * 2;
        svg.attr("width", constrainedWidth);
        legend.redraw();
        const legendBoundingRect = (<Element> legend.background().select(".background-fill").node()).getBoundingClientRect();
        swatchBoundingRect = (<Element> legend.content().select(".swatch-container").node()).getBoundingClientRect();
        const leftPadding = legendBoundingRect.right - swatchBoundingRect.right;
        assert.operator(leftPadding, "<", textHeight, "right-side padding degrades to be smaller than textHeight");
        svg.remove();
      });

      it("degrades gracefully when width is very constrained for ${orientation} legends", () => {
        const legend = new Plottable.Components.InterpolatedColorLegend(colorScale).orientation(orientation);
        legend.renderTo(svg);
        const constrainedWidth = 0.5;
        svg.attr("width", constrainedWidth);
        assert.doesNotThrow(() => legend.redraw(), Error, "rendering in a small space should not error");
        const numSwatches = legend.content().selectAll(".swatch").size();
        assert.strictEqual(0, numSwatches, "no swatches are drawn");
        svg.remove();
      });
    });
  });

  describe("title", () => {
    it("adds formatted title element to each swatch", () => {
      const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
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
      const legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
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
