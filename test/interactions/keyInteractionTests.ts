///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("KeyInteraction", () => {
    it("Triggers appropriate callback for the key pressed", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let component = new Plottable.Component();
      component.renderTo(svg);

      let keyInteraction = new Plottable.Interactions.Key();

      let aCode = 65; // "a" key
      let bCode = 66; // "b" key

      let aCallbackCalled = false;
      let aCallback = () => aCallbackCalled = true;
      let bCallbackCalled = false;
      let bCallback = () => bCallbackCalled = true;

      keyInteraction.onKeyPress(aCode, aCallback);
      keyInteraction.onKeyPress(bCode, bCallback);
      keyInteraction.attachTo(component);

      let $target = $(component.background().node());

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
      let svg = TestMethods.generateSVG(400, 400);
      let component = new Plottable.Component();
      component.renderTo(svg);

      let keyInteraction = new Plottable.Interactions.Key();

      let bCode = 66; // "b" key

      let bCallbackCalled = false;
      let bCallback = (keyCode: number) => {
        bCallbackCalled = true;
        assert.strictEqual(keyCode, bCode, "keyCode 65(a) was sent to the callback");
      };

      keyInteraction.onKeyPress(bCode, bCallback);

      keyInteraction.attachTo(component);

      let $target = $(component.background().node());

      TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
      $target.simulate("keydown", { keyCode: bCode });
      assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");

      svg.remove();
    });

    it("canceling callbacks is possible", () => {
        let svg = TestMethods.generateSVG(400, 400);
        let component = new Plottable.Component();
        component.renderTo(svg);

        let keyInteraction = new Plottable.Interactions.Key();

        let aCode = 65; // "a" key

        let aCallbackCalled = false;
        let aCallback = () => aCallbackCalled = true;

        keyInteraction.onKeyPress(aCode, aCallback);

        keyInteraction.attachTo(component);

        let $target = $(component.background().node());

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
        let svg = TestMethods.generateSVG(400, 400);
        let component = new Plottable.Component();
        component.renderTo(svg);

        let keyInteraction = new Plottable.Interactions.Key();

        let aCode = 65; // "a" key

        let aCallback1Called = false;
        let aCallback1 = () => aCallback1Called = true;
        let aCallback2Called = false;
        let aCallback2 = () => aCallback2Called = true;

        keyInteraction.onKeyPress(aCode, aCallback1);
        keyInteraction.onKeyPress(aCode, aCallback2);
        keyInteraction.attachTo(component);

        let $target = $(component.background().node());

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
