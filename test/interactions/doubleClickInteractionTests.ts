///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("DoubleClick", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    describe("onDblClick generic callback", () => {
      var svg: D3.Selection;
      var dblClickInteraction: Plottable.Interaction.DoubleClick;
      var component: Plottable.Component.AbstractComponent;
      var doubleClickedPoint: Plottable.Point = null;
      var dblClickCallback = (p: Plottable.Point) => doubleClickedPoint = p;

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        component = new Plottable.Component.AbstractComponent();
        component.renderTo(svg);

        dblClickInteraction = new Plottable.Interaction.DoubleClick();
        component.registerInteraction(dblClickInteraction);

        dblClickInteraction.onDoubleClick(dblClickCallback);
      });

      afterEach(() => {
        doubleClickedPoint = null;
      });

      it ("onDblClick callback can be retrieved", () => {
        assert.strictEqual(dblClickInteraction.onDoubleClick(), dblClickCallback, "callback can be retrieved");
        svg.remove();
      });

      it ("callback sets correct point on normal case", () => {
        var userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed correct point (mouse)");

        svg.remove();
      });

      it ("callback not called if clicked in different locations", () => {
        var userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        assert.deepEqual(doubleClickedPoint, null, "point never set");

        svg.remove();
      });

      it ("callback not called does not receive dblclick confirmation", () => {
        var userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, null, "point never set");

        svg.remove();
      });

    });
  });
});
