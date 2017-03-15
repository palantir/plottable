import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import * as Mocks from "../mocks";
import * as TestMethods from "../testMethods";

describe("Component", () => {
  let DIV_WIDTH = 400;
  let DIV_HEIGHT = 300;

  describe("anchoring", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("adds itself as a child element of the input selection", () => {
      assert.strictEqual(c.anchor(div), c, "setter returns calling object");
      assert.strictEqual(<SVGElement> c.rootElement().node(),
        div.node(), "component DOM elements are children of div element");
      c.destroy();
      div.remove();
    });

    it("adds default selections in the correct order", () => {
      c.anchor(div);
      assert.isFalse(c.foreground().empty(), "foreground exists in the DOM");
      assert.isFalse(c.background().empty(), "background exists in the DOM");
      assert.isFalse(c.content().empty(), "content exists in the DOM");
      assert.isFalse(c.background().select(".background-fill").empty(), "background fill container exists in the DOM");

      let componentElement = div.select(".component");
      let containerNodes = componentElement.selectAll<Element, any>("svg").nodes();
      assert.strictEqual(containerNodes[0], c.background().node(), "background at the back");
      assert.strictEqual(containerNodes[1], c.content().node(), "content at the middle");
      assert.strictEqual(containerNodes[2], c.foreground().node(), "foreground at the front");
      assert.strictEqual(containerNodes[3], componentElement.select(".box-container").node(), "boxes at front of foreground");
      c.destroy();
      div.remove();
    });

    it("sets the foreground-container and box-container pointer-events to none", () => {
      c.anchor(div);
      const foreground = c.foreground().node();
      const boxContainer = c.element().select(".box-container").node();
      let pointerEventForeground = window.getComputedStyle(<Element>foreground).pointerEvents;
      let pointerEventBox = window.getComputedStyle(<Element>boxContainer).pointerEvents;
      assert.strictEqual(pointerEventForeground, "none", "foreground-container's pointer-event is set to none");
      assert.strictEqual(pointerEventBox, "none", "box-container's pointer-event is set to none");
      c.destroy();
      div.remove();
    });

    it("classes the input with 'plottable' if it is a div", () => {
      c.anchor(div);
      assert.isTrue(div.classed("plottable"), "<div> was given \"plottable\" CSS class");
      c.destroy();
      div.remove();
    });

    it("allows mouse events to operate if the component is visible", () => {
      c.anchor(div);
      let computedStyle = window.getComputedStyle(<Element>div.node());
      assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblefill",
        "\"pointer-events\" style set to \"visiblefill\"");
      c.destroy();
      div.remove();
    });

    it("can switch which element it is anchored to", () => {
      c.anchor(div);

      let div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      c.anchor(div2);
      assert.notStrictEqual(<SVGElement> c.rootElement().node(),
        div.node(), "component DOM elements are not children of div element");
      assert.strictEqual(<SVGElement> c.rootElement().node(),
        div2.node(), "component DOM elements are children of second div element");
      c.destroy();
      div2.remove();
      div.remove();
    });

    it("removes DOM elements in previous div when anchoring to a different div", () => {
      c.anchor(div);
      let div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      c.anchor(div2);
      assert.isTrue(div.select("svg").empty(), "previous div element should not have any group child nodes");
      assert.isFalse(div2.select("svg").empty(), "new div element should have group child nodes");
      c.destroy();
      div.remove();
      div2.remove();
    });

    it("can undergo set behavior upon anchoring", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.Component;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
        passedComponent = component;
      };
      assert.strictEqual(c.onAnchor(callback), c, "setter returns calling object");
      c.anchor(div);
      assert.isTrue(callbackCalled, "callback was called on anchoring");
      assert.strictEqual(passedComponent, c, "callback was passed anchored Component");

      c.destroy();
      div.remove();
    });

    it("undergoes on-anchor behavior if already anchored", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.Component;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.anchor(div);
      c.onAnchor(callback);
      assert.isTrue(callbackCalled, "callback was immediately if Component was already anchored");
      assert.strictEqual(passedComponent, c, "callback was passed the Component that anchored");
      c.destroy();
      div.remove();
    });

    it("calls callbacks upon anchoring to different div", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.Component;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.onAnchor(callback);
      c.anchor(div);

      let div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      callbackCalled = false;
      c.anchor(div2);
      assert.isTrue(callbackCalled, "callback was called on anchoring to a new <div>");
      assert.strictEqual(passedComponent, c, "callback was passed anchored Component");

      c.destroy();
      div.remove();
      div2.remove();
    });

    it("can remove set behavior the component would have underwent upon anchoring", () => {
      let callbackCalled = false;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
      };
      c.onAnchor(callback);
      assert.strictEqual(c.offAnchor(callback), c, "setter returns calling object");
      c.anchor(div);
      assert.isFalse(callbackCalled, "removed callback is not called");

      c.destroy();
      div.remove();
    });

    it("overflow: visible by default", () => {
      c.anchor(div);
      const styles = window.getComputedStyle(<Element> c.content().node());
      assert.strictEqual(styles.getPropertyValue("overflow"), "visible", "content has overflow: visible")

      c.destroy();
      div.remove();
    });

    it("sets overflow: hidden when _overflowHidden is set" ,() => {
      (<any> c)._overflowHidden = true;
      c.anchor(div);
      const styles = window.getComputedStyle(<Element> c.content().node());
      assert.strictEqual(styles.getPropertyValue("overflow"), "hidden", "content has overflow: hidden");

      c.destroy();
      div.remove();
    });
  });

  describe("detaching", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("can remove its own DOM elements", () => {
      c.renderTo(div);
      assert.isTrue((<Node> div.node()).hasChildNodes(), "the div has children");
      c.detach();
      assert.isFalse((<Node> div.node()).hasChildNodes(), "the div has no children");

      c.destroy();
      div.remove();
    });

    it("does not error if not already anchored", () => {
      assert.doesNotThrow(() => c.detach(), Error, "does not throw error if detach() called before anchor()");
      c.destroy();
      div.remove();
    });

    it("sets its parent to null when detaching", () => {
      let parent = new Plottable.Components.Group([c]);
      c.detach();
      assert.isNull(c.parent(), "parent removed upon detaching");
      parent.destroy();
      c.destroy();
      div.remove();
    });

    it("can undergo set behavior upon detaching", () => {
      c.renderTo(div);

      let callbackCalled = false;
      let passedComponent: Plottable.Component;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
        passedComponent = component;
      };
      assert.strictEqual(c.onDetach(callback), c, "setter returns calling object");
      c.detach();
      assert.isTrue(callbackCalled, "callback was called when the Component was detached");
      assert.strictEqual(passedComponent, c, "callback was passed the Component that detached");
      c.destroy();
      div.remove();
    });

    it("calls callbacks upon detaching even if not anchored", () => {
      let callbackCalled = false;
      let passedComponent: Plottable.Component;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
        passedComponent = component;
      };
      c.onDetach(callback);

      c.detach();
      assert.isTrue(callbackCalled, "callback still called");
      assert.strictEqual(passedComponent, c, "callback passed the Component that detached");
      c.destroy();
      div.remove();
    });

    it("can remove callbacks that would have been called upon detaching", () => {
      let callbackCalled = false;
      let callback = (component: Plottable.Component) => {
        callbackCalled = true;
      };
      c.onDetach(callback);
      assert.strictEqual(c.offDetach(callback), c, "setter calls calling object");
      c.renderTo(div);
      c.detach();
      assert.isFalse(callbackCalled, "removed callback is not called");
      c.destroy();
      div.remove();
    });
  });

  describe("parent container", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("can set its parent to a container that contains this component", () => {
      let acceptingContainer: any = {
        has: () => true,
      };
      assert.strictEqual(c.parent(acceptingContainer), c, "setter returns calling object");
      assert.strictEqual(c.parent(), acceptingContainer, "parent set if parent contains component");
      c.destroy();
      div.remove();
    });

    it("throws an error when the input parent does not contain this component", () => {
      let rejectingContainer: any = {
        has: (component: Plottable.Component) => false,
      };
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.parent(rejectingContainer), Error,
        "invalid parent", "error thrown for parent not containing child");
      c.destroy();
      div.remove();
    });
  });

  describe("css classes", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("can add css classes", () => {
      let className = "foo";
      assert.strictEqual(c.addClass(className), c, "setter returns calling object");
      assert.isTrue(c.hasClass(className), "component has added css class");

      c.renderTo(div);

      assert.isFalse(div.select(`.${className}`).empty(), "css class added to DOM element");

      c.destroy();
      div.remove();
    });

    it("can remove css classes", () => {
      let className = "foo";
      c.addClass(className);
      assert.isTrue(c.hasClass(className), "component has added css class");
      c.renderTo(div);

      assert.strictEqual(c.removeClass(className), c, "setter returns calling object");
      assert.isFalse(c.hasClass(className), "component no longer has css class");

      assert.isTrue(div.select(`.${className}`).empty(), "css class removed from DOM element");

      c.destroy();
      div.remove();
    });
  });

  describe("computing the layout", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("defaults to take up all space", () => {
      assert.isFalse(c.fixedWidth(), "will take all available width");
      assert.isFalse(c.fixedHeight(), "will take all available height");

      c.anchor(div);
      c.computeLayout();
      assert.strictEqual(c.width() , DIV_WIDTH, "takes all available width");
      assert.strictEqual(c.height(), DIV_HEIGHT, "takes all available height");
      let origin = c.origin();
      assert.strictEqual(origin.x, 0 , "x origin defaults to leftmost");
      assert.strictEqual(origin.y, 0 , "y origin defaults to topmost");

      c.destroy();
      div.remove();
    });

    it("does not allow the origin object to be modified", () => {
      c.renderTo(div);
      let receivedOrigin = c.origin();
      let delta = 10;
      receivedOrigin.x += delta;
      receivedOrigin.y += delta;
      assert.notDeepEqual(c.origin(), receivedOrigin, "underlying origin object cannot be modified");
      c.destroy();
      div.remove();
    });

    it("recomputes the layout if the environment changes", () => {
      c.anchor(div);
      c.computeLayout();
      assert.strictEqual(c.width() , DIV_WIDTH, "takes all available width");
      assert.strictEqual(c.height(), DIV_HEIGHT, "takes all available height");

      div.style("width", 2 * DIV_WIDTH + "px").style("height", 2 * DIV_HEIGHT + "px");
      c.computeLayout();
      assert.strictEqual(c.width() , 2 * DIV_WIDTH, "updated to take new available width");
      assert.strictEqual(c.height(), 2 * DIV_HEIGHT, "updated to take new available height");

      c.destroy();
      div.remove();
    });

    it("can compute the layout based on CSS", () => {
      let parentWidth = 400;
      let parentHeight = 200;
      // Manually size parent
      let parent = d3.select(<Element> div.node().parentNode);
      parent.style("width", `${parentWidth}px`);
      parent.style("height", `${parentHeight}px`);

      // Remove width/height on div directly
      div.style("width", null).style("height", null);
      c.anchor(div);
      c.computeLayout();
      assert.strictEqual(c.width(), parentWidth, "defaults to width of parent");
      assert.strictEqual(c.height(), parentHeight, "defaults to height of parent");
      let origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");

      let divWidthPercentage = 50;
      let divHeightPercentage = 50;
      div.style("width", `${divWidthPercentage}%`).style("height", `${divHeightPercentage}%`);
      c.computeLayout();

      assert.strictEqual(c.width(), parentWidth * divWidthPercentage / 100, "width computed to be percentage of div width");
      assert.strictEqual(c.height(), parentHeight * divHeightPercentage / 100, "height computed to be percentage of div height");
      origin = c.origin();
      assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
      assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      div.remove();
    });

    it("throws an error when computing the layout on an unanchored component", () => {
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.computeLayout(), Error, "anchor() must be called before",
        "cannot compute layout on an unanchored component");
      div.remove();
    });

    it("computes the layout of the component based on input", () => {
      let origin = {
        x: 10,
        y: 20,
      };
      let width = 100;
      let height = 200;
      c.anchor(div);
      c.computeLayout(origin, width, height);

      assert.strictEqual(c.origin().x, origin.x, "x origin set");
      assert.strictEqual(c.origin().y, origin.y, "y origin set");
      assert.strictEqual(c.width() , width, "width set");
      assert.strictEqual(c.height(), height, "height set");

      let componentElement = div.select(".component");
      let translate = [parseFloat(componentElement.style("left")), parseFloat(componentElement.style("top"))];
      assert.deepEqual(translate, [origin.x, origin.y], "the element translated appropriately");
      let backgroundFillBox = div.select(".background-fill");
      assert.closeTo(TestMethods.numAttr(backgroundFillBox, "width"),
        width, window.Pixel_CloseTo_Requirement, "box width set to computed width");
      assert.closeTo(TestMethods.numAttr(backgroundFillBox, "height"),
        height, window.Pixel_CloseTo_Requirement, "box height set to computed height");
      c.destroy();
      div.remove();
    });

    it("allows for recomputing the layout and rendering", () => {
      c.renderTo(div);
      c.computeLayout({x: DIV_WIDTH / 4, y: DIV_HEIGHT / 4}, DIV_WIDTH / 4, DIV_HEIGHT / 4);
      c.redraw();
      let origin = c.origin();
      assert.deepEqual(origin, {x: 0, y: 0}, "origin reset");
      let componentElement = div.select(".component");
      let translate = [parseFloat(componentElement.style("left")), parseFloat(componentElement.style("top"))];
      assert.deepEqual(translate, [origin.x, origin.y], "DOM element rendered at new origin");
      c.destroy();
      div.remove();
    });

    it("calls onResize callback if callback is registered", (done) => {
      let origin = {
        x: 10,
        y: 20,
      };
      let width = 100;
      let height = 200;
      c.anchor(div);

      c.onResize((size: { height: number, width: number }) => {
        assert.deepEqual(size, { width, height });
        c.destroy();
        div.remove();
        done();
      });

      c.computeLayout(origin, width, height);
    });
  });

  describe("computing the layout when of fixed size", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let fixedWidth = 100;
    let fixedHeight = 100;

    beforeEach(() => {
      c = new Mocks.FixedSizeComponent(fixedWidth, fixedHeight);
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      c.anchor(div);
    });

    it("gives the component the fixed space if offered more space", () => {
      c.computeLayout();
      assert.strictEqual(c.width(), fixedWidth, "width bounded to fixed width");
      assert.strictEqual(c.height(), fixedHeight, "height bounded to fixed height");
      c.destroy();
      div.remove();
    });

    it("gives the component the offered space if it is less than the fixed space", () => {
      let restrictedWidth = fixedWidth / 2;
      let restrictedHeight = fixedHeight / 2;
      c.computeLayout({x: 0, y: 0}, restrictedWidth, restrictedHeight);
      assert.strictEqual(c.width(), restrictedWidth, "width bounded to restricted width");
      assert.strictEqual(c.height(), restrictedHeight, "height bounded to restricted height");
      c.destroy();
      div.remove();
    });

    it("does not translate if more space was requested than offered", () => {
      let requestedWidth = DIV_WIDTH * 2;
      let requestedHeight = DIV_HEIGHT * 2;
      c.destroy();
      c = new Mocks.FixedSizeComponent(requestedWidth, requestedHeight);
      let t = new Plottable.Components.Table([[c]]);
      t.renderTo(div);

      let componentElement = div.select(".component");
      let translate = [parseFloat(componentElement.style("left")), parseFloat(componentElement.style("top"))];
      assert.deepEqual(translate, [0, 0], "the element was not translated");
      div.remove();
    });
  });

  describe("aligning", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("defaults to a top and left alignment", () => {
      assert.strictEqual(c.xAlignment(), Plottable.Components.Alignment.LEFT, "x alignment defaults to \"left\"");
      assert.strictEqual(c.yAlignment(), Plottable.Components.Alignment.TOP, "y alignment defaults to \"top\"");
      c.destroy();
      div.remove();
    });

    it("can set the alignment", () => {
      let xAlignment = Plottable.Components.Alignment.RIGHT;
      assert.strictEqual(c.xAlignment(xAlignment), c, "returns calling object");
      assert.strictEqual(c.xAlignment(), xAlignment, "x alignment has been set");

      let yAlignment = Plottable.Components.Alignment.BOTTOM;
      assert.strictEqual(c.yAlignment(yAlignment), c, "returns calling object");
      assert.strictEqual(c.yAlignment(), yAlignment, "y alignment has been set");
      c.destroy();
      div.remove();
    });

    it("throws errors on bad alignments", () => {
      let invalidAlignment = "foo" as any;
      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.xAlignment(invalidAlignment), Error,
        "Unsupported alignment", "cannot set an invalid x alignment");
      (<any> assert).throws(() => c.yAlignment(invalidAlignment), Error,
        "Unsupported alignment", "cannot set an invalid y alignment");
      c.destroy();
      div.remove();
    });
  });

  describe("aligning when of fixed size", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let fixedWidth = 100;
    let fixedHeight = 100;

    beforeEach(() => {
      c = new Mocks.FixedSizeComponent(fixedWidth, fixedHeight);
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      c.anchor(div);
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
      expectedOrigin = {x: DIV_WIDTH / 2 - fixedWidth / 2, y: DIV_HEIGHT / 2 - fixedHeight / 2};
      assert.deepEqual(c.origin(), expectedOrigin, "center component aligns correctly");

      c.xAlignment(Plottable.Components.Alignment.RIGHT)
        .yAlignment(Plottable.Components.Alignment.BOTTOM);
      c.computeLayout();
      expectedOrigin = {x: DIV_WIDTH - fixedWidth, y: DIV_HEIGHT - fixedHeight};
      assert.deepEqual(c.origin(), expectedOrigin, "bottom-right component aligns correctly");
      c.destroy();
      div.remove();
    });
  });

  describe("calculating the minimum requested space", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("does not request any space when offered a width and a height", () => {
      let offeredWidth = 1;
      let offeredHeight = 1;
      let layout = c.requestedSpace(offeredWidth, offeredHeight);
      assert.strictEqual(layout.minWidth, 0, "requested minWidth defaults to 0");
      assert.strictEqual(layout.minHeight, 0, "requested minHeight defaults to 0");
      div.remove();
    });
  });

  describe("destroying", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("cannot reanchor if destroyed", () => {
      c.renderTo(div);
      c.destroy();

      // HACKHACK: https://github.com/palantir/plottable/issues/2661 Cannot assert errors being thrown with description
      (<any> assert).throws(() => c.renderTo(div), "reuse", "cannot reanchor a destroyed component");
      div.remove();
    });

    it("performs all of the same operations as detaching", () => {
      let detachCalled = false;
      c.detach = () => {
        detachCalled = true;
        return c;
      };
      c.destroy();
      assert.isTrue(detachCalled, "detach called in destroy invocation");
      div.remove();
    });
  });

  describe("rendering on the anchored div", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("performs all of the same operations as renderImmediately()", () => {
      let renderFlag = false;
      c.renderImmediately = () => {
        renderFlag = true;
        return c;
      };
      c.anchor(div);
      c.computeLayout();
      assert.strictEqual(c.render(), c, "returns calling object");
      assert.isTrue(renderFlag, "renderImmediately() called in render invocation");

      c.destroy();
      div.remove();
    });

    it("does not render unless allocated space", () => {
      let renderFlag = false;
      c.renderImmediately = () => {
        renderFlag = true;
        return c;
      };
      c.anchor(div);
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
      div.remove();
    });
  });

  describe("rendering to a DOM node", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let renderFlag: boolean;

    beforeEach(() => {
      renderFlag = false;
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      c.renderImmediately = () => {
        renderFlag = true;
        return this;
      };
    });

    afterEach(() => {
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.immediate);
    });

    it("renders to a DOM node involves anchoring, layout computing, and actual rendering", () => {
      assert.strictEqual(c.renderTo(div), c, "returns calling object");
      assert.isTrue(div.classed("plottable"), "anchored to div");
      assert.strictEqual(c.width(), DIV_WIDTH, "component takes up div width");
      assert.strictEqual(c.height(), DIV_HEIGHT, "component takes up div height");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      div.remove();
    });

    it("only computes layout once", (done) => {
      // use async rendering so flushing doesn't happen immediately
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.animationFrame);
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

      table.renderTo(div);

      assert.strictEqual(computeLayoutSpy.callCount, 1, "component only computes layout once");
      table.destroy();
      div.remove();
      done();
    });

    it("renders to a node chosen through D3 selection", () => {
      c.renderTo(div);
      assert.isTrue(div.classed("plottable"), "anchored to div");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      div.remove();
    });

    it("renders to a node chosen through a selector string", () => {
      let divId = "foo";
      div.attr("id", divId);
      c.renderTo(`#${divId}`);
      assert.isTrue(div.classed("plottable"), "correct div chosen");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      div.remove();
    });

    it("renders to a node chosen through DOM element", () => {
      c.renderTo(div.node());
      assert.isTrue(div.classed("plottable"), "correct div chosen");
      assert.isTrue(renderFlag, "component has rendered");
      c.destroy();
      div.remove();
    });

    it("errors on inputs that do not evaluate to an Element", () => {
      (<any> assert).throws(() => c.renderTo("#not-an-element"), Error,
        "Plottable requires a valid Element to renderTo", "rejects strings that don't correspond to DOM elements");
      (<any> assert).throws(() => c.renderTo(d3.select(null) as any), Error,
        "Plottable requires a valid Element to renderTo", "rejects empty d3 selections");
      c.destroy();
      div.remove();
    });

    it("detaches the component if rendering to a new div", () => {
      let divHeight2 = 50;
      let div2 = TestMethods.generateDiv(DIV_WIDTH, divHeight2);

      c.renderTo(div);
      assert.isTrue((<Node> div.node()).hasChildNodes(), "anchored onto div");
      assert.strictEqual(c.height(), DIV_HEIGHT, "occupies entire space of div");

      c.renderTo(div2);

      assert.isFalse((<Node> div.node()).hasChildNodes(), "removed from div");
      assert.isTrue((<Node> div2.node()).hasChildNodes(), "anchored onto second div");
      assert.strictEqual(c.height(), divHeight2, "occupies entire space of second div");

      c.destroy();
      div2.remove();
      div.remove();
    });
  });

  describe("calculating the origin in relation to the div", () => {

    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("returns origin without a parent", () => {
      assert.deepEqual(c.originToRoot(), c.origin(), "same as origin with no parent");
      c.destroy();
      div.remove();
    });

    it("is offset by the parent's origin", () => {
      let parent = new Plottable.Components.Group([c]);
      parent.anchor(div);
      c.anchor(div);
      parent.computeLayout({x: DIV_WIDTH / 4, y: DIV_HEIGHT / 4}, DIV_WIDTH / 2, DIV_HEIGHT / 2);
      c.computeLayout({x: DIV_WIDTH / 4, y: DIV_HEIGHT / 4}, DIV_WIDTH / 4, DIV_HEIGHT / 4);
      let originToRoot = {
        x: parent.origin().x + c.origin().x,
        y: parent.origin().y + c.origin().y,
      };
      assert.deepEqual(c.originToRoot(), originToRoot, "origin offsetted by parents");
      parent.destroy();
      c.destroy();
      div.remove();
    });
  });

  describe("calculating the bounds", () => {
    let c: Plottable.Component;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      c = new Plottable.Component();
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      c.anchor(div);
      c.computeLayout();
    });

    it("calculates the bounds relative to the origin", () => {
      assert.deepEqual(c.bounds(), {
        topLeft: c.origin(),
        bottomRight: { x: DIV_WIDTH, y: DIV_HEIGHT }
      });
      c.destroy();
      div.remove();
    });
  });
});
