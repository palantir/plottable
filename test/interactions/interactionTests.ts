///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("Interactions", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("can attach/detach interaction to/from component", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var clickInteraction = new Plottable.Interactions.Click();
      clickInteraction.attachTo(component);

      var callbackCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
      };
      clickInteraction.onClick(callback);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      svg.remove();
    });

    it("interactions are reusable", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var clickInteraction = new Plottable.Interactions.Click();
      clickInteraction.attachTo(component);

      var callbackCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
      };
      clickInteraction.onClick(callback);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      svg.remove();
    });

    it("attaching interaction to a second component detaches it from the first component", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var clickInteraction = new Plottable.Interactions.Click();
      clickInteraction.attachTo(component);

      var callbackCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
      };
      clickInteraction.onClick(callback);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      svg.remove();
    });
  });
});
