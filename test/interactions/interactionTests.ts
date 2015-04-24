///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    it("Pans properly", () => {
      // The only difference between pan and zoom is internal to d3
      // Simulating zoom events is painful, so panning will suffice here
      var xScale = new Plottable.Scale.Linear().domain([0, 11]);
      var yScale = new Plottable.Scale.Linear().domain([11, 0]);

      var svg = TestMethods.generateSVG();
      var dataset = TestMethods.makeLinearSeries(11);
      var plot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataset);
      plot.project("x", "x", xScale);
      plot.project("y", "y", yScale);
      plot.renderTo(svg);

      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var interaction = new Plottable.Interaction.PanZoom(xScale, yScale);
      plot.registerInteraction(interaction);

      var hb = plot.hitBox().node();
      var dragDistancePixelX = 10;
      var dragDistancePixelY = 20;
      $(hb).simulate("drag", {
        dx: dragDistancePixelX,
        dy: dragDistancePixelY
      });

      var xDomainAfter = xScale.domain();
      var yDomainAfter = yScale.domain();

      assert.notDeepEqual(xDomainAfter, xDomainBefore, "x domain was changed by panning");
      assert.notDeepEqual(yDomainAfter, yDomainBefore, "y domain was changed by panning");

      function getSlope(scale: Plottable.Scale.Linear) {
        var range = scale.range();
        var domain = scale.domain();
        return (domain[1] - domain[0]) / (range[1] - range[0]);
      };

      var expectedXDragChange = -dragDistancePixelX * getSlope(xScale);
      var expectedYDragChange = -dragDistancePixelY * getSlope(yScale);

      assert.closeTo(xDomainAfter[0] - xDomainBefore[0], expectedXDragChange, 1, "x domain changed by the correct amount");
      assert.closeTo(yDomainAfter[0] - yDomainBefore[0], expectedYDragChange, 1, "y domain changed by the correct amount");

      svg.remove();
    });

    it("Resets zoom when the scale domain changes", () => {
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();

      var svg = TestMethods.generateSVG();
      var c = new Plottable.Component.AbstractComponent();
      c.renderTo(svg);

      var pzi = new Plottable.Interaction.PanZoom(xScale, yScale);
      c.registerInteraction(pzi);

      var zoomBeforeX = (<any> pzi)._zoom;
      xScale.domain([10, 1000]);
      var zoomAfterX = (<any> pzi)._zoom;
      assert.notStrictEqual(zoomBeforeX, zoomAfterX, "D3 Zoom was regenerated after x scale domain changed");

      var zoomBeforeY = (<any> pzi)._zoom;
      yScale.domain([10, 1000]);
      var zoomAfterY = (<any> pzi)._zoom;
      assert.notStrictEqual(zoomBeforeY, zoomAfterY, "D3 Zoom was regenerated after y scale domain changed");

      svg.remove();
    });
  });

  describe("KeyInteraction", () => {
    it("Triggers appropriate callback for the key pressed", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var component = new Plottable.Component.AbstractComponent();
      component.renderTo(svg);

      var ki = new Plottable.Interaction.Key();

      var aCode = 65; // "a" key
      var bCode = 66; // "b" key

      var aCallbackCalled = false;
      var aCallback = () => aCallbackCalled = true;
      var bCallbackCalled = false;
      var bCallback = () => bCallbackCalled = true;

      ki.on(aCode, aCallback);
      ki.on(bCode, bCallback);
      component.registerInteraction(ki);

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
  });
});
