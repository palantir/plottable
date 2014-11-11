///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    it("Pans properly", () => {
      // The only difference between pan and zoom is internal to d3
      // Simulating zoom events is painful, so panning will suffice here
      var xScale = new Plottable.Scale.Linear().domain([0, 11]);
      var yScale = new Plottable.Scale.Linear().domain([11, 0]);

      var svg = generateSVG();
      var dataset = makeLinearSeries(11);
      var plot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataset);
      plot.renderTo(svg);

      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var interaction = new Plottable.Interaction.PanZoom(xScale, yScale);
      plot.registerInteraction(interaction);

      var hb = plot._element.select(".hit-box").node();
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
        return (domain[1]-domain[0])/(range[1]-range[0]);
      };

      var expectedXDragChange = -dragDistancePixelX * getSlope(xScale);
      var expectedYDragChange = -dragDistancePixelY * getSlope(yScale);

      assert.closeTo(xDomainAfter[0]-xDomainBefore[0], expectedXDragChange, 1, "x domain changed by the correct amount");
      assert.closeTo(yDomainAfter[0]-yDomainBefore[0], expectedYDragChange, 1, "y domain changed by the correct amount");

      svg.remove();
    });
  });

  describe("KeyInteraction", () => {
    it("Triggers appropriate callback for the key pressed", () => {
      var svg = generateSVG(400, 400);
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

      var $hitbox = $((<any> component).hitBox.node());

      $hitbox.simulate("mouseover");
      $hitbox.simulate("keydown", { keyCode: aCode });
      assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
      assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");

      aCallbackCalled = false;
      $hitbox.simulate("keydown", { keyCode: bCode });
      assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"b\" key was pressed");
      assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");
      svg.remove();
    });
  });

  describe("BarHover", () => {
    var dataset: any[];
    var ordinalScale: Plottable.Scale.Ordinal;
    var linearScale: Plottable.Scale.Linear;

    before(() => {
      dataset = [
        { name: "A", value: 3 },
        { name: "B", value: 5 }
      ];
      ordinalScale = new Plottable.Scale.Ordinal();
      linearScale = new Plottable.Scale.Linear();
    });

    it("hoverMode()", () => {
      var barPlot = new Plottable.Plot.VerticalBar(ordinalScale, linearScale).addDataset(dataset);
      var bhi = new Plottable.Interaction.BarHover();

      bhi.hoverMode("line");
      bhi.hoverMode("POINT");

      assert.throws(() => bhi.hoverMode("derp"), "not a valid");
    });

    it("correctly triggers callbacks (vertical)", () => {
      var svg = generateSVG(400, 400);
      var barPlot = new Plottable.Plot.VerticalBar(ordinalScale, linearScale).addDataset(dataset);
      barPlot.project("x", "name", ordinalScale).project("y", "value", linearScale);
      var bhi = new Plottable.Interaction.BarHover();

      var barDatum: any = null;
      bhi.onHover((datum: any, bar: D3.Selection) => {
        barDatum = datum;
      });

      var unhoverCalled = false;
      bhi.onUnhover((datum: any, bar: D3.Selection) => {
        barDatum = datum;
        unhoverCalled = true;
      });

      barPlot.renderTo(svg);
      barPlot.registerInteraction(bhi);

      var hitbox = barPlot._element.select(".hit-box");

      triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
      assert.deepEqual(barDatum, dataset[0], "the first bar was selected (point mode)");
      barDatum = null;
      triggerFakeMouseEvent("mousemove", hitbox, 100, 201);
      assert.isNull(barDatum, "hover callback isn't called if the hovered bar didn't change");

      barDatum = null;
      triggerFakeMouseEvent("mousemove", hitbox, 10, 10);
      assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing away from a bar");
      assert.deepEqual(barDatum, dataset[0], "the unhover callback was passed the last-hovered bar");


      unhoverCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 11, 11);
      assert.isFalse(unhoverCalled, "unhover callback isn't triggered multiple times in succession");

      triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
      triggerFakeMouseEvent("mouseout", hitbox, 100, 9999);
      assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing out of the chart");

      triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
      unhoverCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 250, 200);
      assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing from one bar to another");

      bhi.hoverMode("line");
      barDatum = null;
      triggerFakeMouseEvent("mousemove", hitbox, 100, 1);
      assert.deepEqual(barDatum, dataset[0], "the first bar was selected (line mode)");

      svg.remove();
    });

    it("correctly triggers callbacks (hoizontal)", () => {
      var svg = generateSVG(400, 400);
      var barPlot = new Plottable.Plot.HorizontalBar(linearScale, ordinalScale).addDataset(dataset);
      barPlot.project("y", "name", ordinalScale).project("x", "value", linearScale);
      var bhi = new Plottable.Interaction.BarHover();

      var barDatum: any = null;
      bhi.onHover((datum: any, bar: D3.Selection) => {
        barDatum = datum;
      });

      var unhoverCalled = false;
      bhi.onUnhover(() => {
        unhoverCalled = true;
      });

      barPlot.renderTo(svg);
      barPlot.registerInteraction(bhi);

      var hitbox = barPlot._element.select(".hit-box");

      triggerFakeMouseEvent("mousemove", hitbox, 200, 250);
      assert.deepEqual(barDatum, dataset[0], "the first bar was selected (point mode)");
      barDatum = null;
      triggerFakeMouseEvent("mousemove", hitbox, 201, 250);
      assert.isNull(barDatum, "hover callback isn't called if the hovered bar didn't change");

      triggerFakeMouseEvent("mousemove", hitbox, 10, 10);
      assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing away from a bar");
      unhoverCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 11, 11);
      assert.isFalse(unhoverCalled, "unhover callback isn't triggered multiple times in succession");

      triggerFakeMouseEvent("mousemove", hitbox, 200, 250);
      triggerFakeMouseEvent("mouseout", hitbox, -999, 250);
      assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing out of the chart");

      triggerFakeMouseEvent("mousemove", hitbox, 200, 250);
      unhoverCalled = false;
      triggerFakeMouseEvent("mousemove", hitbox, 200, 100);
      assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing from one bar to another");


      bhi.hoverMode("line");
      triggerFakeMouseEvent("mousemove", hitbox, 399, 250);
      assert.deepEqual(barDatum, dataset[0], "the first bar was selected (line mode)");

      svg.remove();
    });
  });
});
