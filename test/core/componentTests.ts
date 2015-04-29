///<reference path="../testReference.ts" />

var assert = chai.assert;


function assertComponentXY(component: Plottable.Component.AbstractComponent, x: number, y: number, message: string) {
  // use <any> to examine the private variables
  var translate = d3.transform((<any> component)._element.attr("transform")).translate;
  var xActual = translate[0];
  var yActual = translate[1];
  assert.equal(xActual, x, "X: " + message);
  assert.equal(yActual, y, "Y: " + message);
}

describe("Component behavior", () => {
  var svg: D3.Selection;
  var c: Plottable.Component.AbstractComponent;
  var SVG_WIDTH = 400;
  var SVG_HEIGHT = 300;
  beforeEach(() => {
    svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    c = new Plottable.Component.AbstractComponent();
  });

  describe("anchor", () => {
    it("anchoring works as expected", () => {
      c._anchor(svg);
      assert.equal((<any> c)._element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the <svg>");
      assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
      svg.remove();
    });

    it("can re-anchor to a different element", () => {
      c._anchor(svg);

      var svg2 = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c._anchor(svg2);
      assert.equal((<any> c)._element.node(), svg2.select("g").node(), "the component re-achored under the second <svg>");
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
      assert.equal((<any> c)._xOrigin, 0 , "xOrigin defaulted to 0");
      assert.equal((<any> c)._yOrigin, 0 , "yOrigin defaulted to 0");

      svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
      c._computeLayout();
      assert.equal(c.width() , 2 * SVG_WIDTH, "computeLayout updated width to new svg width");
      assert.equal(c.height(), 2 * SVG_HEIGHT, "computeLayout updated height to new svg height");
      assert.equal((<any> c)._xOrigin, 0 , "xOrigin is still 0");
      assert.equal((<any> c)._yOrigin, 0 , "yOrigin is still 0");

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
      assert.equal((<any> c)._xOrigin, 0, "xOrigin defaulted to 0");
      assert.equal((<any> c)._yOrigin, 0, "yOrigin defaulted to 0");


      svg.style("width", "50%").style("height", "50%");
      c._computeLayout();

      assert.equal(c.width(), 200, "computeLayout defaulted width to svg width");
      assert.equal(c.height(), 100, "computeLayout defaulted height to svg height");
      assert.equal((<any> c)._xOrigin, 0, "xOrigin defaulted to 0");
      assert.equal((<any> c)._yOrigin, 0, "yOrigin defaulted to 0");

      svg.style("width", "25%").style("height", "25%");

      c._computeLayout();

      assert.equal(c.width(), 100, "computeLayout updated width to new svg width");
      assert.equal(c.height(), 50, "computeLayout updated height to new svg height");
      assert.equal((<any> c)._xOrigin, 0, "xOrigin is still 0");
      assert.equal((<any> c)._yOrigin, 0, "yOrigin is still 0");

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
      var translate = getTranslate((<any> c)._element);
      assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
      assert.equal(c.width() , width, "the width set properly");
      assert.equal(c.height(), height, "the height set propery");
      svg.remove();
    });
  });

  it("subelement containers are ordered properly", () => {
    c.renderTo(svg);
    var gs = (<any> c)._element.selectAll("g");
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
    assert.equal(layout.minWidth, 0, "requested width defaults to 0");
    assert.equal(layout.minHeight, 0, "requested height defaults to 0");
    assert.equal((<any> c)._xAlignProportion, 0, "_xAlignProportion defaults to 0");
    assert.equal((<any> c)._yAlignProportion, 0, "_yAlignProportion defaults to 0");
    assert.equal((<any> c)._xOffset, 0, "xOffset defaults to 0");
    assert.equal((<any> c)._yOffset, 0, "yOffset defaults to 0");
    svg.remove();
  });

  it("clipPath works as expected", () => {
    assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
    c.clipPathEnabled = true;
    var expectedClipPathID = c.getID();
    c._anchor(svg);
    c._computeLayout(0, 0, 100, 100);
    c._render();
    var expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
    expectedPrefix = expectedPrefix.replace(/#.*/g, "");
    var expectedClipPathURL = "url(" + expectedPrefix + "#clipPath" + expectedClipPathID + ")";
    // IE 9 has clipPath like 'url("#clipPath")', must accomodate
    var normalizeClipPath = (s: string) => s.replace(/"/g, "");
    assert.isTrue(normalizeClipPath((<any> c)._element.attr("clip-path")) === expectedClipPathURL,
                  "the element has clip-path url attached");
    var clipRect = (<any> c)._boxContainer.select(".clip-rect");
    assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
    assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
    svg.remove();
  });

  it("componentID works as expected", () => {
    var expectedID = (<any> Plottable.Core.PlottableObject)._nextID;
    var c1 = new Plottable.Component.AbstractComponent();
    assert.equal(c1.getID(), expectedID, "component id on next component was as expected");
    var c2 = new Plottable.Component.AbstractComponent();
    assert.equal(c2.getID(), expectedID + 1, "future components increment appropriately");
    svg.remove();
  });

  it("boxes work as expected", () => {
    assert.throws(() => (<any> c)._addBox("pre-anchor"), Error, "Adding boxes before anchoring is currently disallowed");
    c.renderTo(svg);
    (<any> c)._addBox("post-anchor");
    var e = (<any> c)._element;
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

  it("hitboxes are created iff there are registered interactions that require hitboxes", () => {
    function verifyHitbox(component: Plottable.Component.AbstractComponent) {
      var hitBox = (<any> component)._hitBox;
      assert.isNotNull(hitBox, "the hitbox was created");
      var hitBoxFill = hitBox.style("fill");
      var hitBoxFilled = hitBoxFill === "#ffffff" || hitBoxFill === "rgb(255, 255, 255)";
      assert.isTrue(hitBoxFilled, hitBoxFill + " <- this should be filled, so the hitbox will detect events");
      assert.equal(hitBox.style("opacity"), "0", "the hitBox is transparent, otherwise it would look weird");
    }

    c._anchor(svg);
    assert.isUndefined((<any> c)._hitBox, "no hitBox was created when there were no registered interactions");
    svg.remove();
    svg = generateSVG();

    // registration before anchoring
    c = new Plottable.Component.AbstractComponent();
    var i = new Plottable.Interaction.AbstractInteraction();
    i._requiresHitbox = () => true;
    c.registerInteraction(i);
    c._anchor(svg);
    verifyHitbox(c);
    svg.remove();
    svg = generateSVG();

    // registration after anchoring
    c = new Plottable.Component.AbstractComponent();
    c._anchor(svg);
    i = new Plottable.Interaction.AbstractInteraction();
    i._requiresHitbox = () => true;
    c.registerInteraction(i);
    verifyHitbox(c);
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
    var c1 = new Plottable.Component.AbstractComponent();

    c1.renderTo(svg);
    assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
    c1.detach();
    assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");

    svg.remove();
  });

  it("can't reuse component if it's been remove()-ed", () => {
    var c1 = new Plottable.Component.AbstractComponent();
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
    assert.equal(cg.height(), 300, "height() is the entire available height");
    assert.equal(cg.width(), 400, "width() is the entire available width");
    fixComponentSize(c, 50, 50);
    c._invalidateLayout();
    assert.equal(cg.height(), 300, "height() after resizing is the entire available height");
    assert.equal(cg.width(), 400, "width() after resizing is the entire available width");
    svg.remove();
  });

  it("components can be detached even if not anchored", () => {
    var c = new Plottable.Component.AbstractComponent();
    c.detach(); // no error thrown
    svg.remove();
  });

  it("component remains in own cell", () => {
    var horizontalComponent = new Plottable.Component.AbstractComponent();
    var verticalComponent = new Plottable.Component.AbstractComponent();
    var placeHolder = new Plottable.Component.AbstractComponent();
    var t = new Plottable.Component.Table().addComponent(0, 0, verticalComponent)
                                 .addComponent(0, 1, new Plottable.Component.AbstractComponent())
                                 .addComponent(1, 0, placeHolder)
                                 .addComponent(1, 1, horizontalComponent);
    t.renderTo(svg);
    horizontalComponent.xAlign("center");
    verticalComponent.yAlign("bottom");

    assertBBoxNonIntersection((<any> verticalComponent)._element.select(".bounding-box"),
                              (<any> placeHolder)._element.select(".bounding-box"));
    assertBBoxInclusion((<any> t)._boxContainer.select(".bounding-box"), (<any> horizontalComponent)._element.select(".bounding-box"));

    svg.remove();
  });

  it("Components will not translate if they are fixed width/height and request more space than offered", () => {
    // catches #1188
    var c: any = new Plottable.Component.AbstractComponent();
    c._requestedSpace = () => { return { minWidth: 500, minHeight: 500}; };
    c._fixedWidthFlag = true;
    c._fixedHeightFlag = true;
    c.xAlign("left");
    var t = new Plottable.Component.Table([[c]]);
    t.renderTo(svg);

    var transform = d3.transform(c._element.attr("transform"));
    assert.deepEqual(transform.translate, [0, 0], "the element was not translated");
    svg.remove();
  });

  it("components do not render unless allocated space", () => {
    var renderFlag = false;
    var c: any = new Plottable.Component.AbstractComponent();
    c._doRender = () => renderFlag = true;
    c._anchor(svg);
    c._setup();
    c._render();
    assert.isFalse(renderFlag, "no render until width/height set to nonzero");

    c._width = 10;
    c._height = 0;
    c._render();
    assert.isTrue(renderFlag, "render still occurs if one of width/height is zero");

    c._height = 10;
    c._render();
    assert.isTrue(renderFlag, "render occurs if width and height are positive");

    svg.remove();
  });

  it("rendering to a new svg detaches the component", () => {
    var SVG_HEIGHT_1 = 300;
    var SVG_HEIGHT_2 = 50;
    var svg1 = generateSVG(300, SVG_HEIGHT_1);
    var svg2 = generateSVG(300, SVG_HEIGHT_2);

    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var plot = new Plottable.Plot.Line(xScale, yScale);
    var group = new Plottable.Component.Group;
    group.renderTo(svg1);

    group._addComponent(plot);

    assert.deepEqual(plot._parent(), group, "the plot should be inside the group");
    assert.strictEqual(plot.height(), SVG_HEIGHT_1, "the plot should occupy the entire space of the first svg");

    plot.renderTo(svg2);

    assert.equal(plot._parent(), null, "the plot should be outside the group");
    assert.strictEqual(plot.height(), SVG_HEIGHT_2, "the plot should occupy the entire space of the second svg");

    svg1.remove();
    svg2.remove();
    svg.remove();
  });

  describe("origin methods", () => {
    var cWidth = 100;
    var cHeight = 100;
    it("origin() (top-level component)", () => {
      fixComponentSize(c, cWidth, cHeight);
      c.renderTo(svg);

      c.xAlign("left").yAlign("top");
      var origin = c.origin();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlign("center").yAlign("center");
      origin = c.origin();
      assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlign("right").yAlign("bottom");
      origin = c.origin();
      assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");

      c.xAlign("left").yAlign("top");
      var xOffsetValue = 40;
      var yOffsetValue = 30;
      c.xOffset(xOffsetValue);
      c.yOffset(yOffsetValue);
      origin = c.origin();
      assert.strictEqual(origin.x, xOffsetValue, "accounts for xOffset");
      assert.strictEqual(origin.y, yOffsetValue, "accounts for yOffset");

      svg.remove();
    });

    it("origin() (nested)", () => {
      fixComponentSize(c, cWidth, cHeight);
      var group = new Plottable.Component.Group([c]);
      var groupXOffset = 40;
      var groupYOffset = 30;
      group.xOffset(groupXOffset);
      group.yOffset(groupYOffset);
      group.renderTo(svg);

      var groupWidth = group.width();
      var groupHeight = group.height();

      c.xAlign("left").yAlign("top");
      var origin = c.origin();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlign("center").yAlign("center");
      origin = c.origin();
      assert.strictEqual(origin.x, (groupWidth - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (groupHeight - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlign("right").yAlign("bottom");
      origin = c.origin();
      assert.strictEqual(origin.x, groupWidth - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, groupHeight - cHeight, "returns correct value (yAlign bottom)");

      svg.remove();
    });

    it("originToSVG() (top-level component)", () => {
      fixComponentSize(c, cWidth, cHeight);
      c.renderTo(svg);

      c.xAlign("left").yAlign("top");
      var origin = c.originToSVG();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlign("center").yAlign("center");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlign("right").yAlign("bottom");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");

      c.xAlign("left").yAlign("top");
      var xOffsetValue = 40;
      var yOffsetValue = 30;
      c.xOffset(xOffsetValue);
      c.yOffset(yOffsetValue);
      origin = c.originToSVG();
      assert.strictEqual(origin.x, xOffsetValue, "accounts for xOffset");
      assert.strictEqual(origin.y, yOffsetValue, "accounts for yOffset");

      svg.remove();
    });

    it("originToSVG() (nested)", () => {
      fixComponentSize(c, cWidth, cHeight);
      var group = new Plottable.Component.Group([c]);
      var groupXOffset = 40;
      var groupYOffset = 30;
      group.xOffset(groupXOffset);
      group.yOffset(groupYOffset);
      group.renderTo(svg);

      var groupWidth = group.width();
      var groupHeight = group.height();

      c.xAlign("left").yAlign("top");
      var origin = c.originToSVG();
      assert.strictEqual(origin.x, groupXOffset, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, groupYOffset, "returns correct value (yAlign top)");

      c.xAlign("center").yAlign("center");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, (groupWidth - cWidth) / 2 + groupXOffset, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (groupHeight - cHeight) / 2 + groupYOffset, "returns correct value (yAlign center)");

      c.xAlign("right").yAlign("bottom");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, groupWidth - cWidth + groupXOffset, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, groupHeight - cHeight + groupYOffset, "returns correct value (yAlign bottom)");

      svg.remove();
    });
  });
});
