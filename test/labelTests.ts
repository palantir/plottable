///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Labels", () => {

  it("Standard text title label generates properly", () => {
    var svg = d3.select("body").append("svg:svg");
    var label = new TitleLabel("A CHART TITLE");
    label.anchor(svg);
    label.computeLayout(0, 0, 400, 400);

    var element = label.element;
    assert.isTrue(label.element.classed("label"), "title element has label css class");
    assert.isTrue(label.element.classed("title-label"), "title element has title-label css class");
    var textChildren = element.selectAll("text");
    assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

    var text = element.select("text");
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.width,  label.colMinimum(), "text width === label.colMinimum()");
    assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
    assert.equal(0, label.colWeight(), "label.colWeight is 0");
    assert.equal(0, label.rowWeight(), "label.rowWeight is 0");
    assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
    svg.remove();
  });

  it("Italicized text is handled properly", () => {
    var svg = d3.select("body").append("svg:svg");
    var label = new TitleLabel("A CHART TITLE");
    label.anchor(svg);
    var element = label.element;
    var text = element.select("text");
    text.style("font-style", "italic");
    (<any> label).setMinimumsByCalculatingTextSize(); // <any> to access private method
    label.computeLayout(0, 0, 400, 400);
    label.render();
    var bbox = Utils.getBBox(text);
    assert.operator(bbox.width, "<", label.colMinimum(), "text width is less than the col minimum (to account for italicized overhang)");
    assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
    svg.remove();
    });

  it("Rotated text is handled properly", () => {
    var svg = d3.select("body").append("svg:svg");
    var label = new AxisLabel("LEFT-ROTATED LABEL", "vertical-left");
    label.anchor(svg);
    var element = label.element;
    var text = element.select("text");
    label.computeLayout(0, 0, 400, 400);
    label.render();
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.width,  label.rowMinimum(), "text width === label.rowMinimum() (its rotated)");
    assert.equal(bbox.height, label.colMinimum(), "text height === label.colMinimum() (its rotated)");
    assert.equal(text.attr("transform"), "rotate(-90)", "the text element is rotated -90 degrees");
    svg.remove();
    });

  it("Superlong text is handled in a sane fashion", () => {
    var svgWidth = 400;
    var svg = d3.select("body").append("svg:svg");
    var label = new TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
    label.anchor(svg);
    var element = label.element;
    var text = element.select("text");
    label.computeLayout(0, 0, svgWidth, 400);
    label.render();
    var bbox = Utils.getBBox(text);
    assert.equal(bbox.width,  label.colMinimum(), "text width === label.colMinimum()");
    assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
    assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
    assert.equal(text.attr("transform"), "rotate(-90)", "the text element is rotated -90 degrees");
    svg.remove();
    });

  it("Labels with different font sizes have different space requirements", () => {
    var svg = d3.select("body").append("svg:svg");
    var label = new TitleLabel("A CHART TITLE");
    label.anchor(svg);
    label.element.select("text").style("font-size", "18pt");
    (<any> label).setMinimumsByCalculatingTextSize();
    var originalWidth = label.colMinimum();
    label.element.select("text").style("font-size", "6pt");
    (<any> label).setMinimumsByCalculatingTextSize();
    var newWidth = label.colMinimum();
    assert.operator(newWidth, "<", originalWidth, "Smaller font size implies smaller label width");

    svg.remove();
    });

  it("Label text can be changed after label is created", () => {
    var svg = d3.select("body").append("svg:svg");
    var label = new TitleLabel();
    label.anchor(svg);
    var textEl = label.element.select("text");
    assert.equal(textEl.text(), "", "the text defaulted to empty string when constructor was called w/o arguments");
    assert.equal(label.rowMinimum(), 0, "rowMin is 0 for empty string");
    assert.equal(label.colMinimum(), 0, "colMin is 0 for empty string");
    label.setText("hello world");
    assert.equal(textEl.text(), "hello world", "the label text updated properly");
    assert.operator(label.rowMinimum(), ">", 0, "rowMin is > 0 for non-empty string");
    assert.operator(label.colMinimum(), ">", 0, "colMin is > 0 for non-empty string");
    svg.remove();
    });
});
