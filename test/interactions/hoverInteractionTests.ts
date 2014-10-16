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
    var svg: D3.Selection;
    var testTarget: TestHoverable;
    var hitbox: D3.Selection;
    var hoverInteraction: Plottable.Interaction.Hover;
    var overData: Plottable.Interaction.HoverData;
    var overCallbackCalled = false;
    var outData: Plottable.Interaction.HoverData;
    var outCallbackCalled = false;


    beforeEach(() => {
      svg = generateSVG();
      testTarget = new TestHoverable();
      testTarget.classed("test-hoverable", true);
      testTarget.renderTo(svg);

      hoverInteraction = new Plottable.Interaction.Hover();
      overCallbackCalled = false;
      hoverInteraction.onHoverOver((hd: Plottable.Interaction.HoverData) => {
        overCallbackCalled = true;
        overData = hd;
      });

      outCallbackCalled = false;
      hoverInteraction.onHoverOut((hd: Plottable.Interaction.HoverData) => {
        outCallbackCalled = true;
        outData = hd;
      });

      testTarget.registerInteraction(hoverInteraction);
      hitbox = testTarget._element.select(".hit-box");
    });

    it("correctly triggers onHoverOver() callbacks", () => {
      overCallbackCalled = false;
      triggerFakeMouseEvent("mouseover", hitbox, 100, 200);
      assert.isTrue(overCallbackCalled, "onHoverOver was called on mousing over a target area");
      assert.deepEqual(overData.data, ["left"],
                        "onHoverOver was called with the correct data (mouse onto left)");

      overCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
      assert.isFalse(overCallbackCalled,
                    "onHoverOver isn't called if the hover data didn't change");

      overCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
      assert.isTrue(overCallbackCalled, "onHoverOver was called when mousing into a new region");
      assert.deepEqual(overData.data, ["right"],
                        "onHoverOver was called with the new data only (left --> center)");

      triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
      overCallbackCalled = false;
      triggerFakeMouseEvent("mouseover", hitbox, 200, 200);
      assert.deepEqual(overData.data, ["left", "right"], "onHoverOver is called with the correct data");

      svg.remove();
    });

    it("correctly triggers onHoverOut() callbacks", () => {
      triggerFakeMouseEvent("mouseover", hitbox, 100, 200);

      outCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
      assert.isFalse(outCallbackCalled,
        "onHoverOut isn't called when mousing into a new region without leaving the old one");

      outCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 300, 200);
      assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
      assert.deepEqual(outData.data, ["left"],
                        "onHoverOut was called with the correct data (center --> right)");

      outCallbackCalled = false;
      triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
      assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
      assert.deepEqual(outData.data, ["right"], "onHoverOut was called with the correct data");

      outCallbackCalled = false;
      triggerFakeMouseEvent("mouseover", hitbox, 200, 200);
      triggerFakeMouseEvent("mouseout", hitbox, 200, 400);
      assert.deepEqual(outData.data, ["left", "right"], "onHoverOut is called with the correct data");

      svg.remove();
    });

    it("getCurrentlyHovered()", () => {
      triggerFakeMouseEvent("mouseover", hitbox, 100, 200);
      var currentlyHovered = hoverInteraction.getCurrentlyHovered();
      assert.deepEqual(currentlyHovered.data, ["left"],
                       "retrieves data corresponding to the current position");

      triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
      currentlyHovered = hoverInteraction.getCurrentlyHovered();
      assert.deepEqual(currentlyHovered.data, ["left", "right"],
                       "retrieves data corresponding to the current position");

      triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
      currentlyHovered = hoverInteraction.getCurrentlyHovered();
      assert.isNull(currentlyHovered.data, "returns null if not currently hovering");

      svg.remove();
    });
  });
});
