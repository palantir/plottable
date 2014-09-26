///<reference path="../testReference.ts" />

var assert = chai.assert;


function assertComponentXY(component: Plottable.Abstract.Component, x: number, y: number, message: string) {
  // use <any> to examine the private variables
  var translate = d3.transform(component._element.attr("transform")).translate;
  var xActual = translate[0];
  var yActual = translate[1];
  assert.equal(xActual, x, "X: " + message);
  assert.equal(yActual, y, "Y: " + message);
}

describe("Component behavior", () => {
  var svg: D3.Selection;
  var c: Plottable.Abstract.Component;
  var SVG_WIDTH = 400;
  var SVG_HEIGHT = 300;
  beforeEach(() => {
    svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    c = new Plottable.Abstract.Component();
  });

  describe("anchor", () => {
    it("anchoring works as expected", () => {
      c._anchor(svg);
      assert.equal(c._element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the <svg>");
      assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
      svg.remove();
    });

    it("can re-anchor to a different element", () => {
      c._anchor(svg);

      var svg2 = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c._anchor(svg2);
      assert.equal(c._element.node(), svg2.select("g").node(), "the component re-achored under the second <svg>");
      assert.isTrue(svg2.classed("plottable"), "second <svg> was given \"plottable\" CSS class");

      svg.remove();
      svg2.remove();
    });
  });

  describe("computeLayout", () => {
    it("computeLayout defaults and updates intelligently", () => {
      c._anchor(svg);
      c._computeLayout();
      assert.equal(c.width() , SVG_WIDTH, "computeLayout defaulted width to svg width");
      assert.equal(c.height(), SVG_HEIGHT, "computeLayout defaulted height to svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin defaulted to 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin defaulted to 0");

      svg.attr("width", 2*SVG_WIDTH).attr("height", 2*SVG_HEIGHT);
      c._computeLayout();
      assert.equal(c.width() , 2 * SVG_WIDTH, "computeLayout updated width to new svg width");
      assert.equal(c.height(), 2 * SVG_HEIGHT, "computeLayout updated height to new svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin is still 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin is still 0");

      svg.remove();
    });

    it("computeLayout works with CSS layouts", () => {
      // Manually size parent
      var parent = d3.select(svg.node().parentNode);
      parent.style("width", "400px");
      parent.style("height", "200px");

      // Remove width/height attributes and style with CSS
      svg.attr("width", null).attr("height", null);
      c._anchor(svg);
      c._computeLayout();
      assert.equal(c.width(), 400, "defaults to width of parent if width is not specified on <svg>");
      assert.equal(c.height(), 200, "defaults to height of parent if width is not specified on <svg>");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin defaulted to 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin defaulted to 0");


      svg.style("width", "50%").style("height", "50%");
      c._computeLayout();

      assert.equal(c.width(), 200, "computeLayout defaulted width to svg width");
      assert.equal(c.height(), 100, "computeLayout defaulted height to svg height");
      assert.equal((<any> c).xOrigin, 0 ,"xOrigin defaulted to 0");
      assert.equal((<any> c).yOrigin, 0 ,"yOrigin defaulted to 0");

      svg.style("width", "25%").style("height", "25%");

      c._computeLayout();

      assert.equal(c.width(), 100, "computeLayout updated width to new svg width");
      assert.equal(c.height(), 50, "computeLayout updated height to new svg height");
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
      c._anchor(svg);
      c._computeLayout(xOff, yOff, width, height);
      var translate = getTranslate(c._element);
      assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
      assert.equal(c.width() , width, "the width set properly");
      assert.equal(c.height(), height, "the height set propery");
      svg.remove();
    });
  });

  it("subelement containers are ordered properly", () => {
    c.renderTo(svg);
    var gs = c._element.selectAll("g");
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
    fixComponentSize(c, 100, 100);
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
    fixComponentSize(c, 100, 100);
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
    var layout = c._requestedSpace(1, 1);
    assert.equal(layout.width, 0, "requested width defaults to 0");
    assert.equal(layout.height, 0, "requested height defaults to 0");
    assert.equal(layout.wantsWidth , false, "_requestedSpace().wantsWidth  defaults to false");
    assert.equal(layout.wantsHeight, false, "_requestedSpace().wantsHeight defaults to false");
    assert.equal((<any> c)._xAlignProportion, 0, "_xAlignProportion defaults to 0");
    assert.equal((<any> c)._yAlignProportion, 0, "_yAlignProportion defaults to 0");
    assert.equal((<any> c)._xOffset, 0, "xOffset defaults to 0");
    assert.equal((<any> c)._yOffset, 0, "yOffset defaults to 0");
    svg.remove();
  });

  it("clipPath works as expected", () => {
    assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
    c.clipPathEnabled = true;
    var expectedClipPathID = c._plottableID;
    c._anchor(svg);
    c._computeLayout(0, 0, 100, 100);
    c._render();
    var expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
    var expectedClipPathURL = "url(" + expectedPrefix + "#clipPath" + expectedClipPathID+ ")";
    // IE 9 has clipPath like 'url("#clipPath")', must accomodate
    var normalizeClipPath = (s: string) => s.replace(/"/g, "");
    assert.isTrue(normalizeClipPath(c._element.attr("clip-path")) === expectedClipPathURL,
                  "the element has clip-path url attached");
    var clipRect = (<any> c).boxContainer.select(".clip-rect");
    assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
    assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
    svg.remove();
  });

  it("componentID works as expected", () => {
    var expectedID = (<any> Plottable.Abstract.PlottableObject).nextID;
    var c1 = new Plottable.Abstract.Component();
    assert.equal(c1._plottableID, expectedID, "component id on next component was as expected");
    var c2 = new Plottable.Abstract.Component();
    assert.equal(c2._plottableID, expectedID+1, "future components increment appropriately");
    svg.remove();
  });

  it("boxes work as expected", () => {
    assert.throws(() => (<any> c).addBox("pre-anchor"), Error, "Adding boxes before anchoring is currently disallowed");
    c.renderTo(svg);
    (<any> c).addBox("post-anchor");
    var e = c._element;
    var boxContainer = e.select(".box-container");
    var boxStrings = [".bounding-box", ".post-anchor"];

    boxStrings.forEach((s) => {
      var box = boxContainer.select(s);
      assert.isNotNull(box.node(), s + " box was created and placed inside boxContainer");
      var bb = Plottable._Util.DOM.getBBox(box);
      assert.equal(bb.width, SVG_WIDTH, s + " width as expected");
      assert.equal(bb.height, SVG_HEIGHT, s + " height as expected");
    });
    svg.remove();
  });

  it("hitboxes are created iff there are registered interactions", () => {
    function verifyHitbox(component: Plottable.Abstract.Component) {
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

    c = new Plottable.Abstract.Component();
    var i = new Plottable.Abstract.Interaction();
    c.registerInteraction(i);
    c._anchor(svg);
    verifyHitbox(c);
    svg.remove();
    svg = generateSVG();

    c = new Plottable.Abstract.Component();
    c._anchor(svg);
    i = new Plottable.Abstract.Interaction();
    c.registerInteraction(i);
    verifyHitbox(c);
    svg.remove();
  });

  it("interaction registration works properly", () => {
    var hitBox1: Element = null;
    var hitBox2: Element = null;
    var interaction1: any = {_anchor: (comp: Plottable.Abstract.Component, hb: D3.Selection) => hitBox1 = hb.node()};
    var interaction2: any = {_anchor: (comp: Plottable.Abstract.Component, hb: D3.Selection) => hitBox2 = hb.node()};
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

  it("detach() works as expected", () => {
    var cbCalled = 0;
    var cb = (b: Plottable.Core.IListenable) => cbCalled++;
    var b = new Plottable.Core.Broadcaster(null);

    var c1 = new Plottable.Abstract.Component();

    b.registerListener(c1, cb);

    c1.renderTo(svg);
    b.broadcast();
    assert.equal(cbCalled, 1, "the callback was called");
    assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
    c1.detach();

    b.broadcast();
    assert.equal(cbCalled, 2, "the callback is still attached to the component");
    assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");

    svg.remove();
  });

  it("can't reuse component if it's been remove()-ed", () => {
    var c1 = new Plottable.Abstract.Component();
    c1.renderTo(svg);
    c1.remove();

    assert.throws(() => c1.renderTo(svg), "reuse");
    svg.remove();
  });

  it("_invalidateLayout works as expected", () => {
    var cg = new Plottable.Component.Group();
    var c = makeFixedSizeComponent(10, 10);
    cg._addComponent(c);
    cg.renderTo(svg);
    assert.equal(cg.height(), 10, "height() initially 10 for fixed-size component");
    assert.equal(cg.width(), 10, "width() initially 10 for fixed-size component");
    fixComponentSize(c, 50, 50);
    c._invalidateLayout();
    assert.equal(cg.height(), 50, "invalidateLayout propagated to parent and caused resized height");
    assert.equal(cg.width(), 50, "invalidateLayout propagated to parent and caused resized width");
    svg.remove();
  });

  it("components can be detached even if not anchored", () => {
    var c = new Plottable.Abstract.Component();
    c.detach(); // no error thrown
    svg.remove();
  });

  it("component remains in own cell", () => {
    var horizontalComponent = new Plottable.Abstract.Component();
    var verticalComponent = new Plottable.Abstract.Component();
    var placeHolder = new Plottable.Abstract.Component();
    var t = new Plottable.Component.Table().addComponent(0, 0, verticalComponent)
                                 .addComponent(0, 1, new Plottable.Abstract.Component())
                                 .addComponent(1, 0, placeHolder)
                                 .addComponent(1, 1, horizontalComponent);
    t.renderTo(svg);
    horizontalComponent.xAlign("center");
    verticalComponent.yAlign("bottom");

    assertBBoxNonIntersection(verticalComponent._element.select(".bounding-box"), placeHolder._element.select(".bounding-box"));
    assertBBoxInclusion((<any> t).boxContainer.select(".bounding-box"), horizontalComponent._element.select(".bounding-box"));

    svg.remove();
  });
});
