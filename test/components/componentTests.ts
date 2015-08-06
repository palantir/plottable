///<reference path="../testReference.ts" />

function assertComponentXY(component: Plottable.Component, x: number, y: number, message: string) {
  // use <any> to examine the private variables
  var translate = d3.transform((<any> component)._element.attr("transform")).translate;
  var xActual = translate[0];
  var yActual = translate[1];
  assert.strictEqual(xActual, x, "X: " + message);
  assert.strictEqual(yActual, y, "Y: " + message);
}

describe("Component behavior", () => {
  var svg: d3.Selection<void>;
  var c: Plottable.Component;
  var SVG_WIDTH = 400;
  var SVG_HEIGHT = 300;
  beforeEach(() => {
    svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    c = new Plottable.Component();
  });

  describe("anchor()", () => {
    it("anchor()-ing works as expected", () => {
      c.anchor(svg);
      assert.strictEqual((<any> c)._element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the <svg>");
      assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
      const computedStyle = window.getComputedStyle(<Element>svg.node());
      assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblefill",
        "\"pointer-events\" style set to \"visiblefill\"");
      svg.remove();
    });

    it("can re-anchor() to a different element", () => {
      c.anchor(svg);

      var svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.anchor(svg2);
      assert.strictEqual((<any> c)._element.node(), svg2.select("g").node(), "the component re-achored under the second <svg>");
      assert.isTrue(svg2.classed("plottable"), "second <svg> was given \"plottable\" CSS class");
      const computedStyle = window.getComputedStyle(<Element>svg2.node());
      assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblefill",
        "second <svg>'s \"pointer-events\" style set to \"visiblefill\"");

      svg.remove();
      svg2.remove();
    });

    describe("anchor() callbacks", () => {
      it("callbacks called on anchor()-ing", () => {
        var callbackCalled = false;
        var passedComponent: Plottable.Component;
        var callback = (component: Plottable.Component) => {
          callbackCalled = true;
          passedComponent = component;
        };
        c.onAnchor(callback);
        c.anchor(svg);
        assert.isTrue(callbackCalled, "callback was called on anchor()-ing");
        assert.strictEqual(passedComponent, c, "callback was passed the Component that anchor()-ed");

        var svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        callbackCalled = false;
        c.anchor(svg2);
        assert.isTrue(callbackCalled, "callback was called on anchor()-ing to a new <svg>");
        assert.strictEqual(passedComponent, c, "callback was passed the Component that anchor()-ed");

        svg.remove();
        svg2.remove();
      });

      it("callbacks called immediately if already anchor()-ed", () => {
        var callbackCalled = false;
        var passedComponent: Plottable.Component;
        var callback = (component: Plottable.Component) => {
          callbackCalled = true;
          passedComponent = component;
        };
        c.anchor(svg);
        c.onAnchor(callback);
        assert.isTrue(callbackCalled, "callback was immediately if Component was already anchor()-ed");
        assert.strictEqual(passedComponent, c, "callback was passed the Component that anchor()-ed");
        svg.remove();
      });

      it("removing callbacks", () => {
        var callbackCalled = false;
        var callback = (component: Plottable.Component) => {
          callbackCalled = true;
        };
        c.onAnchor(callback);
        c.offAnchor(callback);
        c.anchor(svg);
        assert.isFalse(callbackCalled, "removed callback is not called");
        svg.remove();
      });
    });
  });

  describe("detach()", () => {
    it("detach() works as expected", () => {
      var c1 = new Plottable.Component();

      c1.renderTo(svg);
      assert.isTrue((<Node> svg.node()).hasChildNodes(), "the svg has children");
      c1.detach();
      assert.isFalse((<Node> svg.node()).hasChildNodes(), "the svg has no children");

      svg.remove();
    });

    it("components can be detach()-ed even if not anchor()-ed", () => {
      var c = new Plottable.Component();
      c.detach(); // no error thrown
      svg.remove();
    });

    it("callbacks called on detach()-ing", () => {
      c = new Plottable.Component();
      c.renderTo(svg);

      var callbackCalled = false;
      var passedComponent: Plottable.Component;
      var callback = (component: Plottable.Component) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.onDetach(callback);
      c.detach();
      assert.isTrue(callbackCalled, "callback was called when the Component was detach()-ed");
      assert.strictEqual(passedComponent, c, "callback was passed the Component that detach()-ed");
      svg.remove();
    });

    it("callbacks on detach() not called unless the component is anchored", () => {
      c = new Plottable.Component();

      var callbackCalled = false;
      var callback = (component: Plottable.Component) => callbackCalled = true;
      c.onDetach(callback);

      callbackCalled = false;
      c.detach();
      assert.isFalse(callbackCalled, "callback was not called because the Component is not rendered yet");

      c.renderTo(svg);

      callbackCalled = false;
      c.detach();
      assert.isTrue(callbackCalled, "callback was called when the Component was detach()-ed");

      callbackCalled = false;
      c.detach();
      assert.isFalse(callbackCalled, "callback was not called because the Component was detached already");

      svg.remove();
    });
  });

  it("parent()", () => {
    var c = new Plottable.Component();
    var acceptingContainer = {
      has: (component: Plottable.Component) => true
    };
    c.parent(<any> acceptingContainer);
    assert.strictEqual(c.parent(), acceptingContainer, "Component's parent was set if the Component is contained in the parent");
    var rejectingContainer = {
      has: (component: Plottable.Component) => false
    };
    assert.throws(() => c.parent(<any> rejectingContainer), Error, "invalid parent");
    svg.remove();
  });

  describe("computeLayout", () => {
    it("computeLayout defaults and updates intelligently", () => {
      c.anchor(svg);
      c.computeLayout();
      assert.strictEqual(c.width() , SVG_WIDTH, "computeLayout defaulted width to svg width");
      assert.strictEqual(c.height(), SVG_HEIGHT, "computeLayout defaulted height to svg height");
      var origin = c.origin();
      assert.strictEqual(origin.x, 0 , "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0 , "yOrigin defaulted to 0");

      svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
      c.computeLayout();
      assert.strictEqual(c.width() , 2 * SVG_WIDTH, "computeLayout updated width to new svg width");
      assert.strictEqual(c.height(), 2 * SVG_HEIGHT, "computeLayout updated height to new svg height");
      origin = c.origin();
      assert.strictEqual(origin.x, 0 , "xOrigin is still 0");
      assert.strictEqual(origin.y, 0 , "yOrigin is still 0");

      svg.remove();
    });

    it("computeLayout works with CSS layouts", () => {
      // Manually size parent
      var parent = d3.select(<Element> (<Element> svg.node()).parentNode);
      parent.style("width", "400px");
      parent.style("height", "200px");

      // Remove width/height attributes and style with CSS
      svg.attr("width", null).attr("height", null);
      c.anchor(svg);
      c.computeLayout();
      assert.strictEqual(c.width(), 400, "defaults to width of parent if width is not specified on <svg>");
      assert.strictEqual(c.height(), 200, "defaults to height of parent if width is not specified on <svg>");
      var origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");

      svg.style("width", "50%").style("height", "50%");
      c.computeLayout();

      assert.strictEqual(c.width(), 200, "computeLayout defaulted width to svg width");
      assert.strictEqual(c.height(), 100, "computeLayout defaulted height to svg height");
      origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");

      svg.style("width", "25%").style("height", "25%");

      c.computeLayout();

      assert.strictEqual(c.width(), 100, "computeLayout updated width to new svg width");
      assert.strictEqual(c.height(), 50, "computeLayout updated height to new svg height");
      origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin is still 0");
      assert.strictEqual(origin.y, 0, "yOrigin is still 0");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      svg.remove();
    });

    it("computeLayout will not default when attached to non-root node", () => {
      var g = svg.append("g");
      c.anchor(g);
      assert.throws(() => c.computeLayout(), "null arguments");
      svg.remove();
    });

    it("computeLayout throws an error when called on un-anchored component", () => {
      assert.throws(() => c.computeLayout(), Error);
      svg.remove();
    });

    it("computeLayout uses its arguments apropriately", () => {
      var origin = {
        x: 10,
        y: 20
      };
      var width = 100;
      var height = 200;
      c.anchor(svg);
      c.computeLayout(origin, width, height);
      var translate = TestMethods.getTranslate((<any> c)._element);
      assert.deepEqual(translate, [origin.x, origin.y], "the element translated appropriately");
      assert.strictEqual(c.width() , width, "the width set properly");
      assert.strictEqual(c.height(), height, "the height set propery");
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

  it("component defaults are as expected", () => {
    assert.strictEqual(c.xAlignment(), "left", "x alignment defaults to \"left\"");
    assert.strictEqual(c.yAlignment(), "top", "y alignment defaults to \"top\"");
    var layout = c.requestedSpace(1, 1);
    assert.strictEqual(layout.minWidth, 0, "requested minWidth defaults to 0");
    assert.strictEqual(layout.minHeight, 0, "requested minHeight defaults to 0");
    svg.remove();
  });

  it("fixed-width component will align to the right spot", () => {
    TestMethods.fixComponentSize(c, 100, 100);
    c.anchor(svg);
    c.xAlignment("left").yAlignment("top");
    c.computeLayout();
    assertComponentXY(c, 0, 0, "top-left component aligns correctly");

    c.xAlignment("center").yAlignment("center");
    c.computeLayout();
    assertComponentXY(c, 150, 100, "center component aligns correctly");

    c.xAlignment("right").yAlignment("bottom");
    c.computeLayout();
    assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
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
      var bb = Plottable.Utils.DOM.elementBBox(box);
      assert.strictEqual(bb.width, SVG_WIDTH, s + " width as expected");
      assert.strictEqual(bb.height, SVG_HEIGHT, s + " height as expected");
    });
    svg.remove();
  });

  it("errors are thrown on bad alignments", () => {
    assert.throws(() => c.xAlignment("foo"), Error, "Unsupported alignment");
    assert.throws(() => c.yAlignment("foo"), Error, "Unsupported alignment");
    svg.remove();
  });

  it("css classing works as expected", () => {
    assert.isFalse(c.hasClass("CSS-PREANCHOR-KEEP"));
    c.addClass("CSS-PREANCHOR-KEEP");
    assert.isTrue(c.hasClass("CSS-PREANCHOR-KEEP"));
    c.addClass("CSS-PREANCHOR-REMOVE");
    assert.isTrue(c.hasClass("CSS-PREANCHOR-REMOVE"));
    c.removeClass("CSS-PREANCHOR-REMOVE");
    assert.isFalse(c.hasClass("CSS-PREANCHOR-REMOVE"));

    c.anchor(svg);
    assert.isTrue(c.hasClass("CSS-PREANCHOR-KEEP"));
    assert.isFalse(c.hasClass("CSS-PREANCHOR-REMOVE"));
    assert.isFalse(c.hasClass("CSS-POSTANCHOR"));
    c.addClass("CSS-POSTANCHOR");
    assert.isTrue(c.hasClass("CSS-POSTANCHOR"));
    c.removeClass("CSS-POSTANCHOR");
    assert.isFalse(c.hasClass("CSS-POSTANCHOR"));
    assert.isFalse(c.hasClass(undefined), "returns false when hasClass called w/ undefined");
    assert.strictEqual(c.addClass(undefined), c, "returns this when hasClass called w/ undefined and true");
    svg.remove();
  });

  it("can't reuse component if it's been destroy()-ed", () => {
    var c1 = new Plottable.Component();
    c1.renderTo(svg);
    c1.destroy();

    assert.throws(() => c1.renderTo(svg), "reuse");
    svg.remove();
  });

  it("redraw() works as expected", () => {
    var cg = new Plottable.Components.Group();
    var c = TestMethods.makeFixedSizeComponent(10, 10);
    cg.append(c);
    cg.renderTo(svg);
    assert.strictEqual(cg.height(), 300, "height() is the entire available height");
    assert.strictEqual(cg.width(), 400, "width() is the entire available width");
    TestMethods.fixComponentSize(c, 50, 50);
    c.redraw();
    assert.strictEqual(cg.height(), 300, "height() after resizing is the entire available height");
    assert.strictEqual(cg.width(), 400, "width() after resizing is the entire available width");
    svg.remove();
  });

  it("component remains in own cell", () => {
    var horizontalComponent = new Plottable.Component();
    var verticalComponent = new Plottable.Component();
    var placeHolder = new Plottable.Component();
    var t = new Plottable.Components.Table().add(verticalComponent, 0, 0)
                                 .add(new Plottable.Component(), 0, 1)
                                 .add(placeHolder, 1, 0)
                                 .add(horizontalComponent, 1, 1);
    t.renderTo(svg);
    horizontalComponent.xAlignment("center");
    verticalComponent.yAlignment("bottom");

    TestMethods.assertBBoxNonIntersection((<any> verticalComponent)._element.select(".bounding-box"),
                              (<any> placeHolder)._element.select(".bounding-box"));
    TestMethods.assertBBoxInclusion((<any> t)._boxContainer.select(".bounding-box"),
                                    (<any> horizontalComponent)._element.select(".bounding-box"));

    svg.remove();
  });

  it("Components will not translate if they are fixed width/height and request more space than offered", () => {
    // catches #1188
    var c = new Plottable.Component();
    c.requestedSpace = () => { return { minWidth: 500, minHeight: 500}; };
    (<any> c)._fixedWidthFlag = true;
    (<any> c)._fixedHeightFlag = true;
    c.xAlignment("left");
    var t = new Plottable.Components.Table([[c]]);
    t.renderTo(svg);

    var transform = d3.transform((<any> c)._element.attr("transform"));
    assert.deepEqual(transform.translate, [0, 0], "the element was not translated");
    svg.remove();
  });

  it("components do not render unless allocated space", () => {
    var renderFlag = false;
    var c: any = new Plottable.Component();
    c.renderImmediately = () => renderFlag = true;
    c.anchor(svg);
    c._setup();
    c.render();
    assert.isFalse(renderFlag, "no render until width/height set to nonzero");

    c._width = 10;
    c._height = 0;
    c.render();
    assert.isTrue(renderFlag, "render still occurs if one of width/height is zero");

    c._height = 10;
    c.render();
    assert.isTrue(renderFlag, "render occurs if width and height are positive");

    svg.remove();
  });

  it("rendering to a new svg detaches the component", () => {
    var SVG_HEIGHT_1 = 300;
    var SVG_HEIGHT_2 = 50;
    var svg1 = TestMethods.generateSVG(300, SVG_HEIGHT_1);
    var svg2 = TestMethods.generateSVG(300, SVG_HEIGHT_2);

    var plot = new Plottable.Plots.Line();
    var group = new Plottable.Components.Group;
    plot.x(0).y(0);
    group.renderTo(svg1);

    group.append(plot);

    assert.deepEqual(plot.parent(), group, "the plot should be inside the group");
    assert.strictEqual(plot.height(), SVG_HEIGHT_1, "the plot should occupy the entire space of the first svg");

    plot.renderTo(svg2);

    assert.strictEqual(plot.parent(), null, "the plot should be outside the group");
    assert.strictEqual(plot.height(), SVG_HEIGHT_2, "the plot should occupy the entire space of the second svg");

    svg1.remove();
    svg2.remove();
    svg.remove();
  });

  describe("origin methods", () => {
    var cWidth = 100;
    var cHeight = 100;

    it("modifying returned value does not affect origin", () => {
      c.renderTo(svg);
      var receivedOrigin = c.origin();
      var delta = 10;
      receivedOrigin.x += delta;
      receivedOrigin.y += delta;
      assert.notStrictEqual(receivedOrigin.x, c.origin().x, "receieved point can be modified without affecting origin (x)");
      assert.notStrictEqual(receivedOrigin.y, c.origin().y, "receieved point can be modified without affecting origin (y)");
      svg.remove();
    });

    it("origin() (top-level component)", () => {
      TestMethods.fixComponentSize(c, cWidth, cHeight);
      c.renderTo(svg);

      c.xAlignment("left").yAlignment("top");
      var origin = c.origin();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlignment("center").yAlignment("center");
      origin = c.origin();
      assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlignment("right").yAlignment("bottom");
      origin = c.origin();
      assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");

      svg.remove();
    });

    it("origin() (nested)", () => {
      TestMethods.fixComponentSize(c, cWidth, cHeight);
      var group = new Plottable.Components.Group([c]);
      group.renderTo(svg);

      var groupWidth = group.width();
      var groupHeight = group.height();

      c.xAlignment("left").yAlignment("top");
      var origin = c.origin();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlignment("center").yAlignment("center");
      origin = c.origin();
      assert.strictEqual(origin.x, (groupWidth - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (groupHeight - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlignment("right").yAlignment("bottom");
      origin = c.origin();
      assert.strictEqual(origin.x, groupWidth - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, groupHeight - cHeight, "returns correct value (yAlign bottom)");

      svg.remove();
    });

    it("originToSVG() (top-level component)", () => {
      TestMethods.fixComponentSize(c, cWidth, cHeight);
      c.renderTo(svg);

      c.xAlignment("left").yAlignment("top");
      var origin = c.originToSVG();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlignment("center").yAlignment("center");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlignment("right").yAlignment("bottom");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");

      svg.remove();
    });

    it("originToSVG() (nested)", () => {
      TestMethods.fixComponentSize(c, cWidth, cHeight);
      var group = new Plottable.Components.Group([c]);
      group.renderTo(svg);

      var groupWidth = group.width();
      var groupHeight = group.height();

      c.xAlignment("left").yAlignment("top");
      var origin = c.originToSVG();
      assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
      assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");

      c.xAlignment("center").yAlignment("center");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, (groupWidth - cWidth) / 2, "returns correct value (xAlign center)");
      assert.strictEqual(origin.y, (groupHeight - cHeight) / 2, "returns correct value (yAlign center)");

      c.xAlignment("right").yAlignment("bottom");
      origin = c.originToSVG();
      assert.strictEqual(origin.x, groupWidth - cWidth, "returns correct value (xAlign right)");
      assert.strictEqual(origin.y, groupHeight - cHeight, "returns correct value (yAlign bottom)");

      svg.remove();
    });
  });
});
