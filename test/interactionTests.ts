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
  anyedInteraction.dragstart();
  d3.event = makeFakeEvent(startX, startY);
  anyedInteraction.drag();
  d3.event = makeFakeEvent(endX, endY);
  anyedInteraction.drag();
  anyedInteraction.dragend();
  d3.event = null;
}

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    it("Pans properly", () => {
      // The only difference between pan and zoom is internal to d3
      // Simulating zoom events is painful, so panning will suffice here
      var xScale = new Plottable.LinearScale();
      var yScale = new Plottable.LinearScale();

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

      assert.equal(xDomainAfter[0]-xDomainBefore[0], expectedXDragChange, "x domain changed by the correct amount");
      assert.equal(yDomainAfter[0]-yDomainBefore[0], expectedYDragChange, "y domain changed by the correct amount");

      svg.remove();
    });
  });

  describe("AreaInteraction", () => {
    var svgWidth = 400;
    var svgHeight = 400;
    var svg: D3.Selection;
    var dataset: Plottable.DataSource;
    var xScale: Plottable.QuantitiveScale;
    var yScale: Plottable.QuantitiveScale;
    var renderer: Plottable.XYRenderer;
    var interaction: Plottable.AreaInteraction;

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
      interaction = new Plottable.AreaInteraction(renderer);
      interaction.registerWithComponent();
    });

    afterEach(() => {
      interaction.callback().clearBox();
    });

    it("All callbacks are notified with appropriate data when a drag finishes", () => {
      var areaCallbackCalled = false;
      var areaCallback = (a: Plottable.SelectionArea) => {
        areaCallbackCalled = true;
        var expectedPixelArea = {
          xMin: dragstartX,
          xMax: dragendX,
          yMin: dragstartY,
          yMax: dragendY
        };
        assert.deepEqual(a, expectedPixelArea, "areaCallback was passed the correct pixel area");
      };


      interaction.callback(areaCallback);

      // fake a drag event
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);

      assert.isTrue(areaCallbackCalled, "areaCallback was called");
    });

    it("Highlights and un-highlights areas appropriately", () => {
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      var dragBoxClass = "." + (<any> Plottable.AreaInteraction).CLASS_DRAG_BOX;
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

  describe("BrushZoomInteraction", () => {
    it("Zooms in correctly on drag", () =>{
      var xScale = new Plottable.LinearScale();
      var yScale = new Plottable.LinearScale();

      var svgWidth  = 400;
      var svgHeight = 400;
      var svg = generateSVG(svgWidth, svgHeight);
      var dataset = makeLinearSeries(11);
      var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale);
      renderer.renderTo(svg);

      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var dragstartX = 10;
      var dragstartY = 210;
      var dragendX = 190;
      var dragendY = 390;

      var expectedXDomain = [xScale.invert(dragstartX), xScale.invert(dragendX)];
      var expectedYDomain = [yScale.invert(dragendY)  , yScale.invert(dragstartY)]; // reversed because Y scale is

      var indicesCallbackCalled = false;
      var interaction: any;
      var indicesCallback = (indices: number[]) => {
        indicesCallbackCalled = true;
        interaction.clearBox();
        assert.deepEqual(indices, [1, 2, 3, 4], "the correct points were selected");
      };
      var zoomCallback = new Plottable.ZoomCallbackGenerator().addXScale(xScale).addYScale(yScale).getCallback();
      var callback = (a: Plottable.SelectionArea) => {
        var dataArea = renderer.invertXYSelectionArea(a);
        var indices = renderer.getDataIndicesFromArea(dataArea);
        indicesCallback(indices);
        zoomCallback(a);
      };
      interaction = new Plottable.AreaInteraction(renderer).callback(callback);
      interaction.registerWithComponent();

      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      assert.isTrue(indicesCallbackCalled, "indicesCallback was called");
      assert.deepEqual(xScale.domain(), expectedXDomain, "X scale domain was updated correctly");
      assert.deepEqual(yScale.domain(), expectedYDomain, "Y scale domain was updated correclty");

      svg.remove();
    });
  });

  describe("CrosshairsInteraction", () => {
    it("Crosshairs manifest basic functionality", () => {
      var svg = generateSVG(400, 400);
      var dp = (x, y) => { return {x: x, y: y}; };
      var data = [dp(0, 0), dp(20, 10), dp(40, 40)];
      var xScale = new Plottable.LinearScale();
      var yScale = new Plottable.LinearScale();
      var circleRenderer = new Plottable.CircleRenderer(data, xScale, yScale);
      var crosshairs = new Plottable.CrosshairsInteraction(circleRenderer);
      crosshairs.registerWithComponent();
      circleRenderer.renderTo(svg);

      var crosshairsG = circleRenderer.foregroundContainer.select(".crosshairs");
      var circle = crosshairsG.select("circle");
      var xLine = crosshairsG.select(".x-line");
      var yLine = crosshairsG.select(".y-line");

      crosshairs.mousemove(0,0);
      assert.equal(circle.attr("cx"), 0, "the crosshairs are at x=0");
      assert.equal(circle.attr("cy"), 400, "the crosshairs are at y=400");
      assert.equal(xLine.attr("d"), "M 0 400 L 400 400", "the xLine behaves properly at y=400");
      assert.equal(yLine.attr("d"), "M 0 0 L 0 400", "the yLine behaves properly at x=0");

      crosshairs.mousemove(30, 0);
      // It should stay in the same position
      assert.equal(circle.attr("cx"), 0, "the crosshairs are at x=0 still");
      assert.equal(circle.attr("cy"), 400, "the crosshairs are at y=400 still");
      assert.equal(xLine.attr("d"), "M 0 400 L 400 400", "the xLine behaves properly at y=400");
      assert.equal(yLine.attr("d"), "M 0 0 L 0 400", "the yLine behaves properly at x=0");

      crosshairs.mousemove(300, 0);
      assert.equal(circle.attr("cx"), 200, "the crosshairs are at x=200");
      assert.equal(circle.attr("cy"), 300, "the crosshairs are at y=300");
      assert.equal(xLine.attr("d"), "M 0 300 L 400 300", "the xLine behaves properly at y=300");
      assert.equal(yLine.attr("d"), "M 200 0 L 200 400", "the yLine behaves properly at x=200");

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
