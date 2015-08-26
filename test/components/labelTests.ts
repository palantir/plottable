///<reference path="../testReference.ts" />

describe("Labels", () => {

  it("text() only accepts strings", () => {
    let label = new Plottable.Components.Label();
    assert.throws(() => label.text(<any> 23), Error);
    assert.throws(() => label.text(<any> new Date()), Error);
    assert.doesNotThrow(() => label.text("string"), Error, "text() accepts strings");
    assert.strictEqual(label.text(null), "string", "text(null) returns a string");
  });

  it("Standard text title label generates properly", () => {
    let svg = TestMethods.generateSVG(400, 80);
    let label = new Plottable.Components.TitleLabel("A CHART TITLE");
    label.renderTo(svg);

    let content = (<any> label)._content;
    assert.isTrue((<any> label)._element.classed("label"), "title element has label css class");
    assert.isTrue((<any> label)._element.classed("title-label"), "title element has title-label css class");
    let textChildren = content.selectAll("text");
    assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

    let text = content.select("text");
    let bbox = Plottable.Utils.DOM.elementBBox(text);
    assert.closeTo(bbox.height, label.height(), 0.5, "text height === label.minimumHeight()");
    assert.strictEqual(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
    svg.remove();
  });

  it("angle() error-checking", () => {
    let label360 = new Plottable.Components.Label("noScope", 360);
    assert.strictEqual(label360.angle(), 0, "angles are converted to range [-180, 180] (360 -> 0)");
    let label270 = new Plottable.Components.Label("turnRight", 270);
    assert.strictEqual(label270.angle(), -90, "angles are converted to range [-180, 180] (270 -> -90)");
    let labelNeg270 = new Plottable.Components.Label("turnRight", -270);
    assert.strictEqual(labelNeg270.angle(), 90, "angles are converted to range [-180, 180] (-270 -> 90)");
    let badAngle = 10;
    assert.throws(() => new Plottable.Components.Label("foo").angle(badAngle), Error);
    assert.throws(() => new Plottable.Components.Label("foo", badAngle), Error);
  });

  it("Left-rotated text is handled properly", () => {
    let svg = TestMethods.generateSVG(100, 400);
    let label = new Plottable.Components.AxisLabel("LEFT-ROTATED LABEL", -90);
    label.renderTo(svg);
    let content = (<any> label)._content;
    let text = content.select("text");
    let textBBox = Plottable.Utils.DOM.elementBBox(text);
    TestMethods.assertBBoxInclusion((<any> label)._element.select(".bounding-box"), text);
    assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
    assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
    svg.remove();
  });

  it("Right-rotated text is handled properly", () => {
    let svg = TestMethods.generateSVG(100, 400);
    let label = new Plottable.Components.AxisLabel("RIGHT-ROTATED LABEL", 90);
    label.renderTo(svg);
    let content = (<any> label)._content;
    let text = content.select("text");
    let textBBox = Plottable.Utils.DOM.elementBBox(text);
    TestMethods.assertBBoxInclusion((<any> label)._element.select(".bounding-box"), text);
    assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
    assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
    svg.remove();
  });

  it("Label text can be changed after label is created", () => {
    let svg = TestMethods.generateSVG(400, 80);
    let label = new Plottable.Components.TitleLabel("a");
    label.renderTo(svg);
    assert.strictEqual((<any> label)._content.select("text").text(), "a", "the text starts at the specified string");
    assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
    label.text("hello world");
    label.renderTo(svg);
    assert.strictEqual((<any> label)._content.select("text").text(), "hello world", "the label text updated properly");
    assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
    svg.remove();
  });

  it("Superlong text is handled in a sane fashion", () => {
    let svgWidth = 400;
    let svg = TestMethods.generateSVG(svgWidth, 80);
    let label = new Plottable.Components.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
    label.renderTo(svg);
    let content = (<any> label)._content;
    let text = content.select("text");
    let bbox = Plottable.Utils.DOM.elementBBox(text);
    assert.strictEqual(bbox.height, label.height(), "text height === label.minimumHeight()");
    assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
    svg.remove();
  });

  it("text in a tiny box is truncated to empty string", () => {
    let svg = TestMethods.generateSVG(10, 10);
    let label = new Plottable.Components.TitleLabel("Yeah, not gonna fit...");
    label.renderTo(svg);
    let text = (<any> label)._content.select("text");
    assert.strictEqual(text.text(), "", "text was truncated to empty string");
    svg.remove();
  });

  it("centered text in a table is positioned properly", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let label = new Plottable.Components.Label("X");
    let t = new Plottable.Components.Table().add(label, 0, 0)
                                 .add(new Plottable.Component(), 1, 0);
    t.renderTo(svg);
    let textTranslate = d3.transform((<any> label)._content.select("g").attr("transform")).translate;
    let eleTranslate = d3.transform((<any> label)._element.attr("transform")).translate;
    let textWidth = Plottable.Utils.DOM.elementBBox((<any> label)._content.select("text")).width;
    assert.closeTo(eleTranslate[0] + textTranslate[0] + textWidth / 2, 200, 5, "label is centered");
    svg.remove();
  });

  it("if a label text is changed to empty string, width updates to 0", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let label = new Plottable.Components.TitleLabel("foo");
    label.renderTo(svg);
    label.text("");
    assert.strictEqual(label.width(), 0, "width updated to 0");
    svg.remove();
  });

  it("Label angle can be changed after label is created", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let label = new Plottable.Components.AxisLabel("CHANGING ORIENTATION");
    label.renderTo(svg);

    let content = (<any> label)._content;
    let text = content.select("text");
    let bbox = Plottable.Utils.DOM.elementBBox(text);
    assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");

    label.angle(90);
    text = content.select("text");
    bbox = Plottable.Utils.DOM.elementBBox(text);
    TestMethods.assertBBoxInclusion((<any> label)._element.select(".bounding-box"), text);
    assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");

    svg.remove();
  });

  it("padding reacts well under align", () => {
    let svg = TestMethods.generateSVG(400, 200);
    let testLabel = new Plottable.Components.Label("testing label").padding(30).xAlignment("left");
    let longLabel = new Plottable.Components.Label("LONG LABELLLLLLLLLLLLLLLLL").xAlignment("left");
    let topLabel = new Plottable.Components.Label("label").yAlignment("bottom");
    new Plottable.Components.Table([[topLabel], [testLabel], [longLabel]]).renderTo(svg);

    let testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    let longTextRect = (<any> longLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.left, longTextRect.left + 30, 2, "left difference by padding amount");

    testLabel.xAlignment("right");

    testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    longTextRect = (<any> longLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.right, longTextRect.right - 30, 2, "right difference by padding amount");

    testLabel.yAlignment("bottom");

    testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    longTextRect = (<any> longLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.bottom, longTextRect.top - 30, 2, "vertical difference by padding amount");

    testLabel.yAlignment("top");

    testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    let topTextRect = (<any> topLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.top, topTextRect.bottom + 30, 2, "vertical difference by padding amount");
    svg.remove();
  });

  it("padding puts space around the label", () => {
    let svg = TestMethods.generateSVG(400, 200);
    let testLabel = new Plottable.Components.Label("testing label").padding(30);
    testLabel.renderTo(svg);

    let measurer = new SVGTypewriter.Measurers.Measurer(svg);
    let measure = measurer.measure("testing label");
    assert.operator(testLabel.width(), ">", measure.width, "padding increases size of the component");
    assert.operator(testLabel.width(), "<=", measure.width + 2 * testLabel.padding(), "width at most incorporates full padding amount");
    assert.operator(testLabel.height(), ">", measure.height, "padding increases size of the component");
    assert.operator(testLabel.height(), ">=", measure.height + 2 * testLabel.padding(), "height at most incorporates full padding amount");
    svg.remove();
  });

  it("negative padding throws an error", () => {
    let testLabel = new Plottable.Components.Label("testing label");
    assert.throws(() => testLabel.padding(-10), Error, "Cannot be less than 0");
  });
});
