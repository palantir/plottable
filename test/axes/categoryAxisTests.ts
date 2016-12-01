///<reference path="../testReference.ts" />

describe("Category Axes", () => {
  describe("rendering the tick labels", () => {
    it("handles newlines", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["Johannes\nGensfleisch\nGutenberg"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      axis.renderTo(svg);

      let ticks = axis.content().selectAll("text");
      let texts = ticks[0].map((tick: any) => d3.select(tick).text());
      assert.deepEqual(texts, domain[0].split("\n"), "newlines are supported in domains");

      svg.remove();
    });

    it("renders short words fully", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["2000", "2001", "2002", "2003"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      axis.renderTo(svg);

      let ticks = axis.content().selectAll("text");
      let texts = ticks[0].map((tick: any) => d3.select(tick).text());
      assert.deepEqual(texts, domain, "text displayed correctly when horizontal");

      axis.tickLabelAngle(90);
      ticks = axis.content().selectAll("text");
      texts = ticks[0].map((d: any) => d3.select(d).text());
      assert.deepEqual(texts, domain, "text displayed correctly when horizontal");
      assert.closeTo(d3.transform(axis.content().selectAll(".text-area").attr("transform")).rotate, 90,
        window.Pixel_CloseTo_Requirement, "the ticks were rotated right");

      axis.tickLabelAngle(0);
      ticks = axis.content().selectAll("text");
      texts = ticks[0].map((d: any) => d3.select(d).text());
      assert.deepEqual(texts, domain, "text displayed correctly when horizontal");
      assert.closeTo(d3.transform(axis.content().selectAll(".text-area").attr("transform")).rotate, 0,
        window.Pixel_CloseTo_Requirement, "the ticks were rotated right");

      axis.tickLabelAngle(-90);
      ticks = axis.content().selectAll("text");
      texts = ticks[0].map((d: any) => d3.select(d).text());
      assert.deepEqual(texts, domain, "text displayed correctly when horizontal");
      assert.closeTo(d3.transform(axis.content().selectAll(".text-area").attr("transform")).rotate, -90,
        window.Pixel_CloseTo_Requirement, "the ticks were rotated left");

      svg.remove();
    });

    it("truncates longer labels when tickLabelMaxWidth is set", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["albatross long long long long long long long long long long long long title", "short"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "left");
      const TICK_LABEL_MAX_WIDTH = 60;
      axis.tickLabelMaxWidth(TICK_LABEL_MAX_WIDTH);
      axis.renderTo("svg");

      let ticks = axis.content().selectAll("text");
      ticks.each(function (this: SVGTextElement) {
        // add 5px padding to account for https://github.com/palantir/svg-typewriter/issues/40
        assert.isBelow(this.getBBox().width, TICK_LABEL_MAX_WIDTH + 5, "tick width was capped");
      });

      // unset
      axis.tickLabelMaxWidth(undefined);
      ticks = axis.content().selectAll("text");
      let texts = ticks[0].map((tick: any) => d3.select(tick).text());
      assert.deepEqual(texts, domain, "tick width successfully unset");

      svg.remove();
    });

    it("re-renders with the new domain when the category scale's domain changes", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["foo", "bar", "baz"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "left");
      axis.renderTo(svg);
      let tickLabels = axis.content().selectAll(".tick-label");
      assert.strictEqual(tickLabels.size(), domain.length, "same number of tick labels as domain entries");
      tickLabels.each(function(d, i) {
        let tickLabel = d3.select(this);
        assert.strictEqual(tickLabel.text(), domain[i], "tick labels render domain");
      });

      let changedDomain = ["bar", "baz", "bam"];
      scale.domain(changedDomain);

      tickLabels = axis.content().selectAll(".tick-label");
      assert.strictEqual(tickLabels.size(), changedDomain.length, "same number of tick labels as changed domain entries");
      tickLabels.each(function(d, i) {
        let tickLabel = d3.select(this);
        assert.strictEqual(tickLabel.text(), changedDomain[i], `tick label ${i} renders after changing domain`);
      });
      svg.remove();
    });

    it("does not overlap labels with tick marks", () => {

      function verifyTickLabelOverlaps(tickLabels: d3.Selection<void>, tickMarks: d3.Selection<void>) {
          for (let i = 0; i < tickLabels[0].length; i++) {
            let tickLabelRect = (<Element> tickLabels[0][i]).getBoundingClientRect();
            let tickMarkRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
            assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(tickLabelRect, tickMarkRect), "tick label and rect do not overlap");
          }
      }

      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Category();
      let axis = new Plottable.Axes.Category(scale, "left");
      scale.domain(["A", "B", "C"]);
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(".tick-label");
      let tickMarks = axis.content().selectAll(".tick-mark");
      verifyTickLabelOverlaps(tickLabels, tickMarks);
      axis.orientation("right");
      verifyTickLabelOverlaps(tickLabels, tickMarks);
      svg.remove();
    });

    it("renders the domain from top to bottom on a vertical axis", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["label1", "label2", "label100"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "left");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(".tick-label");
      assert.deepEqual(tickLabels.data(), domain, "tick label per datum in given order");

      let getYTransform = (selection: d3.Selection<any>) => {
        return d3.transform(selection.attr("transform")).translate[1];
      };

      tickLabels.each(function(d, i) {
        if (i === tickLabels.size() - 1) {
          return;
        }
        let tickLabel = d3.select(this);
        let nextTickLabel = d3.select(tickLabels[0][i + 1]);
        assert.operator(getYTransform(tickLabel), "<", getYTransform(nextTickLabel), "labels render from top to bottom");
      });

      axis.destroy();
      svg.remove();
    });

    it("renders the domain from left to right on a horizontal axis", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["label1", "label2", "label100"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(".tick-label");
      assert.deepEqual(tickLabels.data(), domain, "tick label per datum in given order");

      let getXTransform = (selection: d3.Selection<any>) => {
        return d3.transform(selection.attr("transform")).translate[0];
      };

      tickLabels.each(function(d, i) {
        if (i === tickLabels.size() - 1) {
          return;
        }
        let tickLabel = d3.select(this);
        let nextTickLabel = d3.select(tickLabels[0][i + 1]);
        assert.operator(getXTransform(tickLabel), "<", getXTransform(nextTickLabel), "labels render from left to right");
      });

      axis.destroy();
      svg.remove();
    });
  });

  describe("requesting space when bottom oriented", () => {
    let svg: d3.Selection<void>;
    let axis: Plottable.Axes.Category;
    let scale: Plottable.Scales.Category;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      scale = new Plottable.Scales.Category();
      axis = new Plottable.Axes.Category(scale, "bottom");
    });

    afterEach(() => {
      axis.destroy();
    });

    it("requests no space when the scale has no domain", () => {
      axis.anchor(svg);
      let space = axis.requestedSpace(TestMethods.numAttr(svg, "width"), TestMethods.numAttr(svg, "height"));
      assert.strictEqual(space.minWidth, 0, "requested no width");
      assert.strictEqual(space.minHeight, 0, "requested no height");
      svg.remove();
    });

    it("requests more space if not enough space to fit the text", () => {
      let domain = ["2000", "2001", "2002", "2003"];
      scale.domain(domain);
      axis.renderTo(svg);
      let smallDimension = 10;
      let spaceRequest = axis.requestedSpace(300, smallDimension);
      assert.operator(spaceRequest.minHeight, ">", smallDimension, "horizontal axis requested more height if constrained");
      axis.orientation("left");
      spaceRequest = axis.requestedSpace(smallDimension, 300);
      assert.operator(spaceRequest.minWidth, ">", smallDimension, "vertical axis requested more width if constrained");
      svg.remove();
    });

    it("requests more space for rotated text", () => {
      let domain = ["label1", "label2", "label100"];
      scale.domain(domain);
      axis.renderTo(svg);

      let requestedSpace = axis.requestedSpace(TestMethods.numAttr(svg, "width"), 50);
      let flatHeight = requestedSpace.minHeight;

      axis.tickLabelAngle(-90);
      requestedSpace = axis.requestedSpace(TestMethods.numAttr(svg, "width"), 50);
      assert.operator(flatHeight, "<", requestedSpace.minHeight, "axis should request more height when tick labels are rotated");
      svg.remove();
    });

    it("accounts for margin, innerTickLength, and padding when calculating for height", () => {
      scale.domain(["foo", "bar", "baz"]);
      axis.anchor(svg);

      let svgWidth = TestMethods.numAttr(svg, "width");
      let svgHeight = TestMethods.numAttr(svg, "height");

      let axisRequestedHeight = () => axis.requestedSpace(svgWidth, svgHeight).minHeight;

      let oldHeight = axisRequestedHeight();
      let increaseAmount = 5;
      axis.tickLabelPadding(axis.tickLabelPadding() + increaseAmount);
      assert.strictEqual(axisRequestedHeight(), oldHeight + increaseAmount, "increasing tickLabelPadding increases height");

      oldHeight = axisRequestedHeight();
      axis.margin(axis.margin() + increaseAmount);
      assert.strictEqual(axisRequestedHeight(), oldHeight + increaseAmount, "increasing margin increases height");

      oldHeight = axisRequestedHeight();
      axis.innerTickLength(axis.innerTickLength() + increaseAmount);
      assert.strictEqual(axisRequestedHeight(), oldHeight + increaseAmount, "increasing innerTickLength increases height");

      axis.destroy();
      svg.remove();
    });
  });

  describe("requesting space on left oriented axes", () => {

    it("accounts for margin, innerTickLength, and padding when calculating for width", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]);
      let axis = new Plottable.Axes.Category(scale, "left");
      axis.anchor(svg);

      let svgWidth = TestMethods.numAttr(svg, "width");
      let svgHeight = TestMethods.numAttr(svg, "height");

      let axisRequestedWidth = () => axis.requestedSpace(svgWidth, svgHeight).minWidth;

      let oldWidth = axisRequestedWidth();
      let increaseAmount = 5;
      axis.tickLabelPadding(axis.tickLabelPadding() + increaseAmount);
      assert.strictEqual(axisRequestedWidth(), oldWidth + increaseAmount, "increasing tickLabelPadding increases width");

      oldWidth = axisRequestedWidth();
      axis.margin(axis.margin() + increaseAmount);
      assert.strictEqual(axisRequestedWidth(), oldWidth + increaseAmount, "increasing margin increases width");

      oldWidth = axisRequestedWidth();
      axis.innerTickLength(axis.innerTickLength() + increaseAmount);
      assert.strictEqual(axisRequestedWidth(), oldWidth + increaseAmount, "increasing innerTickLength increases width");

      axis.destroy();
      svg.remove();
    });
  });

  describe("coercing", () => {
    it("does not blow up for non-string data", () => {
      let svg = TestMethods.generateSVG();
      let domain: any[] = [null, undefined, true, 2, "foo"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      axis.renderTo(svg);
      let texts = svg.selectAll("text")[0].map((s: any) => d3.select(s).text());
      assert.deepEqual(texts, domain.map((d) => String(d)));
      axis.destroy();
      svg.remove();
    });
  });

  describe("formatting the text", () => {
    it("uses the formatter if supplied", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["Air", "Bi", "Sea"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      let addPlane = (l: string) => l + "plane";
      axis.formatter(addPlane);
      axis.renderTo(svg);
      let expectedTexts = domain.map(addPlane);
      axis.content().selectAll("text").each(function(d, i) {
        let actualText = d3.select(this).text();
        assert.strictEqual(actualText, expectedTexts[i], "formatter was applied");
      });
      axis.destroy();
      svg.remove();
    });
  });

  describe("setting the tick lengths", () => {
    it("draws inner ticks with the specified length", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Category().domain(["foo", "bar", "baz", "blue", "red"]);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      let innerTickLength = 20;
      axis.innerTickLength(innerTickLength);
      axis.renderTo(svg);

      let innerTickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}:not(.${Plottable.Axis.END_TICK_MARK_CLASS})`);
      assert.strictEqual(innerTickMarks.size(), scale.domain().length - 2, "same number of inner ticks as domain entries minus 2");

      innerTickMarks.each(function(d, i) {
        let innerTickMark = d3.select(this);
        let innerTickMarkLength = Math.abs(TestMethods.numAttr(innerTickMark, "y1") - TestMethods.numAttr(innerTickMark, "y2"));
        assert.closeTo(innerTickMarkLength, innerTickLength, window.Pixel_CloseTo_Requirement, `tick mark ${i} of specified length`);
      });

      axis.destroy();
      svg.remove();
    });

    it("draws end ticks with the specified length", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Category().domain(["foo", "bar", "baz", "blue", "red"]);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      let endTickLength = 20;
      axis.endTickLength(endTickLength);
      axis.renderTo(svg);

      let endTickMarks = axis.content().selectAll(`.${Plottable.Axis.END_TICK_MARK_CLASS}`);
      assert.strictEqual(endTickMarks.size(), 2, "2 end ticks");

      endTickMarks.each(function(d, i) {
        let endTickMark = d3.select(this);
        let endTickMarkLength = Math.abs(TestMethods.numAttr(endTickMark, "y1") - TestMethods.numAttr(endTickMark, "y2"));
        assert.closeTo(endTickMarkLength, endTickLength, window.Pixel_CloseTo_Requirement, `tick mark ${i} of specified length`);
      });

      axis.destroy();
      svg.remove();
    });
  });
});
