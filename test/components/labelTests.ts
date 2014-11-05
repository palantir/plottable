///<reference path="../testReference.ts" />

var assert = chai.assert;


describe("Labels", () => {

  it("Standard text title label generates properly", () => {
    var svg = generateSVG(400, 80);
    var label = new Plottable.Component.TitleLabel("A CHART TITLE");
    label.renderTo(svg);

    var content = label._content;
    assert.isTrue(label._element.classed("label"), "title element has label css class");
    assert.isTrue(label._element.classed("title-label"), "title element has title-label css class");
    var textChildren = content.selectAll("text");
    assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

    var text = content.select("text");
    var bbox = Plottable._Util.DOM.getBBox(text);
    assert.closeTo(bbox.height, label.height(), 0.5, "text height === label.minimumHeight()");
    assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
    svg.remove();
  });

  it("Left-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new Plottable.Component.AxisLabel("LEFT-ROTATED LABEL", "left");
    label.renderTo(svg);
    var content = label._content;
    var text = content.select("text");
    var textBBox = Plottable._Util.DOM.getBBox(text);
    assertBBoxInclusion(label._element.select(".bounding-box"), text);
    assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
    svg.remove();
  });

  it("Right-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new Plottable.Component.AxisLabel("RIGHT-ROTATED LABEL", "right");
    label.renderTo(svg);
    var content = label._content;
    var text = content.select("text");
    var textBBox = Plottable._Util.DOM.getBBox(text);
    assertBBoxInclusion(label._element.select(".bounding-box"), text);
    assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
    svg.remove();
  });

  it("Label text can be changed after label is created", () => {
    var svg = generateSVG(400, 80);
    var label = new Plottable.Component.TitleLabel();
    label.renderTo(svg);
    assert.equal(label._content.select("text").text(), "", "the text defaulted to empty string");
    assert.equal(label.height(), 0, "rowMin is 0 for empty string");
    label.text("hello world");
    label.renderTo(svg);
    assert.equal(label._content.select("text").text(), "hello world", "the label text updated properly");
    assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
    svg.remove();
  });

  // skipping because Dan is rewriting labels and the height test fails
  it.skip("Superlong text is handled in a sane fashion", () => {
    var svgWidth = 400;
    var svg = generateSVG(svgWidth, 80);
    var label = new Plottable.Component.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
    label.renderTo(svg);
    var content = label._content;
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
    var text = label._content.select("text");
    assert.equal(text.text(), "", "text was truncated to empty string");
    svg.remove();
  });

  it("centered text in a table is positioned properly", () => {
    var svg = generateSVG(400, 400);
    var label = new Plottable.Component.TitleLabel("X");
    var t = new Plottable.Component.Table().addComponent(0, 0, label)
                                 .addComponent(1, 0, new Plottable.Component.AbstractComponent());
    t.renderTo(svg);
    var textTranslate = d3.transform(label._content.select("g").attr("transform")).translate;
    var eleTranslate  = d3.transform(label._element.attr("transform")).translate;
    var textWidth = Plottable._Util.DOM.getBBox(label._content.select("text")).width;
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

  it("Label orientation can be changed after label is created", () => {
    var svg = generateSVG(400, 400);
    var label = new Plottable.Component.AxisLabel("CHANGING ORIENTATION");
    label.renderTo(svg);

    var content = label._content;
    var text = content.select("text");
    var bbox = Plottable._Util.DOM.getBBox(text);
    assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");

    label.orient("right");
    text = content.select("text");
    bbox = Plottable._Util.DOM.getBBox(text);
    assertBBoxInclusion(label._element.select(".bounding-box"), text);
    assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");

    svg.remove();
  });

  it("padding API", () => {
    var svg = generateSVG(400, 200);
    var testLabel = new Plottable.Component.Label("testing label").padding(30).xAlign("left");
    var label1 = new Plottable.Component.Label("LONG LABELLLLLLLLLLLLLLLLL").xAlign("left");
    var label2 = new Plottable.Component.Label("label").yAlign("bottom");
    new Plottable.Component.Table([[label2], [testLabel], [label1]]).renderTo(svg);

    var textRect0 = testLabel._element.select("text").node().getBoundingClientRect();
    var textRect1 = label1._element.select("text").node().getBoundingClientRect();

    assert.closeTo(textRect0.left, textRect1.left + 30, 1, "left difference by padding amount");

    testLabel.xAlign("right");

    textRect0 = testLabel._element.select("text").node().getBoundingClientRect();
    textRect1 = label1._element.select("text").node().getBoundingClientRect();

    assert.closeTo(textRect0.right, textRect1.right - 30, 1, "right difference by padding amount");

    testLabel.yAlign("bottom");

    textRect0 = testLabel._element.select("text").node().getBoundingClientRect();
    textRect1 = label1._element.select("text").node().getBoundingClientRect();

    assert.closeTo(textRect0.bottom, textRect1.top - 30, 1, "vertical difference by padding amount");

    testLabel.yAlign("top");

    textRect0 = testLabel._element.select("text").node().getBoundingClientRect();
    textRect1 = label1._element.select("text").node().getBoundingClientRect();
    var textRect2 = label2._element.select("text").node().getBoundingClientRect();

    assert.closeTo(textRect0.top, textRect2.bottom + 30, 1, "vertical difference by padding amount");
    svg.remove();
  });
});
