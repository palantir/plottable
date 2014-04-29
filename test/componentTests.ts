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

  describe("anchor", () => {
    it("anchoring works as expected", () => {
      c._anchor(svg);
      assert.equal(c.element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the svg");
      svg.remove();
    });

    it("you cannot anchor to non-empty elements", () => {
      svg.append("rect");
      assert.throws(() => c._anchor(svg), Error);
      svg.remove();
    });
  });

  describe("computeLayout", () => {
    it("computeLayout defaults and updates intelligently", () => {
      c._anchor(svg)._computeLayout();
      assert.equal(c.availableWidth, SVG_WIDTH, "computeLayout defaulted width to svg width");
      assert.equal(c.availableHeight, SVG_HEIGHT, "computeLayout defaulted height to svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin defaulted to 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin defaulted to 0");

      svg.attr("width", 2*SVG_WIDTH).attr("height", 2*SVG_HEIGHT);
      c._computeLayout();
      assert.equal(c.availableWidth, 2*SVG_WIDTH, "computeLayout updated width to new svg width");
      assert.equal(c.availableHeight, 2*SVG_HEIGHT, "computeLayout updated height to new svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin is still 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin is still 0");

      svg.remove();
    });

    it("computeLayout works with CSS layouts", () => {
      // Manually size parent
      var parent = d3.select(svg.node().parentNode);
      parent.style("width", "200px");
      parent.style("height", "400px");

      // Remove width/height attributes and style with CSS
      svg.attr("width", null).attr("height", null);
      svg.style("width", "50%");
      svg.style("height", "50%");

      c._anchor(svg)._computeLayout();

      assert.equal(c.availableWidth, 100, "computeLayout defaulted width to svg width");
      assert.equal(c.availableHeight, 200, "computeLayout defaulted height to svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin defaulted to 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin defaulted to 0");

      svg.style("width", "25%").style("height", "25%");

      c._computeLayout();

      assert.equal(c.availableWidth, 50, "computeLayout updated width to new svg width");
      assert.equal(c.availableHeight, 100, "computeLayout updated height to new svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin is still 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin is still 0");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      svg.remove();
    });

    it("computeLayout will not default when attached to non-root node", () => {
      var g = svg.append("g");
      c._anchor(g);
      assert.throws(() => c._computeLayout(), "null arguments");
      svg.remove();
    });

    it("computeLayout throws an error when called on un-anchored component", () => {
      assert.throws(() => c._computeLayout(), Error, "anchor must be called before computeLayout");
      svg.remove();
    });

    it("computeLayout uses its arguments apropriately", () => {
      var g = svg.append("g");
      var xOff = 10;
      var yOff = 20;
      var width = 100;
      var height = 200;
      c._anchor(g)._computeLayout(xOff, yOff, width, height);
      var translate = getTranslate(c.element);
      assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
      assert.equal(c.availableWidth, width, "the width set properly");
      assert.equal(c.availableHeight, height, "the height set propery");
      svg.remove();
    });
  });

  it("subelement containers are ordered properly", () => {
    c.renderTo(svg);
    var gs = c.element.selectAll("g");
    var g0 = d3.select(gs[0][0]);
    var g1 = d3.select(gs[0][1]);
    var g2 = d3.select(gs[0][2]);
    var g3 = d3.select(gs[0][3]);
    assert.isTrue(g0.classed("background-container"), "the first g is a background container");
    assert.isTrue(g1.classed("content"), "the second g is a content container");
    assert.isTrue(g2.classed("foreground-container"), "the third g is a foreground container");
    assert.isTrue(g3.classed("box-container"), "the fourth g is a box container");
    svg.remove();
  });

  it("fixed-width component will align to the right spot", () => {
    c.minimumHeight(100).minimumWidth(100);
    c._anchor(svg);
    c._computeLayout();
    assertComponentXY(c, 0, 0, "top-left component aligns correctly");

    c.xAlign("CENTER").yAlign("CENTER");
    c._computeLayout();
    assertComponentXY(c, 150, 100, "center component aligns correctly");

    c.xAlign("RIGHT").yAlign("BOTTOM");
    c._computeLayout();
    assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
    svg.remove();
  });

  it("components can be offset relative to their alignment, and throw errors if there is insufficient space", () => {
      c.minimumHeight(100).minimumWidth(100);
      c._anchor(svg);
      c.xOffset(20).yOffset(20);
      c._computeLayout();
      assertComponentXY(c, 20, 20, "top-left component offsets correctly");

      c.xAlign("CENTER").yAlign("CENTER");
      c._computeLayout();
      assertComponentXY(c, 170, 120, "center component offsets correctly");

      c.xAlign("RIGHT").yAlign("BOTTOM");
      c._computeLayout();
      assertComponentXY(c, 320, 220, "bottom-right component offsets correctly");

      c.xOffset(0).yOffset(0);
      c._computeLayout();
      assertComponentXY(c, 300, 200, "bottom-right component offset resets");

      c.xOffset(-20).yOffset(-30);
      c._computeLayout();
      assertComponentXY(c, 280, 170, "negative offsets work properly");

      svg.remove();
    });

  it("component defaults are as expected", () => {
    assert.equal(c.minimumHeight(), 0, "minimumHeight defaults to 0");
    assert.equal(c.minimumWidth(), 0, "minimumWidth defaults to 0");
    assert.equal((<any> c)._xAlignProportion, 0, "_xAlignProportion defaults to 0");
    assert.equal((<any> c)._yAlignProportion, 0, "_yAlignProportion defaults to 0");
    assert.equal((<any> c)._xOffset, 0, "xOffset defaults to 0");
    assert.equal((<any> c)._yOffset, 0, "yOffset defaults to 0");
    svg.remove();
  });

  it("getters and setters work as expected", () => {
    c.minimumHeight(12);
    assert.equal(c.minimumHeight(), 12, "minimumHeight setter works");
    c.minimumWidth(14);
    assert.equal(c.minimumWidth(), 14, "minimumWidth setter works");
    svg.remove();
  });

  it("clipPath works as expected", () => {
    assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
    c.clipPathEnabled = true;
    var expectedClipPathID = c._plottableID;
    c._anchor(svg)._computeLayout(0, 0, 100, 100)._render();
    var expectedClipPathURL = "url(#clipPath" + expectedClipPathID+ ")";
    assert.equal(c.element.attr("clip-path"), expectedClipPathURL, "the element has clip-path url attached");
    var clipRect = (<any> c).boxContainer.select(".clip-rect");
    assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
    assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
    svg.remove();
  });

  it("componentID works as expected", () => {
    var expectedID = (<any> Plottable.PlottableObject).nextID;
    var c1 = new Plottable.Component();
    assert.equal(c1._plottableID, expectedID, "component id on next component was as expected");
    var c2 = new Plottable.Component();
    assert.equal(c2._plottableID, expectedID+1, "future components increment appropriately");
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

    c._anchor(svg);
    assert.isUndefined((<any> c).hitBox, "no hitBox was created when there were no registered interactions");
    svg.remove();
    svg = generateSVG();

    c = new Plottable.Component();
    var i = new Plottable.Interaction(c).registerWithComponent();
    c._anchor(svg);
    verifyHitbox(c);
    svg.remove();
    svg = generateSVG();

    c = new Plottable.Component();
    c._anchor(svg);
    i = new Plottable.Interaction(c).registerWithComponent();
    verifyHitbox(c);
    svg.remove();
  });

  it("interaction registration works properly", () => {
    var hitBox1: Element = null;
    var hitBox2: Element = null;
    var interaction1: any = {_anchor: (hb) => hitBox1 = hb.node()};
    var interaction2: any = {_anchor: (hb) => hitBox2 = hb.node()};
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

    c._anchor(svg);
    assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
    assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));
    assert.isFalse(c.classed("CSS-POSTANCHOR"));
    c.classed("CSS-POSTANCHOR", true);
    assert.isTrue(c.classed("CSS-POSTANCHOR"));
    c.classed("CSS-POSTANCHOR", false);
    assert.isFalse(c.classed("CSS-POSTANCHOR"));
    assert.isFalse(c.classed(undefined), "returns false when classed called w/ undefined");
    assert.equal(c.classed(undefined, true), c, "returns this when classed called w/ undefined and true");
    svg.remove();
  });

  it("remove works as expected", () => {
    var cbCalled = 0;
    var cb = (b: Plottable.Broadcaster) => cbCalled++;
    var b = new Plottable.Broadcaster();

    var t = new Plottable.Table();
    var c1 = new Plottable.Component();
    var c2 = new Plottable.Component();
    var c3 = new Plottable.Component();

    t._registerToBroadcaster(b, cb);
    c1._registerToBroadcaster(b, cb);
    c2._registerToBroadcaster(b, cb);
    c3._registerToBroadcaster(b, cb);

    var cg = c2.merge(c3);
    t.addComponent(0, 0, c1);
    t.addComponent(1, 0, cg);
    t.renderTo(svg);
    b._broadcast();
    assert.equal(cbCalled, 4, "the callback was called 4 times");
    assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
    t.remove();
    b._broadcast();
    assert.equal(cbCalled, 4, "the callback was not called again");
    assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");

    assert.throws(() => t.renderTo(svg), Error);
    svg.remove();
  });
});
