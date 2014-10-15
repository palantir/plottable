///<reference path="../testReference.ts" />

var assert = chai.assert;

class TestHoverable extends Plottable.Component.AbstractComponent
                    implements Plottable.Interaction.Hoverable {
  public _hoverOverComponent(p: Plottable.Point) {
    // cast-override
  }

  public _hoverOutComponent(p: Plottable.Point) {
    // cast-override
  }

  public _doHover(p: Plottable.Point): Plottable.Interaction.HoverData {
    var data: string[] = [];
    if (p.x < 250) {
      data.push("left");
    }
    if (p.x > 150) {
      data.push("right");
    }
    return {
      data: data,
      selection: this._element
    };
  }
}


describe("Interactions", () => {
  describe("Hover", () => {
    it("correctly triggers callbacks", () => {
      var svg = generateSVG();
      var testTarget = new TestHoverable();
      testTarget.classed("test-hoverable", true);
      testTarget.renderTo(svg);

      var hoverInteraction = new Plottable.Interaction.Hover();

      var lastOverData: any[];
      var overCallbackCalled = false;
      hoverInteraction.onHoverOver((hd: Plottable.Interaction.HoverData) => {
        overCallbackCalled = true;
        lastOverData = hd.data;
      });

      var outCallbackCalled = false;
      var lastOutData: any[];
      hoverInteraction.onHoverOut((hd: Plottable.Interaction.HoverData) => {
        outCallbackCalled = true;
        lastOutData = hd.data;
      });

      testTarget.registerInteraction(hoverInteraction);

      var hitbox = testTarget._element.select(".hit-box");

      triggerFakeMouseEvent("mouseover", hitbox, 100, 200);
      assert.isTrue(overCallbackCalled, "onHoverOver was called on mousing over a target area");
      assert.deepEqual(lastOverData, ["left"],
                        "onHoverOver was called with the correct data (mouse onto left)");

      overCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
      assert.isFalse(overCallbackCalled,
                    "onHoverOver isn't called if the hover data didn't change");

      triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
      assert.isTrue(overCallbackCalled, "onHoverOver was called when mousing into a new region");
      assert.deepEqual(lastOverData, ["right"],
                        "onHoverOver was called with the new data only (left --> center)");

      triggerFakeMouseEvent("mousemove", hitbox, 300, 200);
      assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
      assert.deepEqual(lastOutData, ["left"],
                        "onHoverOut was called with the correct data (center --> right)");

      outCallbackCalled = false;
      lastOutData = null;
      triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
      assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
      assert.deepEqual(lastOutData, ["right"], "onHoverOut was called with the correct data");

      triggerFakeMouseEvent("mouseover", hitbox, 200, 200);
      assert.deepEqual(lastOverData, ["left", "right"], "onHoverOver is called with the correct data");

      svg.remove();
    });

    it("can get the currently-hovered values", () => {
      var svg = generateSVG();
      var testTarget = new TestHoverable();
      testTarget.classed("test-hoverable", true);
      testTarget.renderTo(svg);

      var hoverInteraction = new Plottable.Interaction.Hover();
      testTarget.registerInteraction(hoverInteraction);

      var hitbox = testTarget._element.select(".hit-box");
      triggerFakeMouseEvent("mouseover", hitbox, 200, 200);

      var currentlyHovered = hoverInteraction.getCurrentlyHovered();
      assert.deepEqual(currentlyHovered.data, ["left", "right"], "correctly retrieves last-hovered data");

      svg.remove();
    });
  });
});
