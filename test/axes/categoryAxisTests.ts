///<reference path="../testReference.ts" />

describe("Category Axes", () => {
  describe("rendering the tick labels", () => {
    it("renders short words fully", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["2000", "2001", "2002", "2003"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      axis.renderTo(svg);

      let ticks = axis.content().selectAll("text");
      let text = ticks[0].map((tick: any) => d3.select(tick).text());
      assert.deepEqual(text, domain, "text displayed correctly when horizontal");

      axis.tickLabelAngle(90);
      ticks = axis.content().selectAll("text");
      text = ticks[0].map((d: any) => d3.select(d).text());
      assert.deepEqual(text, domain, "text displayed correctly when horizontal");
      assert.closeTo(d3.transform(axis.content().selectAll(".text-area").attr("transform")).rotate, 90,
        window.Pixel_CloseTo_Requirement, "the ticks were rotated right");

      axis.tickLabelAngle(0);
      ticks = axis.content().selectAll("text");
      text = ticks[0].map((d: any) => d3.select(d).text());
      assert.deepEqual(text, domain, "text displayed correctly when horizontal");
      assert.closeTo(d3.transform(axis.content().selectAll(".text-area").attr("transform")).rotate, 0,
        window.Pixel_CloseTo_Requirement, "the ticks were rotated right");

      axis.tickLabelAngle(-90);
      ticks = axis.content().selectAll("text");
      text = ticks[0].map((d: any) => d3.select(d).text());
      assert.deepEqual(text, domain, "text displayed correctly when horizontal");
      assert.closeTo(d3.transform(axis.content().selectAll(".text-area").attr("transform")).rotate, -90,
        window.Pixel_CloseTo_Requirement, "the ticks were rotated left");

      svg.remove();
    });

    it("re-renders with the new domain when the category scale's domain changes", () => {
      let svg = TestMethods.generateSVG();
      let domain = ["foo", "bar", "baz"];
      let scale = new Plottable.Scales.Category().domain(domain);
      let axis = new Plottable.Axes.Category(scale, "left");
      axis.renderTo(svg);
      assert.deepEqual(axis.content().selectAll(".tick-label").data(), scale.domain(), "tick labels render domain");
      let changedDomain = ["bar", "baz", "bam"];
      scale.domain(changedDomain);
      assert.deepEqual(axis.content().selectAll(".tick-label").data(), scale.domain(), "tick labels render domain");
      svg.remove();
    });

    it("does not overlap axis labels with tick labels", () => {

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
  });

  describe("requesting space", () => {

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

    it("requests more space when rotated than not rotated", () => {
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

  describe("computing the size", () => {

    it("accounts for margin. innerTickLength, and padding when calculating for width when vertical", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]);
      let axis = new Plottable.Axes.Category(scale, "left");
      axis.renderTo(svg);

      let axisWidth = axis.width();
      let increaseAmount = 5;
      axis.tickLabelPadding(axis.tickLabelPadding() + increaseAmount);
      assert.strictEqual(axis.width(), axisWidth + increaseAmount, "increasing tickLabelPadding increases width");

      axisWidth = axis.width();
      axis.margin(axis.margin() + increaseAmount);
      assert.strictEqual(axis.width(), axisWidth + increaseAmount, "increasing margin increases width");

      axisWidth = axis.width();
      axis.innerTickLength(axis.innerTickLength() + increaseAmount);
      assert.strictEqual(axis.width(), axisWidth + increaseAmount, "increasing innerTickLength increases width");

      axis.destroy();
      svg.remove();
    });

    it("accounts for margin. innerTickLength, and padding when calculating for height when vertical", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]);
      let axis = new Plottable.Axes.Category(scale, "bottom");
      axis.renderTo(svg);

      let axisHeight = axis.height();
      axis.tickLabelPadding(axis.tickLabelPadding() + 5);
      assert.closeTo(axis.height(), axisHeight + 5, 2, "increasing tickLabelPadding increases height");

      axisHeight = axis.height();
      axis.margin(axis.margin() + 5);
      assert.closeTo(axis.height(), axisHeight + 5, 2, "increasing margin increases height");

      axisHeight = axis.height();
      axis.innerTickLength(axis.innerTickLength() + 5);
      assert.closeTo(axis.height(), axisHeight + 5, 2, "increasing innerTickLength increases height");

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
        assert.closeTo(innerTickMarkLength, innerTickLength, window.Pixel_CloseTo_Requirement, "tick mark of specified length");
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
        assert.closeTo(endTickMarkLength, endTickLength, window.Pixel_CloseTo_Requirement, "tick mark of specified length");
      });

      axis.destroy();
      svg.remove();
    });
  });
});
