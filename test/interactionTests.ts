///<reference path="testReference.ts" />

var assert = chai.assert;


function makeFakeEvent(x: number, y: number): D3.Event {
  return {
      dx: 0,
      dy: 0,
      clientX: x,
      clientY: y,
      translate: [x, y],
      scale: 1,
      sourceEvent: null,
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
      var xScale = new Plottable.LinearScale().domain([0, 11]);
      var yScale = new Plottable.LinearScale().domain([11, 0]);

      var svg = generateSVG();
      var dataset = makeLinearSeries(11);
      var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale);
      renderer.renderTo(svg);

      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var interaction = new Plottable.PanZoomInteraction(renderer, xScale, yScale);
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

      function getSlope(scale: Plottable.LinearScale) {
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
    var dataset: Plottable.DataSource;
    var xScale: Plottable.QuantitiveScale;
    var yScale: Plottable.QuantitiveScale;
    var renderer: Plottable.XYRenderer;
    var interaction: Plottable.XYDragBoxInteraction;

    var dragstartX = 20;
    var dragstartY = svgHeight-100;
    var dragendX = 100;
    var dragendY = svgHeight-20;

    before(() => {
      svg = generateSVG(svgWidth, svgHeight);
      dataset = new Plottable.DataSource(makeLinearSeries(10));
      xScale = new Plottable.LinearScale();
      yScale = new Plottable.LinearScale();
      renderer = new Plottable.CircleRenderer(dataset, xScale, yScale);
      renderer.renderTo(svg);
      interaction = new Plottable.XYDragBoxInteraction(renderer);
      interaction.registerWithComponent();
    });

    afterEach(() => {
      interaction.callback();
      interaction.clearBox();
    });

    it("All callbacks are notified with appropriate data when a drag finishes", () => {
      var timesCalled = 0;
      var areaCallback = (a: Plottable.SelectionArea) => {
        timesCalled++;
        if (timesCalled === 1) {
          assert.deepEqual(a, null, "areaCallback called with null arg on dragstart");
        }
        if (timesCalled === 2) {
          var expectedPixelArea = {
            xMin: dragstartX,
            xMax: dragendX,
            yMin: dragstartY,
            yMax: dragendY
          };
          assert.deepEqual(a, expectedPixelArea, "areaCallback was passed the correct pixel area");
        }
      };


      interaction.callback(areaCallback);

      // fake a drag event
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);

      assert.equal(timesCalled, 2, "areaCallback was called twice");
    });

    it("Highlights and un-highlights areas appropriately", () => {
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      var dragBoxClass = "." + (<any> Plottable.XYDragBoxInteraction).CLASS_DRAG_BOX;
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

  describe("KeyInteraction", () => {
    it("Triggers the callback only when the Component is moused over and appropriate key is pressed", () => {
      var svg = generateSVG(400, 400);
      // svg.attr("id", "key-interaction-test");
      var component = new Plottable.Component();
      component.renderTo(svg);

      var code = 65; // "a" key
      var ki = new Plottable.KeyInteraction(component, code);

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
});
