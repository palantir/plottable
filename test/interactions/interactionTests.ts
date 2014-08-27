///<reference path="../testReference.ts" />

var assert = chai.assert;


function makeFakeEvent(x: number, y: number): D3.D3Event {
  return <D3.D3Event> <any> {
      dx: 0,
      dy: 0,
      clientX: x,
      clientY: y,
      translate: [x, y],
      scale: 1,
      sourceEvent: <any> null,
      x: x,
      y: y,
      keyCode: 0,
      altKey: false
    };
}

function fakeDragSequence(anyedInteraction: any, startX: number, startY: number, endX: number, endY: number) {
  anyedInteraction._dragstart();
  d3.event = makeFakeEvent(startX, startY);
  anyedInteraction._drag();
  d3.event = makeFakeEvent(endX, endY);
  anyedInteraction._drag();
  anyedInteraction._dragend();
  d3.event = null;
}

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    it("Pans properly", () => {
      // The only difference between pan and zoom is internal to d3
      // Simulating zoom events is painful, so panning will suffice here
      var xScale = new Plottable.Scale.Linear().domain([0, 11]);
      var yScale = new Plottable.Scale.Linear().domain([11, 0]);

      var svg = generateSVG();
      var dataset = makeLinearSeries(11);
      var renderer = new Plottable.Plot.Scatter(dataset, xScale, yScale);
      renderer.renderTo(svg);

      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var interaction = new Plottable.Interaction.PanZoom(renderer, xScale, yScale);
      interaction.registerWithComponent();

      var hb = renderer.element.select(".hit-box").node();
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

  describe("XYDragBoxInteraction", () => {
    var svgWidth = 400;
    var svgHeight = 400;
    var svg: D3.Selection;
    var dataset: Plottable.Dataset;
    var xScale: Plottable.Abstract.QuantitativeScale;
    var yScale: Plottable.Abstract.QuantitativeScale;
    var renderer: Plottable.Abstract.XYPlot;
    var interaction: Plottable.Interaction.XYDragBox;

    var dragstartX = 20;
    var dragstartY = svgHeight-100;
    var dragendX = 100;
    var dragendY = svgHeight-20;

    before(() => {
      svg = generateSVG(svgWidth, svgHeight);
      dataset = new Plottable.Dataset(makeLinearSeries(10));
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Linear();
      renderer = new Plottable.Plot.Scatter(dataset, xScale, yScale);
      renderer.renderTo(svg);
      interaction = new Plottable.Interaction.XYDragBox(renderer);
      interaction.registerWithComponent();
    });

    afterEach(() => {
      interaction.dragstart(null);
      interaction.drag(null);
      interaction.dragend(null);
      interaction.clearBox();
    });

    it("All callbacks are notified with appropriate data on drag", () => {
      var timesCalled = 0;
      interaction.dragstart(function(a: Plottable.Point) {
        timesCalled++;
        var expectedStartLocation = { x: dragstartX, y: dragstartY };
        assert.deepEqual(a, expectedStartLocation, "areaCallback called with null arg on dragstart");
      });
      interaction.dragend(function(a: Plottable.Point, b: Plottable.Point) {
        timesCalled++;
        var expectedStart = {
          x: dragstartX,
          y: dragstartY,
        };
        var expectedEnd = {
          x: dragendX,
          y: dragendY
        };
        assert.deepEqual(a, expectedStart, "areaCallback was passed the correct starting point");
        assert.deepEqual(b, expectedEnd, "areaCallback was passed the correct ending point");
      });

      // fake a drag event
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);

      assert.equal(timesCalled, 2, "drag callbacks are called twice");
    });

    it("Highlights and un-highlights areas appropriately", () => {
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      var dragBoxClass = "." + (<any> Plottable.Interaction.XYDragBox).CLASS_DRAG_BOX;
      var dragBox = renderer.backgroundContainer.select(dragBoxClass);
      assert.isNotNull(dragBox, "the dragbox was created");
      var actualStartPosition = {x: parseFloat(dragBox.attr("x")), y: parseFloat(dragBox.attr("y"))};
      var expectedStartPosition = {x: Math.min(dragstartX, dragendX), y: Math.min(dragstartY, dragendY)};
      assert.deepEqual(actualStartPosition, expectedStartPosition, "highlighted box is positioned correctly");
      assert.equal(parseFloat(dragBox.attr("width")), Math.abs(dragstartX-dragendX), "highlighted box has correct width");
      assert.equal(parseFloat(dragBox.attr("height")), Math.abs(dragstartY-dragendY), "highlighted box has correct height");

      interaction.clearBox();
      var boxGone = dragBox.attr("width") === "0" && dragBox.attr("height") === "0";
      assert.isTrue(boxGone, "highlighted box disappears when clearBox is called");
    });

    after(() => {
      svg.remove();
    });
  });

  describe("YDragBoxInteraction", () => {
    var svgWidth = 400;
    var svgHeight = 400;
    var svg: D3.Selection;
    var dataset: Plottable.Dataset;
    var xScale: Plottable.Abstract.QuantitativeScale;
    var yScale: Plottable.Abstract.QuantitativeScale;
    var renderer: Plottable.Abstract.XYPlot;
    var interaction: Plottable.Interaction.XYDragBox;

    var dragstartX = 20;
    var dragstartY = svgHeight-100;
    var dragendX = 100;
    var dragendY = svgHeight-20;

    before(() => {
      svg = generateSVG(svgWidth, svgHeight);
      dataset = new Plottable.Dataset(makeLinearSeries(10));
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Linear();
      renderer = new Plottable.Plot.Scatter(dataset, xScale, yScale);
      renderer.renderTo(svg);
      interaction = new Plottable.Interaction.YDragBox(renderer);
      interaction.registerWithComponent();
    });

    afterEach(() => {
      interaction.dragstart(null);
      interaction.drag(null);
      interaction.dragend(null);
      interaction.clearBox();
    });

    it("All callbacks are notified with appropriate data when a drag finishes", () => {
      var timesCalled = 0;
      interaction.dragstart(function(a: Plottable.Point) {
        timesCalled++;
        var expectedY = dragstartY;
        assert.deepEqual(a.y, expectedY, "areaCallback called with null arg on dragstart");
      })
      interaction.dragend(function(a: Plottable.Point, b: Plottable.Point) {
        timesCalled++;
        var expectedStartY = dragstartY;
        var expectedEndY = dragendY;
        assert.deepEqual(a.y, expectedStartY);
        assert.deepEqual(b.y, expectedEndY);
      });

      // fake a drag event
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);

      assert.equal(timesCalled, 2, "drag callbacks area called twice");
    });

    it("Highlights and un-highlights areas appropriately", () => {
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      var dragBoxClass = "." + (<any> Plottable.Interaction.XYDragBox).CLASS_DRAG_BOX;
      var dragBox = renderer.backgroundContainer.select(dragBoxClass);
      assert.isNotNull(dragBox, "the dragbox was created");
      var actualStartPosition = {x: parseFloat(dragBox.attr("x")), y: parseFloat(dragBox.attr("y"))};
      var expectedStartPosition = {x: 0, y: Math.min(dragstartY, dragendY)};
      assert.deepEqual(actualStartPosition, expectedStartPosition, "highlighted box is positioned correctly");
      assert.equal(parseFloat(dragBox.attr("width")), svgWidth, "highlighted box has correct width");
      assert.equal(parseFloat(dragBox.attr("height")), Math.abs(dragstartY-dragendY), "highlighted box has correct height");

      interaction.clearBox();
      var boxGone = dragBox.attr("width") === "0" && dragBox.attr("height") === "0";
      assert.isTrue(boxGone, "highlighted box disappears when clearBox is called");
    });

    after(() => {
      svg.remove();
    });
  });

  describe("KeyInteraction", () => {
    it("Triggers the callback only when the Component is moused over and appropriate key is pressed", () => {
      var svg = generateSVG(400, 400);
      // svg.attr("id", "key-interaction-test");
      var component = new Plottable.Abstract.Component();
      component.renderTo(svg);

      var code = 65; // "a" key
      var ki = new Plottable.Interaction.Key(component, code);

      var callbackCalled = false;
      var callback = () => {
        callbackCalled = true;
      };

      ki.callback(callback);
      ki.registerWithComponent();

      var $hitbox = $((<any> component).hitBox.node());

      $hitbox.simulate("keydown", { keyCode: code });
      assert.isFalse(callbackCalled, "callback is not called if component does not have mouse focus (before mouseover)");

      $hitbox.simulate("mouseover");

      $hitbox.simulate("keydown", { keyCode: code });
      assert.isTrue(callbackCalled, "callback gets called if the appropriate key is pressed while the component has mouse focus");

      callbackCalled = false;
      $hitbox.simulate("keydown", { keyCode: (code + 1) });
      assert.isFalse(callbackCalled, "callback is not called if the wrong key is pressed");

      $hitbox.simulate("mouseout");

      $hitbox.simulate("keydown", { keyCode: code });
      assert.isFalse(callbackCalled, "callback is not called if component does not have mouse focus (after mouseout)");

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
      var barPlot = new Plottable.Plot.VerticalBar(dataset, ordinalScale, linearScale);
      var bhi = new Plottable.Interaction.BarHover(barPlot);

      bhi.hoverMode("line");
      bhi.hoverMode("POINT");

      assert.throws(() => bhi.hoverMode("derp"), "not a valid");
    });

    it("correctly triggers callbacks (vertical)", () => {
      var svg = generateSVG(400, 400);
      var barPlot = new Plottable.Plot.VerticalBar(dataset, ordinalScale, linearScale);
      barPlot.project("x", "name", ordinalScale).project("y", "value", linearScale);
      var bhi = new Plottable.Interaction.BarHover(barPlot);

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
      bhi.registerWithComponent();

      var hitbox = barPlot.element.select(".hit-box");

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
      var barPlot = new Plottable.Plot.HorizontalBar(dataset, linearScale, ordinalScale);
      barPlot.project("y", "name", ordinalScale).project("x", "value", linearScale);
      var bhi = new Plottable.Interaction.BarHover(barPlot);

      var barDatum: any = null;
      bhi.onHover((datum: any, bar: D3.Selection) => {
        barDatum = datum;
      });

      var unhoverCalled = false;
      bhi.onUnhover(() => {
        unhoverCalled = true;
      });

      barPlot.renderTo(svg);
      bhi.registerWithComponent();

      var hitbox = barPlot.element.select(".hit-box");

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
