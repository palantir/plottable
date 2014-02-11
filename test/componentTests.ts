///<reference path="testReference.ts" />

var assert = chai.assert;

function assertComponentXY(component: Component, x: number, y: number, message: string) {
  // use <any> to examine the private variables
  var xOffset = (<any> component).xOffset;
  var yOffset = (<any> component).yOffset;
  assert.equal(xOffset, x, "X: " + message);
  assert.equal(yOffset, y, "Y: " + message);
}

describe("Component behavior", () => {
  var svg: D3.Selection;
  var c: Component;
  var SVG_WIDTH = 400;
  var SVG_HEIGHT = 300;
  beforeEach(() => {
    svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    c = new Component();
  });

  describe("anchor", () => {
    it("anchoring works as expected", () => {
      c.anchor(svg);
      assert.equal(c.element, svg, "the component anchored to the svg");
      svg.remove();
    });

    it("you cannot anchor to non-empty elements", () => {
      svg.append("rect");
      assert.throws(() => c.anchor(svg), Error);
      svg.remove();
    });
  });

  describe("computeLayout", () => {
    it("computeLayout defaults intelligently", () => {
      c.anchor(svg).computeLayout();
      assert.equal(c.availableWidth, SVG_WIDTH, "computeLayout defaulted width to svg width");
      assert.equal(c.availableHeight, SVG_HEIGHT, "computeLayout defaulted height to svg height");
      assert.equal((<any> c).xOffset, 0 ,"xOffset defaulted to 0");
      assert.equal((<any> c).yOffset, 0 ,"yOffset defaulted to 0");
      svg.remove();
    });

    it("computeLayout will not default when attached to non-root node", () => {
      var g = svg.append("g");
      c.anchor(g);
      assert.throws(() => c.computeLayout(), "null arguments");
      svg.remove();
    });

    it("computeLayout throws an error when called on un-anchored component", () => {
      assert.throws(() => c.computeLayout(), Error, "anchor must be called before computeLayout");
      svg.remove();
    });

    it("computeLayout uses its arguments apropriately", () => {
      var g = svg.append("g");
      var xOff = 10;
      var yOff = 20;
      var width = 100;
      var height = 200;
      c.anchor(g).computeLayout(xOff, yOff, width, height);
      var translate = getTranslate(c.element);
      assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
      assert.equal(c.availableWidth, width, "the width set properly");
      assert.equal(c.availableHeight, height, "the height set propery");
      svg.remove();
    });
  });

  it("fixed-width component will align to the right spot", () => {
    c.rowMinimum(100).colMinimum(100);
    c.anchor(svg);
    c.computeLayout();
    assertComponentXY(c, 0, 0, "top-left component aligns correctly");

    c.xAlignment = "CENTER";
    c.yAlignment = "CENTER";
    c.computeLayout();
    assertComponentXY(c, 150, 100, "center component aligns correctly");

    c.xAlignment = "RIGHT";
    c.yAlignment = "BOTTOM";
    c.computeLayout();
    assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
    svg.remove();
  });

  it("component defaults are as expected", () => {
    assert.equal(c.rowMinimum(), 0, "rowMinimum defaults to 0");
    assert.equal(c.colMinimum(), 0, "colMinimum defaults to 0");
    assert.equal(c.rowWeight() , 0, "rowWeight  defaults to 0");
    assert.equal(c.colWeight() , 0, "colWeight  defaults to 0");
    assert.equal(c.xAlignment, "LEFT", "xAlignment defaults to LEFT");
    assert.equal(c.yAlignment, "TOP" , "yAlignment defaults to TOP");
    svg.remove();
  });

  it("getters and setters work as expected", () => {
    c.rowMinimum(12);
    assert.equal(c.rowMinimum(), 12, "rowMinimum setter works");
    c.colMinimum(14);
    assert.equal(c.colMinimum(), 14, "colMinimum setter works");
    c.rowWeight(16);
    assert.equal(c.rowWeight(), 16, "rowWeight setter works");
    c.colWeight(18);
    assert.equal(c.colWeight(), 18, "colWeight setter works");
    svg.remove();
  });

  it("clipPath works as expected", () => {
    assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
    c.clipPathEnabled = true;
    c.anchor(svg).computeLayout(0, 0, 100, 100).render();
    assert.equal((<any> Component).clipPathId, 1, "clipPathId incremented");
    assert.equal(c.element.attr("clip-path"), "url(#clipPath0)", "the element has clip-path url attached");
    var clipRect = c.element.select(".clip-rect");
    assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
    assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
    svg.remove();
  });

  it("boxes work as expected", () => {
    assert.throws(() => (<any> c).addBox("pre-anchor"), Error, "Adding boxes before anchoring is currently disallowed");
    c.anchor(svg).computeLayout().render();
    (<any> c).addBox("post-anchor");
    var e = c.element;
    var boxStrings = [".hit-box", ".bounding-box", ".post-anchor"];

    boxStrings.forEach((s) => {
      var box = e.select(s);
      assert.isNotNull(box.node(), s + " box was created");
      var bb = Utils.getBBox(box);
      assert.equal(bb.width, SVG_WIDTH, s + " width as expected");
      assert.equal(bb.height, SVG_HEIGHT, s + " height as expected");
    });

    var hitBox = (<any> c).hitBox;
    assert.equal(hitBox.style("fill"), "#ffffff", "the hitBox has a fill, ensuring that it will detect events");
    assert.equal(hitBox.style("opacity"), "0", "the hitBox is transparent, otherwise it would look weird");
    svg.remove();
  });

  it("interaction registration works properly", () => {
    var hitBox1: Element = null;
    var hitBox2: Element = null;
    var interaction1: any = {anchor: (hb) => hitBox1 = hb.node()};
    var interaction2: any = {anchor: (hb) => hitBox2 = hb.node()};
    c.registerInteraction(interaction1);
    c.anchor(svg).computeLayout().render();
    c.registerInteraction(interaction2);
    var hitNode = c.hitBox.node();
    assert.equal(hitBox1, hitNode, "hitBox1 was registerd");
    assert.equal(hitBox2, hitNode, "hitBox2 was registerd");
    svg.remove();
  });
});
