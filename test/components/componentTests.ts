import * as d3 from "d3";

import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import * as Mocks from "../mocks";
import * as TestMethods from "../testMethods";

describe("Component", () => {
  let SVG_WIDTH = 400;
  let SVG_HEIGHT = 300;

  describe("anchoring", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("adds itself as a child element of the input selection", () => {
      assert.strictEqual(c.anchor(svg), c, "setter returns calling object");
      assert.strictEqual(Plottable.Utils.DOM.boundingSVG(<SVGElement> c.content().node()),
        svg.node(), "component DOM elements are children of svg element");
      c.destroy();
      svg.remove();
    });

    it("adds default selections in the correct order", () => {
      c.anchor(svg);
      assert.isFalse(c.foreground().empty(), "foreground exists in the DOM");
      assert.isFalse(c.background().empty(), "background exists in the DOM");
      assert.isFalse(c.content().empty(), "content exists in the DOM");
      assert.isFalse(c.background().select(".background-fill").empty(), "background fill container exists in the DOM");

      let componentElement = svg.select(".component");
      let containers = componentElement.selectAll("g");
      assert.strictEqual(containers[0][0], c.background().node(), "background at the back");
      assert.strictEqual(containers[0][1], c.content().node(), "content at the middle");
      assert.strictEqual(containers[0][2], c.foreground().node(), "foreground at the front");
      assert.strictEqual(containers[0][3], componentElement.select(".box-container").node(), "boxes at front of foreground");
      c.destroy();
      svg.remove();
    });

    it("sets the background-fill's pointer-event to none", () => {
      c.anchor(svg);
      let backgroundFill = c.background().select(".background-fill").node();
      let pointerEvent = window.getComputedStyle(<Element>backgroundFill).pointerEvents;
      assert.strictEqual(pointerEvent, "none", "background-fill's pointer-event is set to none");
      c.destroy();
      svg.remove();
    });

    it("classes the input with 'plottable' if it is an svg", () => {
      c.anchor(svg);
      assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
      c.destroy();
      svg.remove();
    });

    it("allows mouse events to operate if the component is visible", () => {
      c.anchor(svg);
      let computedStyle = window.getComputedStyle(<Element>svg.node());
      assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblefill",
        "\"pointer-events\" style set to \"visiblefill\"");
      c.destroy();
      svg.remove();
    });

    it("can switch which element it is anchored to", () => {
      c.anchor(svg);

      let svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.anchor(svg2);
      assert.notStrictEqual(Plottable.Utils.DOM.boundingSVG(<SVGElement> c.content().node()),
        svg.node(), "component DOM elements are not children of svg element");
      assert.strictEqual(Plottable.Utils.DOM.boundingSVG(<SVGElement> c.content().node()),
        svg2.node(), "component DOM elements are children of second svg element");
      c.destroy();
      svg2.remove();
      svg.remove();
    });

    it("removes DOM elements in previous svg when anchoring to a different svg", () => {
      c.anchor(svg);
      let svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.anchor(svg2);
      assert.isTrue(svg.select("g").empty(), "previous svg element should not have any group child nodes");
      assert.isFalse(svg2.select("g").empty(), "new svg element should have group child nodes");
      c.destroy();
      svg.remove();
      svg2.remove();
    });

    it("can undergo set behavior upon anchoring", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.SVGComponent;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
        passedComponent = component;
      };
      assert.strictEqual(c.onAnchor(callback), c, "setter returns calling object");
      c.anchor(svg);
      assert.isTrue(callbackCalled, "callback was called on anchoring");
      assert.strictEqual(passedComponent, c, "callback was passed anchored Component");

      c.destroy();
      svg.remove();
    });

    it("undergoes on-anchor behavior if already anchored", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.SVGComponent;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.anchor(svg);
      c.onAnchor(callback);
      assert.isTrue(callbackCalled, "callback was immediately if Component was already anchored");
      assert.strictEqual(passedComponent, c, "callback was passed the Component that anchored");
      c.destroy();
      svg.remove();
    });

    it("calls callbacks upon anchoring to different svg", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.SVGComponent;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.onAnchor(callback);
      c.anchor(svg);

      let svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      callbackCalled = false;
      c.anchor(svg2);
      assert.isTrue(callbackCalled, "callback was called on anchoring to a new <svg>");
      assert.strictEqual(passedComponent, c, "callback was passed anchored Component");

      c.destroy();
      svg.remove();
      svg2.remove();
    });

    it("can remove set behavior the component would have underwent upon anchoring", () => {
      let callbackCalled = false;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
      };
      c.onAnchor(callback);
      assert.strictEqual(c.offAnchor(callback), c, "setter returns calling object");
      c.anchor(svg);
      assert.isFalse(callbackCalled, "removed callback is not called");

      c.destroy();
      svg.remove();
    });
  });

  describe("detaching", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("can remove its own DOM elements", () => {
      c.renderTo(svg);
      assert.isTrue((<Node> svg.node()).hasChildNodes(), "the svg has children");
      c.detach();
      assert.isFalse((<Node> svg.node()).hasChildNodes(), "the svg has no children");

      c.destroy();
      svg.remove();
    });

    it("does not error if not already anchored", () => {
      assert.doesNotThrow(() => c.detach(), Error, "does not throw error if detach() called before anchor()");
      c.destroy();
      svg.remove();
    });

    it("sets its parent to null when detaching", () => {
      let parent = new Plottable.Components.Group([c]);
      c.detach();
      assert.isNull(c.parent(), "parent removed upon detaching");
      parent.destroy();
      c.destroy();
      svg.remove();
    });

    it("can undergo set behavior upon detaching", () => {
      c.renderTo(svg);

      let callbackCalled = false;
      let passedComponent: Plottable.SVGComponent;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
        passedComponent = component;
      };
      assert.strictEqual(c.onDetach(callback), c, "setter returns calling object");
      c.detach();
      assert.isTrue(callbackCalled, "callback was called when the Component was detached");
      assert.strictEqual(passedComponent, c, "callback was passed the Component that detached");
      c.destroy();
      svg.remove();
    });

    it("calls callbacks upon detaching even if not anchored", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.SVGComponent;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.onDetach(callback);

      c.detach();
      assert.isTrue(callbackCalled, "callback still called");
      assert.strictEqual(passedComponent, c, "callback passed the Component that detached");
      c.destroy();
      svg.remove();
    });

    it("can remove callbacks that would have been called upon detaching", () => {
      let callbackCalled = false;
      let callback = (component: Plottable.SVGComponent) => {
        callbackCalled = true;
      };
      c.onDetach(callback);
      assert.strictEqual(c.offDetach(callback), c, "setter calls calling object");
      c.renderTo(svg);
      c.detach();
      assert.isFalse(callbackCalled, "removed callback is not called");
      c.destroy();
      svg.remove();
    });
  });

  describe("parent container", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("can set its parent to a container that contains this component", () => {
      let acceptingContainer: any = {
        has: () => true,
      };
      assert.strictEqual(c.parent(acceptingContainer), c, "setter returns calling object");
      assert.strictEqual(c.parent(), acceptingContainer, "parent set if parent contains component");
      c.destroy();
      svg.remove();
    });

    it("throws an error when the input parent does not contain this component", () => {
      let rejectingContainer: any = {
        has: (component: Plottable.SVGComponent) => false,
      };
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.parent(rejectingContainer), Error,
        "invalid parent", "error thrown for parent not containing child");
      c.destroy();
      svg.remove();
    });
  });

  describe("css classes", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("can add css classes", () => {
      let className = "foo";
      assert.strictEqual(c.addClass(className), c, "setter returns calling object");
      assert.isTrue(c.hasClass(className), "component has added css class");

      c.renderTo(svg);

      assert.isFalse(svg.select(`.${className}`).empty(), "css class added to DOM element");

      c.destroy();
      svg.remove();
    });

    it("can remove css classes", () => {
      let className = "foo";
      c.addClass(className);
      assert.isTrue(c.hasClass(className), "component has added css class");
      c.renderTo(svg);

      assert.strictEqual(c.removeClass(className), c, "setter returns calling object");
      assert.isFalse(c.hasClass(className), "component no longer has css class");

      assert.isTrue(svg.select(`.${className}`).empty(), "css class removed from DOM element");

      c.destroy();
      svg.remove();
    });
  });

  describe("computing the layout", () => {

    let c: Plottable.SVGComponent;
    let d: Plottable.Components.Group;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      d = new Plottable.Components.Group();

      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("defaults to take up all space", () => {
      assert.isFalse(c.fixedWidth(), "will take all available width");
      assert.isFalse(c.fixedHeight(), "will take all available height");

      c.anchor(svg);
      c.computeLayout();
      assert.strictEqual(c.width() , SVG_WIDTH, "takes all available width");
      assert.strictEqual(c.height(), SVG_HEIGHT, "takes all available height");
      let origin = c.origin();
      assert.strictEqual(origin.x, 0 , "x origin defaults to leftmost");
      assert.strictEqual(origin.y, 0 , "y origin defaults to topmost");

      c.destroy();
      svg.remove();
    });

    it("does not allow the origin object to be modified", () => {
      c.renderTo(svg);
      let receivedOrigin = c.origin();
      let delta = 10;
      receivedOrigin.x += delta;
      receivedOrigin.y += delta;
      assert.notDeepEqual(c.origin(), receivedOrigin, "underlying origin object cannot be modified");
      c.destroy();
      svg.remove();
    });

    it("recomputes the layout if the environment changes", () => {
      c.anchor(svg);
      c.computeLayout();
      assert.strictEqual(c.width() , SVG_WIDTH, "takes all available width");
      assert.strictEqual(c.height(), SVG_HEIGHT, "takes all available height");

      svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
      c.computeLayout();
      assert.strictEqual(c.width() , 2 * SVG_WIDTH, "updated to take new available width");
      assert.strictEqual(c.height(), 2 * SVG_HEIGHT, "updated to take new available height");

      c.destroy();
      svg.remove();
    });

    it("can compute the layout based on CSS", () => {
      let parentWidth = 400;
      let parentHeight = 200;
      // Manually size parent
      let parent = d3.select(<Element> (<Element> svg.node()).parentNode);
      parent.style("width", `${parentWidth}px`);
      parent.style("height", `${parentHeight}px`);

      // Remove width/height attributes and style with CSS
      svg.attr("width", null).attr("height", null);
      c.anchor(svg);
      c.computeLayout();
      assert.strictEqual(c.width(), parentWidth, "defaults to width of parent");
      assert.strictEqual(c.height(), parentHeight, "defaults to height of parent");
      let origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");

      let svgWidthPercentage = 50;
      let svgHeightPercentage = 50;
      svg.style("width", `${svgWidthPercentage}%`).style("height", `${svgHeightPercentage}%`);
      c.computeLayout();

      assert.strictEqual(c.width(), parentWidth * svgWidthPercentage / 100, "width computed to be percentage of svg width");
      assert.strictEqual(c.height(), parentHeight * svgHeightPercentage / 100, "height computed to be percentage of svg height");
      origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      svg.remove();
    });

    it("requires arguments when not anchored directly under the svg", () => {
      const g = svg.append("g");
      d.append(c);
      c.anchor(g);
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.computeLayout(), "null arguments",
        "cannot compute layout with no arguments and not being the top svg element");
      svg.remove();
    });

    it("requires arguments if not anchored directly under the svg, even if previously anchored directly under the svg", () => {
      c.anchor(svg);
      c.detach();
      d.append(c);
      c.anchor(svg);
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.computeLayout(), "null arguments",
        "cannot compute layout with no arguments and not being the top svg element");
      svg.remove();
    });

    it("throws an error when computing the layout on an unanchored component", () => {
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.computeLayout(), Error, "anchor() must be called before",
        "cannot compute layout on an unanchored component");
      svg.remove();
    });

    it("computes the layout of the component based on input", () => {
      let origin = {
        x: 10,
        y: 20,
      };
      let width = 100;
      let height = 200;
      c.anchor(svg);
      c.computeLayout(origin, width, height);

      assert.strictEqual(c.origin().x, origin.x, "x origin set");
      assert.strictEqual(c.origin().y, origin.y, "y origin set");
      assert.strictEqual(c.width() , width, "width set");
      assert.strictEqual(c.height(), height, "height set");

      let componentElement = svg.select(".component");
      let translate = TestMethods.getTranslate(componentElement);
      assert.deepEqual(translate, [origin.x, origin.y], "the element translated appropriately");
      let backgroundFillBox = svg.select(".background-fill");
      assert.closeTo(TestMethods.numAttr(backgroundFillBox, "width"),
        width, window.Pixel_CloseTo_Requirement, "box width set to computed width");
      assert.closeTo(TestMethods.numAttr(backgroundFillBox, "height"),
        height, window.Pixel_CloseTo_Requirement, "box height set to computed height");
      c.destroy();
      svg.remove();
    });

    it("allows for recomputing the layout and rendering", () => {
      c.renderTo(svg);
      c.computeLayout({x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}, SVG_WIDTH / 4, SVG_HEIGHT / 4);
      c.redraw();
      let origin = c.origin();
      assert.deepEqual(origin, {x: 0, y: 0}, "origin reset");
      let componentElement = svg.select(".component");
      let translate = TestMethods.getTranslate(componentElement);
      assert.deepEqual(translate, [origin.x, origin.y], "DOM element rendered at new origin");
      c.destroy();
      svg.remove();
    });

    it("calls onResize callback if callback is registered", (done) => {
      let origin = {
        x: 10,
        y: 20,
      };
      let width = 100;
      let height = 200;
      c.anchor(svg);

      c.onResize((size: { height: number, width: number }) => {
        assert.deepEqual(size, { width, height });
        c.destroy();
        svg.remove();
        done();
      });

      c.computeLayout(origin, width, height);
    });
  });

  describe("computing the layout when of fixed size", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;
    let fixedWidth = 100;
    let fixedHeight = 100;

    beforeEach(() => {
      c = new Mocks.FixedSizeComponent(fixedWidth, fixedHeight);
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.anchor(svg);
    });

    it("gives the component the fixed space if offered more space", () => {
      c.computeLayout();
      assert.strictEqual(c.width(), fixedWidth, "width bounded to fixed width");
      assert.strictEqual(c.height(), fixedHeight, "height bounded to fixed height");
      c.destroy();
      svg.remove();
    });

    it("gives the component the offered space if it is less than the fixed space", () => {
      let restrictedWidth = fixedWidth / 2;
      let restrictedHeight = fixedHeight / 2;
      c.computeLayout({x: 0, y: 0}, restrictedWidth, restrictedHeight);
      assert.strictEqual(c.width(), restrictedWidth, "width bounded to restricted width");
      assert.strictEqual(c.height(), restrictedHeight, "height bounded to restricted height");
      c.destroy();
      svg.remove();
    });

    it("does not translate if more space was requested than offered", () => {
      const div = TestMethods.generateDIV(SVG_WIDTH, SVG_HEIGHT);

      let requestedWidth = SVG_WIDTH * 2;
      let requestedHeight = SVG_HEIGHT * 2;
      c.destroy();
      c = new Mocks.FixedSizeComponent(requestedWidth, requestedHeight);
      let t = new Plottable.Components.Table([[c]]);
      t.renderTo(div.node() as HTMLElement);

      let componentElement = div.select(".component");
      assert.deepEqual(TestMethods.getTranslate(componentElement), [0, 0], "the element was not translated");

      div.remove();
      svg.remove();
    });
  });

  describe("aligning", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("defaults to a top and left alignment", () => {
      assert.strictEqual(c.xAlignment(), Plottable.Components.Alignment.LEFT, "x alignment defaults to \"left\"");
      assert.strictEqual(c.yAlignment(), Plottable.Components.Alignment.TOP, "y alignment defaults to \"top\"");
      c.destroy();
      svg.remove();
    });

    it("can set the alignment", () => {
      let xAlignment = Plottable.Components.Alignment.RIGHT;
      assert.strictEqual(c.xAlignment(xAlignment), c, "returns calling object");
      assert.strictEqual(c.xAlignment(), xAlignment, "x alignment has been set");

      let yAlignment = Plottable.Components.Alignment.BOTTOM;
      assert.strictEqual(c.yAlignment(yAlignment), c, "returns calling object");
      assert.strictEqual(c.yAlignment(), yAlignment, "y alignment has been set");
      c.destroy();
      svg.remove();
    });

    it("throws errors on bad alignments", () => {
      let invalidAlignment = "foo";
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.xAlignment(invalidAlignment), Error,
        "Unsupported alignment", "cannot set an invalid x alignment");
      (<any> assert).throws(() => c.yAlignment(invalidAlignment), Error,
        "Unsupported alignment", "cannot set an invalid y alignment");
      c.destroy();
      svg.remove();
    });
  });

  describe("aligning when of fixed size", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;
    let fixedWidth = 100;
    let fixedHeight = 100;

    beforeEach(() => {
      c = new Mocks.FixedSizeComponent(fixedWidth, fixedHeight);
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.anchor(svg);
    });

    it("translates the origin in accordance with alignment", () => {
      c.xAlignment(Plottable.Components.Alignment.LEFT)
        .yAlignment(Plottable.Components.Alignment.TOP);
      c.computeLayout();
      let expectedOrigin = {x: 0, y: 0};
      assert.deepEqual(c.origin(), expectedOrigin, "top-left component aligns correctly");

      c.xAlignment(Plottable.Components.Alignment.CENTER)
        .yAlignment(Plottable.Components.Alignment.CENTER);
      c.computeLayout();
      expectedOrigin = {x: SVG_WIDTH / 2 - fixedWidth / 2, y: SVG_HEIGHT / 2 - fixedHeight / 2};
      assert.deepEqual(c.origin(), expectedOrigin, "center component aligns correctly");

      c.xAlignment(Plottable.Components.Alignment.RIGHT)
        .yAlignment(Plottable.Components.Alignment.BOTTOM);
      c.computeLayout();
      expectedOrigin = {x: SVG_WIDTH - fixedWidth, y: SVG_HEIGHT - fixedHeight};
      assert.deepEqual(c.origin(), expectedOrigin, "bottom-right component aligns correctly");
      c.destroy();
      svg.remove();
    });
  });

  describe("calculating the minimum requested space", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("does not request any space when offered a width and a height", () => {
      let offeredWidth = 1;
      let offeredHeight = 1;
      let layout = c.requestedSpace(offeredWidth, offeredHeight);
      assert.strictEqual(layout.minWidth, 0, "requested minWidth defaults to 0");
      assert.strictEqual(layout.minHeight, 0, "requested minHeight defaults to 0");
      svg.remove();
    });
  });

  describe("destroying", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("cannot reanchor if destroyed", () => {
      c.renderTo(svg);
      c.destroy();

      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.renderTo(svg), "reuse", "cannot reanchor a destroyed component");
      svg.remove();
    });

    it("performs all of the same operations as detaching", () => {
      let detachCalled = false;
      c.detach = () => {
        detachCalled = true;
        return c;
      };
      c.destroy();
      assert.isTrue(detachCalled, "detach called in destroy invocation");
      svg.remove();
    });
  });

  describe("rendering on the anchored svg", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("performs all of the same operations as renderImmediately()", () => {
      let renderFlag = false;
      c.renderImmediately = () => {
        renderFlag = true;
        return c;
      };
      c.anchor(svg);
      c.computeLayout();
      assert.strictEqual(c.render(), c, "returns calling object");
      assert.isTrue(renderFlag, "renderImmediately() called in render invocation");

      c.destroy();
      svg.remove();
    });

    it("does not render unless allocated space", () => {
      let renderFlag = false;
      c.renderImmediately = () => {
        renderFlag = true;
        return c;
      };
      c.anchor(svg);
      c.render();
      assert.isFalse(renderFlag, "no render until width/height set to nonzero");

      let offeredWidth = 10;
      let offeredHeight = 0;
      c.computeLayout({x: 0, y: 0}, offeredWidth, offeredHeight);
      c.render();
      assert.isTrue(renderFlag, "render still occurs if one of width/height is zero");

      renderFlag = false;
      offeredHeight = 10;
      c.computeLayout({x: 0, y: 0}, offeredWidth, offeredHeight);
      c.render();
      assert.isTrue(renderFlag, "render occurs if width and height are positive");

      c.destroy();
      svg.remove();
    });
  });

  describe("rendering to a DOM node", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;
    let renderFlag: boolean;

    beforeEach(() => {
      renderFlag = false;
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.renderImmediately = () => {
        renderFlag = true;
        return this;
      };
    });

    afterEach(() => {
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.IMMEDIATE);
    });

    it("renders to a DOM node involves anchoring, layout computing, and actual rendering", () => {
      assert.strictEqual(c.renderTo(svg), c, "returns calling object");
      assert.isTrue(svg.classed("plottable"), "anchored to svg");
      assert.strictEqual(c.width(), SVG_WIDTH, "component takes up svg width");
      assert.strictEqual(c.height(), SVG_HEIGHT, "component takes up svg height");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      svg.remove();
    });

    it("only computes layout once", (done) => {
      const div = TestMethods.generateDIV(SVG_WIDTH, SVG_HEIGHT);

      // use async rendering so flushing doesn't happen immediately
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.ANIMATION_FRAME);
      // set up a bar plot with a color scale
      const colorScale = new Plottable.Scales.Color();
      const xScale = new Plottable.Scales.Linear();
      const yScale = new Plottable.Scales.Linear();
      colorScale.autoDomain();
      const barPlot = new Plottable.Plots.Bar();
      barPlot.addDataset(new Plottable.Dataset([{x: 1, y: 1}]));
      barPlot.x((d) => d.x, xScale);
      barPlot.y((d) => d.y, yScale);
      // hook up the colorScale to look at data from the bar plot
      barPlot.attr("fill", (d) => d.x, colorScale);
      // set up a legend to based on the colorScale. Legend will trigger an internal redraw() no the Table
      // a second time; this test ensures that second redraw doesn't compute layout twice
      const legend = new Plottable.Components.Legend(colorScale);
      const table = new Plottable.Components.Table([[barPlot, legend]]);
      const computeLayoutSpy = sinon.spy(table, "computeLayout");

      table.renderTo(div.node() as HTMLElement);

      assert.strictEqual(computeLayoutSpy.callCount, 1, "component only computes layout once");
      table.destroy();
      svg.remove();
      div.remove();
      done();
    });

    it("renders to a node chosen through D3 selection", () => {
      c.renderTo(svg);
      assert.isTrue(svg.classed("plottable"), "anchored to svg");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      svg.remove();
    });

    it("renders to a node chosen through a selector string", () => {
      let svgId = "foo";
      svg.attr("id", svgId);
      c.renderTo(`#${svgId}`);
      assert.isTrue(svg.classed("plottable"), "correct svg chosen");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      svg.remove();
    });

    it("renders to a node chosen through DOM element", () => {
      c.renderTo(svg);
      assert.isTrue(svg.classed("plottable"), "correct svg chosen");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      svg.remove();
    });

    it("errors on inputs that do not evaluate to an SVG element", () => {
      let parent = TestMethods.getSVGParent();
      let div = parent.append("div");

      // HACKHACK #2614: chai-assert.d.ts has the wrong signature
      (<any> assert).throws(() => c.renderTo(div), Error,
        "Plottable requires a valid SVG to renderTo", "rejects selections that don't contain svgs");
      (<any> assert).throws(() => c.renderTo(div), Error,
        "Plottable requires a valid SVG to renderTo", "rejects DOM nodes that are not svgs");
      (<any> assert).throws(() => c.renderTo("#not-an-element"), Error,
        "Plottable requires a valid SVG to renderTo", "rejects strings that don't correspond to DOM elements");
      (<any> assert).throws(() => c.renderTo(d3.select(null)), Error,
        "Plottable requires a valid SVG to renderTo", "rejects empty d3 selections");

      c.destroy();
      div.remove();
      svg.remove();
    });

    it("detaches the component if rendering to a new svg", () => {
      let svgHeight2 = 50;
      let svg2 = TestMethods.generateSVG(SVG_WIDTH, svgHeight2);

      c.renderTo(svg);
      assert.isTrue((<Node> svg.node()).hasChildNodes(), "anchored onto svg");
      assert.strictEqual(c.height(), SVG_HEIGHT, "occupies entire space of svg");

      c.renderTo(svg2);

      assert.isFalse((<Node> svg.node()).hasChildNodes(), "removed from svg");
      assert.isTrue((<Node> svg2.node()).hasChildNodes(), "anchored onto second svg");
      assert.strictEqual(c.height(), svgHeight2, "occupies entire space of second svg");

      c.destroy();
      svg2.remove();
      svg.remove();
    });
  });

  describe("calculating the origin in relation to the svg", () => {

    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("returns origin without a parent", () => {
      assert.deepEqual(c.originToSVG(), c.origin(), "same as origin with no parent");
      c.destroy();
      svg.remove();
    });

    it("is offset by the parent's origin", () => {
      const div = TestMethods.generateDIV(SVG_WIDTH, SVG_HEIGHT);
      let parent = new Plottable.Components.Group([c]);
      parent.anchor(div);
      c.anchor(svg);
      parent.computeLayout({x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      c.computeLayout({x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}, SVG_WIDTH / 4, SVG_HEIGHT / 4);
      let originToSvg = {
        x: parent.origin().x + c.origin().x,
        y: parent.origin().y + c.origin().y,
      };
      assert.deepEqual(c.originToSVG(), originToSvg, "origin offsetted by parents");
      parent.destroy();
      c.destroy();
      svg.remove();
      div.remove();
    });
  });

  describe("calculating the bounds", () => {
    let c: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      c = new Plottable.SVGComponent();
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      c.anchor(svg);
      c.computeLayout();
    });

    it("calculates the bounds relative to the origin", () => {
      assert.deepEqual(c.bounds(), {
        topLeft: c.origin(),
        bottomRight: { x: SVG_WIDTH, y: SVG_HEIGHT }
      });
      c.destroy();
      svg.remove();
    });
  });

  describe("restricting rendering through clipPath", () => {

    let clippedComponent: Plottable.SVGComponent;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      clippedComponent = new Plottable.SVGComponent();
      // HACKHACK #2777: Can't use a Mocks Compnoent here because they descend from a different Plottable,
      // which has the wrong RenderPolicy in coverage.html
      (<any> clippedComponent)._clipPathEnabled = true;
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("generates a clipPath element if it is enabled", () => {
      clippedComponent.anchor(svg);
      let componentElement = svg.select(".component");
      assert.isNotNull(componentElement.attr("clip-path"), "clip-path attribute set");
      clippedComponent.destroy();
      svg.remove();
    });

    it("uses the correct clipPath", () => {
      clippedComponent.renderTo(svg);
      TestMethods.verifyClipPath(clippedComponent);
      svg.remove();
    });

    it("updates the clipPath reference when render()-ed", () => {
      if (window.history == null ||  window.history.replaceState == null) { // not supported on IE9 (http://caniuse.com/#feat=history)
        svg.remove();
        return;
      }

      clippedComponent.renderTo(svg);

      let originalState = window.history.state;
      let originalTitle = document.title;
      let originalLocation = document.location.href;
      window.history.replaceState(null, null, "clipPathTest");
      clippedComponent.render();

      let clipPathId = (<any> clippedComponent)._boxContainer[0][0].firstChild.id;
      let expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
      expectedPrefix = expectedPrefix.replace(/#.*/g, "");
      let expectedClipPathURL = "url(" + expectedPrefix + "#" + clipPathId + ")";

      window.history.replaceState(originalState, originalTitle, originalLocation);

      let normalizeClipPath = (s: string) => s.replace(/"/g, "");
      assert.strictEqual(normalizeClipPath((<any> clippedComponent)._element.attr("clip-path")), expectedClipPathURL,
        "the clipPath reference was updated");
      svg.remove();
    });
  });

  describe("backing element for catching events in Safari", () => {
    let backingClass: string;

    before(() => {
      backingClass = <string> (<any> Plottable.SVGComponent)._SAFARI_EVENT_BACKING_CLASS;
      assert.strictEqual(typeof(backingClass), "string", "test battery was able to extract backing CSS class");
    });

    it("adds an transparent backing rectangle if it is the root Component", () => {
      const component = new Plottable.SVGComponent();
      const svg = TestMethods.generateSVG();
      component.anchor(svg);

      const backing = svg.select(`.${backingClass}`);
      assert.isFalse(backing.empty(), "added a backing element");
      assert.strictEqual(+backing.style("opacity"), 0, "backing element is transparent");

      const backingElementBCR = (<Element> backing.node()).getBoundingClientRect();
      assert.operator(backingElementBCR.width, ">=", TestMethods.numAttr(svg, "width"), "backing is at least as wide as the SVG");
      assert.operator(backingElementBCR.height, ">=", TestMethods.numAttr(svg, "height"), "backing is at least as tall as the SVG");

      svg.remove();
    });

    it("resizes the backing when the SVG size changes", () => {
      const component = new Plottable.SVGComponent();
      const svg = TestMethods.generateSVG();
      component.anchor(svg);

      const expectedWidth = TestMethods.numAttr(svg, "width") + 100;
      const expectedHeight = TestMethods.numAttr(svg, "height") + 100;
      svg.attr({
        width: expectedWidth,
        height: expectedHeight,
      });

      const backing = svg.select(`.${backingClass}`);
      const backingElementBCR = (<Element> backing.node()).getBoundingClientRect();
      assert.operator(backingElementBCR.width, ">=", expectedWidth, "backing is at least as wide as the SVG");
      assert.operator(backingElementBCR.height, ">=", expectedHeight, "backing is at least as tall as the SVG");

      svg.remove();
    });

    it("only adds the backing once", () => {
      const component = new Plottable.SVGComponent();
      const svg = TestMethods.generateSVG();
      component.anchor(svg);
      component.anchor(svg);

      const backings = svg.selectAll(`.${backingClass}`);
      assert.strictEqual(backings.size(), 1, "only one backing was added");

      svg.remove();
    });

    it("removes the backing when detached", () => {
      const component = new Plottable.SVGComponent();
      const svg = TestMethods.generateSVG();
      component.anchor(svg);
      component.detach();

      const backing = svg.select(`.${backingClass}`);
      assert.isTrue(backing.empty(), "backing element was removed");
      svg.remove();
    });

    it("will add a backing even if it's not the first root Component anchored to an svg", () => {
      const component = new Plottable.SVGComponent();
      const svg = TestMethods.generateSVG();
      component.anchor(svg);
      component.detach(); // HACKHACK #3013: need to detach before re-anchoring()

      const backingWithoutComponents = svg.select(`.${backingClass}`);
      assert.isTrue(backingWithoutComponents.empty(), "no backing with no Components");

      const component2 = new Plottable.SVGComponent();
      component2.anchor(svg);
      const backingWithNewRoot = svg.select(`.${backingClass}`);
      assert.isFalse(backingWithNewRoot.empty(), "new root Component recreated backing");

      svg.remove();
    });
  });
});
