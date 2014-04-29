///<reference path="testReference.ts" />

var assert = chai.assert;


describe("Labels", () => {

  it("Standard text title label generates properly", () => {
    var svg = generateSVG(400, 80);
    var label = new Plottable.TitleLabel("A CHART TITLE");
    label._anchor(svg);
    label._computeLayout();

    var content = label.content;
    assert.isTrue(label.element.classed("label"), "title element has label css class");
    assert.isTrue(label.element.classed("title-label"), "title element has title-label css class");
    var textChildren = content.selectAll("text");
    assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

    var text = content.select("text");
    var bbox = Plottable.Utils.getBBox(text);
    assert.equal(bbox.height, label.minimumHeight(), "text height === label.minimumHeight()");
    assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
    svg.remove();
  });

  it("Left-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new Plottable.AxisLabel("LEFT-ROTATED LABEL", "vertical-left");
    label._anchor(svg);
    var content = label.content;
    var text = content.select("text");
    label._computeLayout();
    label._render();
    var textBBox = Plottable.Utils.getBBox(text);
    assertBBoxInclusion(label.element.select(".bounding-box"), text);
    assert.equal(textBBox.height, label.minimumWidth(), "text height === label.minimumWidth() (it's rotated)");
    assert.equal(text.attr("transform"), "rotate(-90)", "the text element is rotated -90 degrees");
    svg.remove();
  });

  it("Right-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new Plottable.AxisLabel("RIGHT-ROTATED LABEL", "vertical-right");
    label._anchor(svg);
    var content = label.content;
    var text = content.select("text");
    label._computeLayout();
    label._render();
    var textBBox = Plottable.Utils.getBBox(text);
    assertBBoxInclusion(label.element.select(".bounding-box"), text);
    assert.equal(textBBox.height, label.minimumWidth(), "text height === label.minimumWidth() (it's rotated)");
    assert.equal(text.attr("transform"), "rotate(90)", "the text element is rotated 90 degrees");
    svg.remove();
  });

  it("Label text can be changed after label is created", () => {
    var svg = generateSVG(400, 80);
    var label = new Plottable.TitleLabel();
    label._anchor(svg);
    var textEl = label.content.select("text");
    assert.equal(textEl.text(), "", "the text defaulted to empty string when constructor was called w/o arguments");
    assert.equal(label.minimumHeight(), 0, "rowMin is 0 for empty string");
    label.setText("hello world");
    assert.equal(textEl.text(), "hello world", "the label text updated properly");
    assert.operator(label.minimumHeight(), ">", 0, "rowMin is > 0 for non-empty string");
    svg.remove();
  });

  it("Superlong text is handled in a sane fashion", () => {
    var svgWidth = 400;
    var svg = generateSVG(svgWidth, 80);
    var label = new Plottable.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
    label._anchor(svg);
    var content = label.content;
    var text = content.select("text");
    label._computeLayout();
    label._render();
    var bbox = Plottable.Utils.getBBox(text);
    assert.equal(bbox.height, label.minimumHeight(), "text height === label.minimumHeight()");
    assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
    svg.remove();
  });

  it("text in a tiny box is truncated to empty string", () => {
    var svg = generateSVG(10, 10);
    var label = new Plottable.TitleLabel("Yeah, not gonna fit...");
    label.renderTo(svg);
    var text = label.content.select("text");
    assert.equal(text.text(), "", "text was truncated to empty string");
    svg.remove();
  });

  it("centered text in a table is positioned properly", () => {
    var svg = generateSVG(400, 400);
    var label = new Plottable.TitleLabel(".");
    var t = new Plottable.Table().addComponent(0, 0, label);
    t.renderTo(svg);
    var textElement = svg.select("text");
    var textX = parseFloat(textElement.attr("x"));
    var eleTranslate  = d3.transform(label.element.attr("transform")).translate;
    assert.closeTo(eleTranslate[0] + textX, 200, 10, "label is centered");
    svg.remove();
  });

  it("unsupported alignments and orientations are unsupported", () => {
    assert.throws(() => new Plottable.Label("foo", "bar"), Error, "not a valid orientation");
  });
});
