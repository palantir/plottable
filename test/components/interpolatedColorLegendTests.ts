///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("InterpolatedColorLegend", () => {
  var svg: D3.Selection;
  var colorScale: Plottable.Scale.InterpolatedColor;

  beforeEach(() => {
    svg = generateSVG(400, 400);
    colorScale = new Plottable.Scale.InterpolatedColor();
  });

  function assertBasicRendering(legend: Plottable.Component.InterpolatedColorLegend) {
    var scaleDomain = colorScale.domain();
    var legendElement: D3.Selection = (<any> legend)._element;

    var swatches = legendElement.selectAll(".swatch");
    assert.strictEqual(d3.select(swatches[0][0]).attr("fill"),
                       colorScale.scale(scaleDomain[0]),
                       "first swatch's color corresponds with first domain value");
    assert.strictEqual(d3.select(swatches[0][swatches[0].length - 1]).attr("fill"),
                       colorScale.scale(scaleDomain[1]),
                       "last swatch's color corresponds with second domain value");

    var swatchContainer = legendElement.select(".swatch-container");
    var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();
    var swatchBoundingBox = legendElement.select(".swatch-bounding-box");
    var boundingBoxBCR = swatchBoundingBox.node().getBoundingClientRect();
    assert.isTrue(Plottable._Util.DOM.boxIsInside(swatchContainerBCR, boundingBoxBCR),
                  "bounding box contains all swatches");

    var elementBCR = legendElement.node().getBoundingClientRect();
    assert.isTrue(Plottable._Util.DOM.boxIsInside(swatchContainerBCR, elementBCR),
                  "swatches are drawn within the legend's element");

    var formattedDomainValues = scaleDomain.map((<any> legend)._formatter);
    var labels = legendElement.selectAll("text");
    var labelTexts = labels[0].map((textNode: HTMLScriptElement) => textNode.textContent);
    assert.deepEqual(labelTexts, formattedDomainValues, "formatter is used to format label text");
  }

  it("renders correctly (orientation: horizontal)", () => {
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "horizontal");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    var legendElement: D3.Selection = (<any> legend)._element;
    var labels = legendElement.selectAll("text");
    var swatchContainer = legendElement.select(".swatch-container");
    var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();

    var lowerLabelBCR = labels[0][0].getBoundingClientRect();
    var upperLabelBCR = labels[0][1].getBoundingClientRect();
    assert.operator(lowerLabelBCR.right, "<=", swatchContainerBCR.left, "first label to left of swatches");
    assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");

    svg.remove();
  });

  it("renders correctly (orientation: right)", () => {
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "right");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    var legendElement: D3.Selection = (<any> legend)._element;
    var labels = legendElement.selectAll("text");
    var swatchContainer = legendElement.select(".swatch-container");
    var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();

    var lowerLabelBCR = labels[0][0].getBoundingClientRect();
    var upperLabelBCR = labels[0][1].getBoundingClientRect();
    assert.operator(swatchContainerBCR.right, "<=", lowerLabelBCR.left, "first label to right of swatches");
    assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");
    assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

    svg.remove();
  });

  it("renders correctly (orientation: left)", () => {
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "left");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    var legendElement: D3.Selection = (<any> legend)._element;
    var labels = legendElement.selectAll("text");
    var swatchContainer = legendElement.select(".swatch-container");
    var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();

    var lowerLabelBCR = labels[0][0].getBoundingClientRect();
    var upperLabelBCR = labels[0][1].getBoundingClientRect();
    assert.operator(lowerLabelBCR.left, "<=", swatchContainerBCR.left, "first label to left of swatches");
    assert.operator(upperLabelBCR.left, "<=", swatchContainerBCR.left, "second label to left of swatches");
    assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

    svg.remove();
  });

  it("re-renders when scale domain updates", () => {
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "horizontal");
    legend.renderTo(svg);

    colorScale.domain([0, 85]);
    assertBasicRendering(legend);

    svg.remove();
  });

  it("orient() input-checking", () => {
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "horizontal");

    legend.orient("horizontal"); // should work
    legend.orient("right"); // should work
    legend.orient("left"); // should work

    assert.throws(() => legend.orient("blargh"), "not a valid orientation");
    svg.remove();
  });

  it("orient() triggers layout computation", () => {
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "horizontal");
    legend.renderTo(svg);

    var widthBefore = legend.width();
    var heightBefore = legend.height();

    legend.orient("right");
    assert.notEqual(legend.width(), widthBefore, "proportions changed (width)");
    assert.notEqual(legend.height(), heightBefore, "proportions changed (height)");
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: horizontal)", () => {
    svg.attr("width", 100);
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "horizontal");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: horizontal)", () => {
    svg.attr("height", 20);
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "horizontal");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: right)", () => {
    svg.attr("width", 30);
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "right");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: right)", () => {
    svg.attr("height", 100);
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "right");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: left)", () => {
    svg.attr("width", 30);
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "left");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: left)", () => {
    svg.attr("height", 100);
    var legend = new Plottable.Component.InterpolatedColorLegend(colorScale, "left");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });
});
