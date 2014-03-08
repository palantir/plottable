///<reference path="testReference.ts" />

var assert = chai.assert;

function assertComponentXY(component: Plottable.Component, x: number, y: number, message: string) {
  // use <any> to examine the private variables
  var translate = d3.transform(component.element.attr("transform")).translate;
  var xActual = translate[0];
  var yActual = translate[1];
  assert.equal(xActual, x, "X: " + message);
  assert.equal(yActual, y, "Y: " + message);
}

describe("Component behavior", () => {
  var svg: D3.Selection;
  var c: Plottable.Component;
  var SVG_WIDTH = 400;
  var SVG_HEIGHT = 300;
  beforeEach(() => {
    svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    c = new Plottable.Component();
  });

  it.skip("renderTo works properly", () => {
    var anchored = false;
    var computed = false;
    var rendered = false;
    var oldAnchor = c.anchor.bind(c);
    var oldCompute = c.computeLayout.bind(c);
    var oldRender = c.render.bind(c);
    c.anchor = (el) => {
      oldAnchor(el);
      anchored = true;
      return c;
    };
    c.computeLayout = (x?, y?, w?, h?) => {
      oldCompute(x, y, w, h);
      computed = true;
      return c;
    };
    c.render = () => {
      oldRender();
      rendered = true;
      return c;
    };
    c.renderTo(svg);
    assert.isTrue(anchored, "anchor was called");
    assert.isTrue(computed, "computeLayout was called");
    assert.isTrue(rendered, "render was called");
    anchored = false;
    computed = false;
    rendered = true;
    c.renderTo(svg);
    assert.isFalse(anchored, "anchor was not called a second time");
    assert.isTrue(computed, "computeLayout was called a second time");
    assert.isTrue(rendered, "render was called a second time");
    var svg2 = generateSVG();
    assert.throws(() => c.renderTo(svg2), Error, "different element");
    svg.remove();
    svg2.remove();
  });

  describe("anchor", () => {
    it("anchoring works as expected", () => {
      c.anchor(svg);
      assert.equal(c.element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the svg");
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
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin defaulted to 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin defaulted to 0");
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

  it("subelement containers are ordered properly", () => {
    c.renderTo(svg);
    c.element.append("g").classed("foo", true);
    var gs = c.element.selectAll("g");
    var g0 = d3.select(gs[0][0]);
    var g1 = d3.select(gs[0][1]);
    var g2 = d3.select(gs[0][2]);
    assert.isTrue(g0.classed("box-container"), "the first g is a box container");
    assert.isTrue(g1.classed("foreground-container"), "the second g is a foreground container");
    assert.isTrue(g2.classed("foo"), "the third g is the foo we appended");
    svg.remove();
  });

  it("fixed-width component will align to the right spot", () => {
    c.rowMinimum(100).colMinimum(100);
    c.anchor(svg);
    c.computeLayout();
    assertComponentXY(c, 0, 0, "top-left component aligns correctly");

    c.xAlign("CENTER").yAlign("CENTER");
    c.computeLayout();
    assertComponentXY(c, 150, 100, "center component aligns correctly");

    c.xAlign("RIGHT").yAlign("BOTTOM");
    c.computeLayout();
    assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
    svg.remove();
  });

  it("components can be offset relative to their alignment, and throw errors if there is insufficient space", () => {
      c.rowMinimum(100).colMinimum(100);
      c.anchor(svg);
      c.xOffset(20).yOffset(20);
      c.computeLayout();
      assertComponentXY(c, 20, 20, "top-left component offsets correctly");

      c.xAlign("CENTER").yAlign("CENTER");
      c.computeLayout();
      assertComponentXY(c, 170, 120, "center component offsets correctly");

      c.xAlign("RIGHT").yAlign("BOTTOM");
      c.computeLayout();
      assertComponentXY(c, 320, 220, "bottom-right component offsets correctly");

      c.xOffset(0).yOffset(0);
      c.computeLayout();
      assertComponentXY(c, 300, 200, "bottom-right component offset resets");

      c.xOffset(-20).yOffset(-30);
      c.computeLayout();
      assertComponentXY(c, 280, 170, "negative offsets work properly");

      svg.remove();
    });


  it("component defaults are as expected", () => {
    assert.equal(c.rowMinimum(), 0, "rowMinimum defaults to 0");
    assert.equal(c.colMinimum(), 0, "colMinimum defaults to 0");
    assert.equal((<any> c).xAlignProportion, 0, "xAlignProportion defaults to 0");
    assert.equal((<any> c).yAlignProportion, 0, "yAlignProportion defaults to 0");
    assert.equal((<any> c).xOffsetVal, 0, "xOffset defaults to 0");
    assert.equal((<any> c).yOffsetVal, 0, "yOffset defaults to 0");
    svg.remove();
  });

  it("getters and setters work as expected", () => {
    c.rowMinimum(12);
    assert.equal(c.rowMinimum(), 12, "rowMinimum setter works");
    c.colMinimum(14);
    assert.equal(c.colMinimum(), 14, "colMinimum setter works");
    svg.remove();
  });

  it("clipPath works as expected", () => {
    assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
    c.clipPathEnabled = true;
    var expectedClipPathID: number = (<any> Plottable.Component).clipPathId;
    c.anchor(svg).computeLayout(0, 0, 100, 100).render();
    assert.equal((<any> Plottable.Component).clipPathId, expectedClipPathID+1, "clipPathId incremented");
    var expectedClipPathURL = "url(#clipPath" + expectedClipPathID+ ")";
    assert.equal(c.element.attr("clip-path"), expectedClipPathURL, "the element has clip-path url attached");
    var clipRect = (<any> c).boxContainer.select(".clip-rect");
    assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
    assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
    svg.remove();
  });

  it("boxes work as expected", () => {
    assert.throws(() => (<any> c).addBox("pre-anchor"), Error, "Adding boxes before anchoring is currently disallowed");
    c.renderTo(svg);
    (<any> c).addBox("post-anchor");
    var e = c.element;
    var boxContainer = e.select(".box-container");
    var boxStrings = [".bounding-box", ".post-anchor"];

    boxStrings.forEach((s) => {
      var box = boxContainer.select(s);
      assert.isNotNull(box.node(), s + " box was created and placed inside boxContainer");
      var bb = Plottable.Utils.getBBox(box);
      assert.equal(bb.width, SVG_WIDTH, s + " width as expected");
      assert.equal(bb.height, SVG_HEIGHT, s + " height as expected");
    });
    svg.remove();
  });

  it("hitboxes are created iff there are registered interactions", () => {
    function verifyHitbox(component: Plottable.Component) {
      var hitBox = (<any> component).hitBox;
      assert.isNotNull(hitBox, "the hitbox was created");
      var hitBoxFill = hitBox.style("fill");
      var hitBoxFilled = hitBoxFill === "#ffffff" || hitBoxFill === "rgb(255, 255, 255)";
      assert.isTrue(hitBoxFilled, hitBoxFill + " <- this should be filled, so the hitbox will detect events");
      assert.equal(hitBox.style("opacity"), "0", "the hitBox is transparent, otherwise it would look weird");
    }

    c.anchor(svg);
    assert.isUndefined((<any> c).hitBox, "no hitBox was created when there were no registered interactions");
    svg.remove();
    svg = generateSVG();

    c = new Plottable.Component();
    var i = new Plottable.Interaction(c).registerWithComponent();
    c.anchor(svg);
    verifyHitbox(c);
    svg.remove();
    svg = generateSVG();

    c = new Plottable.Component();
    c.anchor(svg);
    i = new Plottable.Interaction(c).registerWithComponent();
    verifyHitbox(c);
    svg.remove();
  });

  it("interaction registration works properly", () => {
    var hitBox1: Element = null;
    var hitBox2: Element = null;
    var interaction1: any = {anchor: (hb) => hitBox1 = hb.node()};
    var interaction2: any = {anchor: (hb) => hitBox2 = hb.node()};
    c.registerInteraction(interaction1);
    c.renderTo(svg);
    c.registerInteraction(interaction2);
    var hitNode = (<any> c).hitBox.node();
    assert.equal(hitBox1, hitNode, "hitBox1 was registerd");
    assert.equal(hitBox2, hitNode, "hitBox2 was registerd");
    svg.remove();
  });

  it("errors are thrown on bad alignments", () => {
    assert.throws(() => c.xAlign("foo"), Error, "Unsupported alignment");
    assert.throws(() => c.yAlign("foo"), Error, "Unsupported alignment");
    svg.remove();
  });

  it("css classing works as expected", () => {
    assert.isFalse(c.classed("CSS-PREANCHOR-KEEP"));
    c.classed("CSS-PREANCHOR-KEEP", true);
    assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
    c.classed("CSS-PREANCHOR-REMOVE", true);
    assert.isTrue(c.classed("CSS-PREANCHOR-REMOVE"));
    c.classed("CSS-PREANCHOR-REMOVE", false);
    assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));

    c.anchor(svg);
    assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
    assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));
    assert.isFalse(c.classed("CSS-POSTANCHOR"));
    c.classed("CSS-POSTANCHOR", true);
    assert.isTrue(c.classed("CSS-POSTANCHOR"));
    c.classed("CSS-POSTANCHOR", false);
    assert.isFalse(c.classed("CSS-POSTANCHOR"));
    svg.remove();
  });
});
