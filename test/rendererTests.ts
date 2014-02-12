///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Renderers", () => {
  var svg: D3.Selection;
  var SVG_WIDTH = 400;
  var SVG_HEIGHT = 300;
  beforeEach(() => {
    svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
  });

  it("Renderers default correctly", () => {
    var r = new Renderer();
    assert.equal(r.colWeight(), 1, "colWeight defaults to 1");
    assert.equal(r.rowWeight(), 1, "rowWeight defaults to 1");
    assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
    svg.remove();
  });

  it("Base renderer functionality works", () => {
    var d1 = {data: ["foo"], seriesName: "bar"};
    var r = new Renderer(d1);
    r.anchor(svg).computeLayout();
    var renderArea = r.element.select(".render-area");
    assert.isNotNull(renderArea.node(), "there is a render-area");
    assert.isTrue(renderArea.classed("bar"), "the render area is classed w/ dataset.seriesName");
    assert.deepEqual(r.dataset, d1, "the dataset is set properly");
    var d2 = {data: ["bar"], seriesName: "boo"};
    r.data(d2);
    assert.isFalse(renderArea.classed("bar"), "the renderArea is no longer classed bar");
    assert.isTrue(renderArea.classed("boo"), "the renderArea is now classed boo");
    assert.deepEqual(r.dataset, d2, "the dataset was replaced properly");
    svg.remove();
  });
});
