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
    it.skip("Properly updates scales on zoom", () => {
      //
      var xScale = new LinearScale();
      var yScale = new LinearScale();
      var xDomainBefore = xScale.domain();
      var yDomainBefore = yScale.domain();

      var svg = generateSVG();
      var component = new Component();
      component.anchor(svg).computeLayout().render();
      var interaction = new PanZoomInteraction(component, [], xScale, yScale);

      // var zoomEvent = document.createEvent("WheelEvent");
      // zoomEvent.initEvent("mousewheel", true, true);
      // var hb = component.element.select(".hit-box").node();

      // hb.dispatchEvent(zoomEvent);

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
      renderer.anchor(svg).computeLayout().render();
      interaction = new AreaInteraction(renderer);
    });

    afterEach(() => {
      interaction.areaCallback = null;
      interaction.selectionCallback = null;
      interaction.indicesCallback = null;
      interaction.clearBox();
    });

    it("All callbacks are notified with appropriate data when a drag finishes", () => {
      var areaCallbackCalled = false;
      var areaCallback = (a: FullSelectionArea) => {
        areaCallbackCalled = true;
        var expectedPixelArea = {
          xMin: dragstartX,
          xMax: dragendX,
          yMin: dragstartY,
          yMax: dragendY
        };
        assert.deepEqual(a.pixel, expectedPixelArea, "areaCallback was passed the correct pixel area");
      };
      var selectionCallbackCalled = false;
      var selectionCallback = (a: D3.Selection) => {
        selectionCallbackCalled = true;
      };
      var indicesCallbackCalled = false;
      var indicesCallback = (a: number[]) => {
        indicesCallbackCalled = true;
      };

      interaction.areaCallback = areaCallback;
      interaction.selectionCallback = selectionCallback;
      interaction.indicesCallback = indicesCallback;

      // fake a drag event
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);

      assert.isTrue(areaCallbackCalled, "areaCallback was called");
      assert.isTrue(selectionCallbackCalled, "selectionCallback was called");
      assert.isTrue(indicesCallbackCalled, "indicesCallback was called");
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

      (<any> interaction).dragstart();
      dragBox = renderer.element.select(dragBoxClass);
      assert.equal(dragBox.attr("width"), "0", "highlighted box disappears when a new drag begins");
      assert.equal(dragBox.attr("height"), "0", "highlighted box disappears when a new drag begins");
      (<any> interaction).dragend();
    });

    after(() => {
      svg.remove();
    });
  });
});
