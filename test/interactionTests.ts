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
      var xScale = new LinearScale();
      var yScale = new LinearScale();

      var svg = generateSVG();
      var dataset = makeLinearSeries(11);
      var renderer = new CircleRenderer(dataset, xScale, yScale);
      renderer.renderTo(svg);

      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var interaction = new PanZoomInteraction(renderer, xScale, yScale);

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

      function getSlope(scale: LinearScale) {
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
    var dataset: IDataset;
    var xScale: QuantitiveScale;
    var yScale: QuantitiveScale;
    var renderer: XYRenderer;
    var interaction: AreaInteraction;

    var dragstartX = 20;
    var dragstartY = svgHeight-100;
    var dragendX = 100;
    var dragendY = svgHeight-20;

    before(() => {
      svg = generateSVG(svgWidth, svgHeight);
      dataset = makeLinearSeries(10);
      xScale = new LinearScale();
      yScale = new LinearScale();
      renderer = new CircleRenderer(dataset, xScale, yScale);
      renderer.renderTo(svg);
      interaction = new AreaInteraction(renderer);
    });

    afterEach(() => {
      interaction.callback().clearBox();
    });

    it("All callbacks are notified with appropriate data when a drag finishes", () => {
      var areaCallbackCalled = false;
      var areaCallback = (a: SelectionArea) => {
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
      var dragBoxClass = "." + (<any> AreaInteraction).CLASS_DRAG_BOX;
      var dragBox = renderer.element.select(dragBoxClass);
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
      var xScale = new LinearScale();
      var yScale = new LinearScale();

      var svgWidth  = 400;
      var svgHeight = 400;
      var svg = generateSVG(svgWidth, svgHeight);
      var dataset = makeLinearSeries(11);
      var renderer = new CircleRenderer(dataset, xScale, yScale);
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
      var indicesCallback = (indices: number[]) => {
        indicesCallbackCalled = true;
        interaction.clearBox();
        assert.deepEqual(indices, [1, 2, 3, 4], "the correct points were selected");
      };
      var zoomCallback = new ZoomCallbackGenerator().addXScale(xScale).addYScale(yScale).getCallback();
      var callback = (a: SelectionArea) => {
        var dataArea = renderer.invertXYSelectionArea(a);
        var indices = renderer.getDataIndicesFromArea(dataArea);
        indicesCallback(indices);
        zoomCallback(a);
      };
      var interaction = new AreaInteraction(renderer).callback(callback);
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      assert.isTrue(indicesCallbackCalled, "indicesCallback was called");
      assert.deepEqual(xScale.domain(), expectedXDomain, "X scale domain was updated correctly");
      assert.deepEqual(yScale.domain(), expectedYDomain, "Y scale domain was updated correclty");

      svg.remove();
    });
  });
});
