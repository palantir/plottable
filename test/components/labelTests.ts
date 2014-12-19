///<reference path="../testReference.ts" />

var assert = chai.assert;


describe("Labels", () => {

  it("Standard text title label generates properly", () => {
    var svg = generateSVG(400, 80);
    var label = new Plottable.Component.TitleLabel("A CHART TITLE");
    label.renderTo(svg);

    var content = (<any> label)._content;
    assert.isTrue((<any> label)._element.classed("label"), "title element has label css class");
    assert.isTrue((<any> label)._element.classed("title-label"), "title element has title-label css class");
    var textChildren = content.selectAll("text");
    assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

    var text = content.select("text");
    var bbox = Plottable._Util.DOM.getBBox(text);
    assert.closeTo(bbox.height, label.height(), 0.5, "text height === label.minimumHeight()");
    assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
    svg.remove();
  });

  // Skipping due to FF odd client bounding rect computation - #1470.
  it.skip("Left-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new Plottable.Component.AxisLabel("LEFT-ROTATED LABEL", "left");
    label.renderTo(svg);
    var content = (<any> label)._content;
    var text = content.select("text");
    var textBBox = Plottable._Util.DOM.getBBox(text);
    assertBBoxInclusion((<any> label)._element.select(".bounding-box"), text);
    assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
    svg.remove();
  });

  // Skipping due to FF odd client bounding rect computation - #1470.
  it.skip("Right-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new Plottable.Component.AxisLabel("RIGHT-ROTATED LABEL", "right");
    label.renderTo(svg);
    var content = (<any> label)._content;
    var text = content.select("text");
    var textBBox = Plottable._Util.DOM.getBBox(text);
    assertBBoxInclusion((<any> label)._element.select(".bounding-box"), text);
    assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
    svg.remove();
  });

  it("Label text can be changed after label is created", () => {
    var svg = generateSVG(400, 80);
    var label = new Plottable.Component.TitleLabel("a");
    label.renderTo(svg);
    assert.equal((<any> label)._content.select("text").text(), "a", "the text starts at the specified string");
    assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
    label.text("hello world");
    label.renderTo(svg);
    assert.equal((<any> label)._content.select("text").text(), "hello world", "the label text updated properly");
    assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
    svg.remove();
  });

  // skipping because Dan is rewriting labels and the height test fails
  it.skip("Superlong text is handled in a sane fashion", () => {
    var svgWidth = 400;
    var svg = generateSVG(svgWidth, 80);
    var label = new Plottable.Component.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
    label.renderTo(svg);
    var content = (<any> label)._content;
    var text = content.select("text");
    var bbox = Plottable._Util.DOM.getBBox(text);
    assert.equal(bbox.height, label.height(), "text height === label.minimumHeight()");
    assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
    svg.remove();
  });

  it("text in a tiny box is truncated to empty string", () => {
    var svg = generateSVG(10, 10);
    var label = new Plottable.Component.TitleLabel("Yeah, not gonna fit...");
    label.renderTo(svg);
    var text = (<any> label)._content.select("text");
    assert.equal(text.text(), "", "text was truncated to empty string");
    svg.remove();
  });

  it("centered text in a table is positioned properly", () => {
    var svg = generateSVG(400, 400);
    var label = new Plottable.Component.TitleLabel("X");
    var t = new Plottable.Component.Table().addComponent(0, 0, label)
                                 .addComponent(1, 0, new Plottable.Component.AbstractComponent());
    t.renderTo(svg);
    var textTranslate = d3.transform((<any> label)._content.select("g").attr("transform")).translate;
    var eleTranslate  = d3.transform((<any> label)._element.attr("transform")).translate;
    var textWidth = Plottable._Util.DOM.getBBox((<any> label)._content.select("text")).width;
    assert.closeTo(eleTranslate[0] + textTranslate[0] + textWidth / 2, 200, 5, "label is centered");
    svg.remove();
  });

  it("if a label text is changed to empty string, width updates to 0", () => {
    var svg = generateSVG(400, 400);
    var label = new Plottable.Component.TitleLabel("foo");
    label.renderTo(svg);
    label.text("");
    assert.equal(label.width(), 0, "width updated to 0");
    svg.remove();
  });

  it("unsupported alignments and orientations are unsupported", () => {
    assert.throws(() => new Plottable.Component.Label("foo", "bar"), Error, "not a valid orientation");
  });

  // Skipping due to FF odd client bounding rect computation - #1470.
  it.skip("Label orientation can be changed after label is created", () => {
    var svg = generateSVG(400, 400);
    var label = new Plottable.Component.AxisLabel("CHANGING ORIENTATION");
    label.renderTo(svg);

    var content = (<any> label)._content;
    var text = content.select("text");
    var bbox = Plottable._Util.DOM.getBBox(text);
    assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");

    label.orient("right");
    text = content.select("text");
    bbox = Plottable._Util.DOM.getBBox(text);
    assertBBoxInclusion((<any> label)._element.select(".bounding-box"), text);
    assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");

    svg.remove();
  });

  it("padding reacts well under align", () => {
    var svg = generateSVG(400, 200);
    var testLabel = new Plottable.Component.Label("testing label").padding(30).xAlign("left");
    var longLabel = new Plottable.Component.Label("LONG LABELLLLLLLLLLLLLLLLL").xAlign("left");
    var topLabel = new Plottable.Component.Label("label").yAlign("bottom");
    new Plottable.Component.Table([[topLabel], [testLabel], [longLabel]]).renderTo(svg);

    var testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    var longTextRect = (<any> longLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.left, longTextRect.left + 30, 2, "left difference by padding amount");

    testLabel.xAlign("right");

    testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    longTextRect = (<any> longLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.right, longTextRect.right - 30, 2, "right difference by padding amount");

    testLabel.yAlign("bottom");

    testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    longTextRect = (<any> longLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.bottom, longTextRect.top - 30, 2, "vertical difference by padding amount");

    testLabel.yAlign("top");

    testTextRect = (<any> testLabel)._element.select("text").node().getBoundingClientRect();
    var topTextRect = (<any> topLabel)._element.select("text").node().getBoundingClientRect();

    assert.closeTo(testTextRect.top, topTextRect.bottom + 30, 2, "vertical difference by padding amount");
    svg.remove();
  });

  it("padding puts space around the label", () => {
    var svg = generateSVG(400, 200);
    var testLabel = new Plottable.Component.Label("testing label").padding(30);
    testLabel.renderTo(svg);

    var measurer = new SVGTypewriter.Measurers.Measurer(svg);
    var measure = measurer.measure("testing label");
    assert.operator(testLabel.width(), ">", measure.width, "padding increases size of the component");
    assert.operator(testLabel.width(), "<=", measure.width + 2 * testLabel.padding(), "width at most incorporates full padding amount");
    assert.operator(testLabel.height(), ">", measure.height, "padding increases size of the component");
    assert.operator(testLabel.height(), ">=", measure.height + 2 * testLabel.padding(), "height at most incorporates full padding amount");
    svg.remove();
  });

  it("negative padding throws an error", () => {
    var testLabel = new Plottable.Component.Label("testing label");
    assert.throws(() => testLabel.padding(-10), Error, "Cannot be less than 0");
  });
});
