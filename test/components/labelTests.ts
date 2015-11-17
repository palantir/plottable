///<reference path="../testReference.ts" />

describe("Labels", () => {
  describe("Basic Usage", () => {

    it("only accepts strings as input for text", () => {
      const label = new Plottable.Components.Label();
      // HACKHACK #2661: Cannot assert errors being thrown with description
      (<any> assert).throws(() => label.text(<any> 23), Error,
        "Label.text() only takes strings as input", "error on inputing number");
      (<any> assert).throws(() => label.text(<any> new Date()), Error,
        "Label.text() only takes strings as input", "error on inputing Date");
      assert.doesNotThrow(() => label.text("string"), Error, "text() accepts strings");
      assert.strictEqual(label.text(null), "string", "text(null) returns text string");
    });

    it("converts angle to stay within -180 and 180", () => {
      const label360 = new Plottable.Components.Label("noScope", 360);
      assert.strictEqual(label360.angle(), 0, "angles are converted to range [-180, 180] (360 -> 0)");
      const label270 = new Plottable.Components.Label("turnRight", 270);
      assert.strictEqual(label270.angle(), -90, "angles are converted to range [-180, 180] (270 -> -90)");
      const labelNeg270 = new Plottable.Components.Label("turnRight", -270);
      assert.strictEqual(labelNeg270.angle(), 90, "angles are converted to range [-180, 180] (-270 -> 90)");
    });

    it("throws error on invalid angles", () => {
      let badAngle = 10;
      (<any> assert).throws(() => new Plottable.Components.Label("foo").angle(badAngle), Error,
        `${badAngle} is not a valid angle for Label`, "only accept -90/0/90 for angle");
      (<any> assert).throws(() => new Plottable.Components.Label("foo", badAngle), Error,
        `${badAngle} is not a valid angle for Label`, "only accept -90/0/90 for angle");
    });

    it("positions centered text in a table properly", () => {
      const svgWidth = 400;
      const svg = TestMethods.generateSVG(svgWidth);
      const label = new Plottable.Components.Label("X");
      const t = new Plottable.Components.Table().add(label, 0, 0)
                                        .add(new Plottable.Component(), 1, 0);
      t.renderTo(svg);
      const textTranslate = d3.transform(label.content().select("g").attr("transform")).translate;
      const eleTranslate = d3.transform((<any> label)._element.attr("transform")).translate;
      const textWidth = Plottable.Utils.DOM.elementBBox(label.content().select("text")).width;
      assert.closeTo(eleTranslate[0] + textTranslate[0] + textWidth / 2, svgWidth / 2,
        window.Pixel_CloseTo_Requirement, "label is centered");
      svg.remove();
    });

    it("pads reacts under align", () => {
      const svg = TestMethods.generateSVG(400, 200);
      const testLabel = new Plottable.Components.Label("testing label").padding(30).xAlignment("left");
      const longLabel = new Plottable.Components.Label("LONG LABELLLLLLLLLLLLLLLLL").xAlignment("left");
      const topLabel = new Plottable.Components.Label("label").yAlignment("bottom");
      new Plottable.Components.Table([[topLabel], [testLabel], [longLabel]]).renderTo(svg);

      let testTextRect = (<Element> testLabel.content().select("text").node()).getBoundingClientRect();
      let longTextRect = (<Element> longLabel.content().select("text").node()).getBoundingClientRect();

      assert.closeTo(testTextRect.left, longTextRect.left + 30, window.Pixel_CloseTo_Requirement, "left difference by padding amount");

      testLabel.xAlignment("right");

      testTextRect = (<Element> testLabel.content().select("text").node()).getBoundingClientRect();
      longTextRect = (<Element> longLabel.content().select("text").node()).getBoundingClientRect();

      assert.closeTo(testTextRect.right, longTextRect.right - 30, window.Pixel_CloseTo_Requirement, "right difference by padding amount");

      testLabel.yAlignment("bottom");

      testTextRect = (<Element> testLabel.content().select("text").node()).getBoundingClientRect();
      longTextRect = (<Element> longLabel.content().select("text").node()).getBoundingClientRect();

      assert.closeTo(testTextRect.bottom, longTextRect.top - 30, window.Pixel_CloseTo_Requirement, "vertical difference by padding amount");

      testLabel.yAlignment("top");

      testTextRect = (<Element> testLabel.content().select("text").node()).getBoundingClientRect();
      const topTextRect = (<Element> topLabel.content().select("text").node()).getBoundingClientRect();

      assert.closeTo(testTextRect.top, topTextRect.bottom + 30, window.Pixel_CloseTo_Requirement, "vertical difference by padding amount");
      svg.remove();
    });

    it("puts space around the label", () => {
      const svg = TestMethods.generateSVG();
      const testLabel = new Plottable.Components.Label("testing label").padding(30);
      testLabel.renderTo(svg);

      const measurer = new SVGTypewriter.Measurers.Measurer(svg);
      const measure = measurer.measure("testing label");
      assert.operator(testLabel.width(), ">", measure.width, "padding increases size of the component");
      assert.operator(testLabel.width(), "<=", measure.width + 2 * testLabel.padding(), "width at most incorporates full padding amount");
      assert.operator(testLabel.height(), ">", measure.height, "padding increases size of the component");
      assert.operator(testLabel.height(), ">=", measure.height + 2 * testLabel.padding(),
        "height at most incorporates full padding amount");
      svg.remove();
    });

    it("errors on negative padding", () => {
      const testLabel = new Plottable.Components.Label("testing label");
      (<any> assert).throws(() => testLabel.padding(-10), Error, "Cannot be less than 0", "error on negative input");
    });
  });

  describe("TitleLabel", () => {
    it("generates standard text title label properly", () => {
      const label = new Plottable.Components.TitleLabel("A CHART TITLE");
      const svg = TestMethods.generateSVG();
      label.renderTo(svg);

      const content = label.content();
      assert.isTrue((<any> label)._element.classed("label"), "title element has label css class");
      assert.isTrue((<any> label)._element.classed("title-label"), "title element has title-label css class");
      const textChildren = content.selectAll("text");
      assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

      const text = content.select("text");
      const bbox = Plottable.Utils.DOM.elementBBox(text);
      assert.closeTo(bbox.height, label.height(), window.Pixel_CloseTo_Requirement, "text height === label.minimumHeight()");
      assert.strictEqual((<Element> text.node()).textContent, "A CHART TITLE", "node's text content is as expected");
      svg.remove();
    });

    it("can update text after label is created", () => {
      const svg = TestMethods.generateSVG();
      const label = new Plottable.Components.TitleLabel("a");
      label.renderTo(svg);
      assert.strictEqual(label.content().select("text").text(), "a", "the text starts at the specified string");
      assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
      label.text("hello world");
      label.renderTo(svg);
      assert.strictEqual(label.content().select("text").text(), "hello world", "the label text updated properly");
      assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
      svg.remove();
    });

    it("truncates text that is too long to be render", () => {
      const svgWidth = 400;
      const svg = TestMethods.generateSVG(svgWidth);
      const label = new Plottable.Components.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
      label.renderTo(svg);
      const content = label.content();
      const text = content.select("text");
      const bbox = Plottable.Utils.DOM.elementBBox(text);
      assert.strictEqual(bbox.height, label.height(), "text height === label.minimumHeight()");
      assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
      svg.remove();
    });

    it("truncates text to empty string if space given is too small", () => {
      const svg = TestMethods.generateSVG(10, 10);
      const label = new Plottable.Components.TitleLabel("Yeah, not gonna fit...");
      label.renderTo(svg);
      const text =  label.content().select("text");
      assert.strictEqual(text.text(), "", "text was truncated to empty string");
      svg.remove();
    });

    it("sets width to 0 if a label text is changed to empty string", () => {
      const svg = TestMethods.generateSVG();
      const label = new Plottable.Components.TitleLabel("foo");
      label.renderTo(svg);
      label.text("");
      assert.strictEqual(label.width(), 0, "width updated to 0");
      svg.remove();
    });

  });

  describe("AxisLabel", () => {
    const BBOX_SELECTOR = ".bounding-box";
    it("can change label angle after label is created", () => {
      const svg = TestMethods.generateSVG();
      const label = new Plottable.Components.AxisLabel("CHANGING ORIENTATION");
      label.renderTo(svg);

      const content = label.content();
      let text = content.select("text");
      let bbox = Plottable.Utils.DOM.elementBBox(text);
      assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");

      label.angle(90);
      text = content.select("text");
      bbox = Plottable.Utils.DOM.elementBBox(text);
      TestMethods.assertBBoxInclusion((<any> label)._element.select(BBOX_SELECTOR), text);
      assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");

      svg.remove();
    });

    it("renders left-rotated text properly", () => {
      const svg = TestMethods.generateSVG();
      const label = new Plottable.Components.AxisLabel("LEFT-ROTATED LABEL", -90);
      label.renderTo(svg);
      const content = label.content();
      const text = content.select("text");
      const textBBox = Plottable.Utils.DOM.elementBBox(text);
      TestMethods.assertBBoxInclusion((<any> label)._element.select(BBOX_SELECTOR), text);
      assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
      assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
      svg.remove();
    });

    it("renders right-rotated text properly", () => {
      const svg = TestMethods.generateSVG();
      const label = new Plottable.Components.AxisLabel("RIGHT-ROTATED LABEL", 90);
      label.renderTo(svg);
      const content = label.content();
      const text = content.select("text");
      const textBBox = Plottable.Utils.DOM.elementBBox(text);
      TestMethods.assertBBoxInclusion((<any> label)._element.select(BBOX_SELECTOR), text);
      assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
      assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
      svg.remove();
    });
  });
});
