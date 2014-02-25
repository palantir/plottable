///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Labels", () => {

  it("Standard text title label generates properly", () => {
    var svg = generateSVG(400, 80);
    var label = new TitleLabel("A CHART TITLE");
    label.anchor(svg);
    label.computeLayout();

    var element = label.element;
    assert.isTrue(label.element.classed("label"), "title element has label css class");
    assert.isTrue(label.element.classed("title-label"), "title element has title-label css class");
    var textChildren = element.selectAll("text");
    assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

    var text = element.select("text");
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
    assert.equal(0, label.colWeight(), "label.colWeight is 0");
    assert.equal(0, label.rowWeight(), "label.rowWeight is 0");
    assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
    svg.remove();
  });

  it("Left-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new AxisLabel("LEFT-ROTATED LABEL", "vertical-left");
    label.anchor(svg);
    var element = label.element;
    var text = element.select("text");
    label.computeLayout();
    label.render();
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.height, label.colMinimum(), "text height === label.colMinimum() (it's rotated)");
    assert.equal(text.attr("transform"), "rotate(-90)", "the text element is rotated -90 degrees");
    svg.remove();
  });

  it("Right-rotated text is handled properly", () => {
    var svg = generateSVG(100, 400);
    var label = new AxisLabel("RIGHT-ROTATED LABEL", "vertical-right");
    label.anchor(svg);
    var element = label.element;
    var text = element.select("text");
    label.computeLayout();
    label.render();
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.height, label.colMinimum(), "text height === label.colMinimum() (it's rotated)");
    assert.equal(text.attr("transform"), "rotate(90)", "the text element is rotated 90 degrees");
    svg.remove();
  });

  it("Label text can be changed after label is created", () => {
    var svg = generateSVG(400, 80);
    var label = new TitleLabel();
    label.anchor(svg);
    var textEl = label.element.select("text");
    assert.equal(textEl.text(), "", "the text defaulted to empty string when constructor was called w/o arguments");
    assert.equal(label.rowMinimum(), 0, "rowMin is 0 for empty string");
    label.setText("hello world");
    assert.equal(textEl.text(), "hello world", "the label text updated properly");
    assert.operator(label.rowMinimum(), ">", 0, "rowMin is > 0 for non-empty string");
    svg.remove();
  });

  it("Superlong text is handled in a sane fashion", () => {
    var svgWidth = 400;
    var svg = generateSVG(svgWidth, 80);
    var label = new TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
    label.anchor(svg);
    var element = label.element;
    var text = element.select("text");
    label.computeLayout();
    label.render();
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
    assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
    svg.remove();
  });

  it("text in a tiny box is truncated to empty string", () => {
    var svg = generateSVG(10, 10);
    var label = new TitleLabel("Yeah, not gonna fit...");
    label.anchor(svg).computeLayout().render();
    var text = label.element.select("text");
    assert.equal(text.text(), "", "text was truncated to empty string");
    svg.remove();
  });

  it("unsupported alignments and orientations are unsupported", () => {
    assert.throws(() => new Label("foo", "bar"), Error, "not a valid orientation");
  });
});
