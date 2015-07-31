///<reference path="../testReference.ts" />
/* tslint:disable: no-var-keyword */

describe("Interactions", () => {
  describe("KeyInteraction", () => {
    it("Triggers appropriate callback for the key pressed", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var keyInteraction = new Plottable.Interactions.Key();

      var aCode = 65; // "a" key
      var bCode = 66; // "b" key

      var aCallbackCalled = false;
      var aCallback = () => aCallbackCalled = true;
      var bCallbackCalled = false;
      var bCallback = () => bCallbackCalled = true;

      keyInteraction.onKeyPress(aCode, aCallback);
      keyInteraction.onKeyPress(bCode, bCallback);
      keyInteraction.attachTo(component);

      var $target = $(component.background().node());

      TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
      $target.simulate("keydown", { keyCode: aCode });
      assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
      assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");

      aCallbackCalled = false;
      $target.simulate("keydown", { keyCode: bCode });
      assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"b\" key was pressed");
      assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");

      TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
      aCallbackCalled = false;
      $target.simulate("keydown", { keyCode: aCode });
      assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when not moused over the Component");

      svg.remove();
    });

    it("appropriate keyCode is sent to the callback", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var keyInteraction = new Plottable.Interactions.Key();

      var bCode = 66; // "b" key

      var bCallbackCalled = false;
      var bCallback = (keyCode: number) => {
        bCallbackCalled = true;
        assert.strictEqual(keyCode, bCode, "keyCode 65(a) was sent to the callback");
      };

      keyInteraction.onKeyPress(bCode, bCallback);

      keyInteraction.attachTo(component);

      var $target = $(component.background().node());

      TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
      $target.simulate("keydown", { keyCode: bCode });
      assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");

      svg.remove();
    });

    it("canceling callbacks is possible", () => {
        var svg = TestMethods.generateSVG(400, 400);
        var component = new Plottable.Component();
        component.renderTo(svg);

        var keyInteraction = new Plottable.Interactions.Key();

        var aCode = 65; // "a" key

        var aCallbackCalled = false;
        var aCallback = () => aCallbackCalled = true;

        keyInteraction.onKeyPress(aCode, aCallback);

        keyInteraction.attachTo(component);

        var $target = $(component.background().node());

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

        svg.remove();
    });

    it("multiple callbacks are possible", () => {
        var svg = TestMethods.generateSVG(400, 400);
        var component = new Plottable.Component();
        component.renderTo(svg);

        var keyInteraction = new Plottable.Interactions.Key();

        var aCode = 65; // "a" key

        var aCallback1Called = false;
        var aCallback1 = () => aCallback1Called = true;
        var aCallback2Called = false;
        var aCallback2 = () => aCallback2Called = true;

        keyInteraction.onKeyPress(aCode, aCallback1);
        keyInteraction.onKeyPress(aCode, aCallback2);
        keyInteraction.attachTo(component);

        var $target = $(component.background().node());

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

        svg.remove();
    });
  });
});
