///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("KeyInteraction", () => {
    var svg: d3.Selection<void>;
    var component: Plottable.Component;
    var keyInteraction: Plottable.Interactions.Key;
    var aCode: number;
    var bCode: number;

    var aCallbackCalled: boolean;
    var bCallbackCalled: boolean;
    var aCallback: (asd: number) => void;
    var bCallback: (asd: number) => void;
    var $target: JQuery;

    beforeEach(() => {
      aCode = 65;
      bCode = 66;
      component = new Plottable.Component();
      svg = TestMethods.generateSVG(400, 400);
      keyInteraction = new Plottable.Interactions.Key();
      aCallback = () => aCallbackCalled = true;
      bCallback = () => bCallbackCalled = true;
      component.renderTo(svg);
      $target = $(component.background().node());
      aCallbackCalled = false;
      bCallbackCalled = false;
    });

    afterEach(() => {
      svg.remove();
    });

    describe("onKeyPress", () => {
      beforeEach(() => {
        keyInteraction.onKeyPress(aCode, aCallback);
        keyInteraction.onKeyPress(bCode, bCallback);
        keyInteraction.attachTo(component);
      });

      afterEach(() => {
        keyInteraction.offKeyPress(aCode, aCallback);
        keyInteraction.onKeyPress(bCode, bCallback);
      });

      it("only fires callback for \"a\" when \"a\" key is pressed", () => {
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keydown", { keyCode: aCode });
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
        assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");
      });

      it("only fires callback for \"b\" when \"b\" key is pressed", () => {
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keydown", { keyCode: bCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"b\" key was pressed");
        assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");
      });

      it("does not fire callback when the key is pressed outside of the component", () => {
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        $target.simulate("keydown", { keyCode: aCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when not moused over the Component");
      });

      it("canceling keyPress callbacks is possible", () => {
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keydown", { keyCode: aCode });
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aCode, aCallback);
        aCallbackCalled = false;
        $target.simulate("keydown", { keyCode: aCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyPress(aCode, aCallback);
        $target.simulate("keydown", { keyCode: aCode });
        assert.isTrue(aCallbackCalled, "callback for \"a\" was properly connected back to the interaction");
      });

      it("multiple keyPress callbacks are possible", () => {
          var aCallback1Called = false;
          var aCallback1 = () => aCallback1Called = true;
          var aCallback2Called = false;
          var aCallback2 = () => aCallback2Called = true;

          keyInteraction.onKeyPress(aCode, aCallback1);
          keyInteraction.onKeyPress(aCode, aCallback2);

          TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
          $target.simulate("keydown", { keyCode: aCode });
          assert.isTrue(aCallback1Called, "callback 1 for \"a\" was called when \"a\" key was pressed");
          assert.isTrue(aCallback1Called, "callback 2 for \"b\" was called when \"a\" key was pressed");

          keyInteraction.offKeyPress(aCode, aCallback1);
          aCallback1Called = false;
          aCallback2Called = false;
          $target.simulate("keydown", { keyCode: aCode });
          assert.isFalse(aCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
          assert.isTrue(aCallback2Called, "callback 2 for \"a\" is still connected to the interaction");
      });
    });

    describe("onKeyRelease", () => {
      beforeEach(() => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.onKeyRelease(bCode, bCallback);
        keyInteraction.attachTo(component);
      });

      afterEach(() => {
        keyInteraction.offKeyRelease(aCode, aCallback);
        keyInteraction.offKeyRelease(bCode, bCallback);
      });

      it("doesn't fire callback if key was released without being pressed", () => {
        $target.simulate("keyup", { keyCode: aCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");
      });

      it("fires callback if key was released after being pressed", () => {
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keydown", { keyCode: aCode });
        $target.simulate("keyup", { keyCode: aCode });
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");
      });

      it("only fires callback for key that has been released", () => {
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keydown", { keyCode: bCode });
        $target.simulate("keyup", { keyCode: bCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"b\" key was released");
        assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was released");
      });

      it("fires callback if key was released outside of component after being pressed inside", () => {
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keydown", { keyCode: aCode });
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        $target.simulate("keyup", { keyCode: aCode });
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");
      });

      it("doesn't fire callback if  key was released after being pressed outside", () => {
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        $target.simulate("keydown", { keyCode: aCode });
        $target.simulate("keyup", { keyCode: aCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");
      });

      it("doesn't fire callback  key was released inside after being pressed outside", () => {
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        $target.simulate("keydown", { keyCode: aCode });
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        $target.simulate("keyup", { keyCode: aCode });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");
      });

      it("canceling keyRelease callbacks is possible", () => {
          TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
          $target.simulate("keydown", { keyCode: aCode });
          $target.simulate("keyup", { keyCode: aCode });
          assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

          keyInteraction.offKeyRelease(aCode, aCallback);
          aCallbackCalled = false;
          $target.simulate("keydown", { keyCode: aCode });
          $target.simulate("keyup", { keyCode: aCode });
          assert.isFalse(aCallbackCalled, "callback for \"a\" was disconnected from the interaction");

          keyInteraction.onKeyRelease(aCode, aCallback);
          $target.simulate("keydown", { keyCode: aCode });
          $target.simulate("keyup", { keyCode: aCode });
          assert.isTrue(aCallbackCalled, "callback for \"a\" was properly connected back to the interaction");
      });

      it("multiple keyRelease callbacks are possible", () => {
          var aCallback1Called = false;
          var aCallback1 = () => aCallback1Called = true;
          var aCallback2Called = false;
          var aCallback2 = () => aCallback2Called = true;

          keyInteraction.onKeyRelease(aCode, aCallback1);
          keyInteraction.onKeyRelease(aCode, aCallback2);

          TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
          $target.simulate("keydown", { keyCode: aCode });
          $target.simulate("keyup", { keyCode: aCode });
          assert.isTrue(aCallback1Called, "callback 1 for \"a\" was called when \"a\" key was released");
          assert.isTrue(aCallback1Called, "callback 2 for \"b\" was called when \"a\" key was released");

          keyInteraction.offKeyRelease(aCode, aCallback1);
          aCallback1Called = false;
          aCallback2Called = false;
          $target.simulate("keydown", { keyCode: aCode });
          $target.simulate("keyup", { keyCode: aCode });
          assert.isFalse(aCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
          assert.isTrue(aCallback2Called, "callback 2 for \"a\" is still connected to the interaction");
      });
    });
  });
});
