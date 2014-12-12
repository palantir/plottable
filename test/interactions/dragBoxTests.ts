///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("DragBoxInteractions", () => {
  var svgWidth = 400;
  var svgHeight = 400;
  var svg: D3.Selection;
  var dataset: Plottable.Dataset;
  var xScale: Plottable.Scale.AbstractQuantitative<number>;
  var yScale: Plottable.Scale.AbstractQuantitative<number>;
  var plot: Plottable.Plot.AbstractXYPlot<number,number>;
  var interaction: Plottable.Interaction.DragBox;

  var dragstartX = 20;
  var dragstartY = svgHeight-100;
  var dragendX = 100;
  var dragendY = svgHeight-20;
  var draghalfwidth = Math.round((dragendX - dragstartX) / 2);
  var draghalfheight = Math.round((dragendY - dragstartY) / 2);
  var dragwidth = dragendX - dragstartX;
  var dragheight = dragendY - dragstartY;
  var dragmidX = dragstartX + draghalfwidth;
  var dragmidY = dragstartY + draghalfheight;

  function testResize(resizeXStart: number, resizeYStart: number, expectedSelection: Plottable.SelectionArea) {
    var timesCalled = 0;
    fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY); // initial dragbox to resize from

    interaction.dragend(function(start: Plottable.Point, end: Plottable.Point) {
      timesCalled++;
      var interactionSelection = {
        xMin: +interaction.dragBox.attr("x"),
        yMin: +interaction.dragBox.attr("y"),
        xMax: +interaction.dragBox.attr("x") + (+interaction.dragBox.attr("width")),
        yMax: +interaction.dragBox.attr("y") + (+interaction.dragBox.attr("height"))
      };
      assert.deepEqual(interactionSelection, expectedSelection, "selection updated correctly");
    });

    // fake another drag event to resize the box.
    interaction.resizeEnabled(true);
    fakeDragSequence((<any> interaction), resizeXStart, resizeYStart, dragmidX, dragmidY);
    assert.equal(timesCalled, 1, "drag callback not called once");
  }

  describe("XYDragBoxInteraction", () => {
    before(() => {
      svg = generateSVG(svgWidth, svgHeight);
      dataset = new Plottable.Dataset(makeLinearSeries(10));
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Linear();
      plot = new Plottable.Plot.Scatter(xScale, yScale);
      plot.addDataset(dataset);
      plot.project("x", "x", xScale);
      plot.project("y", "y", yScale);
      plot.renderTo(svg);

      interaction = new Plottable.Interaction.DragBox();
      plot.registerInteraction(interaction);
    });
    afterEach(() => {
      interaction.dragstart(null);
      interaction.drag(null);
      interaction.dragend(null);
      interaction.clearBox();
    });

    it("All callbacks are notified with appropriate data on drag", () => {
      var dragStartCalled = 0, dragEndCalled = 0;
      interaction.dragstart(function(a: Plottable.Point) {
        dragStartCalled++;
        var expectedStartLocation = {x: dragstartX, y: dragstartY};
        assert.deepEqual(a, expectedStartLocation, "areaCallback called with null arg on dragstart");
      });
      interaction.dragend(function(a: Plottable.Point, b: Plottable.Point) {
        dragEndCalled++;
        var expectedStart = {
          x: dragstartX,
          y: dragstartY
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

      assert.equal(dragStartCalled, 1, "dragstart callback is called once");
      assert.equal(dragEndCalled, 1, "dragend callback is called once");
    });

    it("Highlights and un-highlights areas appropriately", () => {
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      var dragBoxClass = "." + (<any> Plottable.Interaction.XYDragBox)._CLASS_DRAG_BOX;
      var dragBox = plot.background().select(dragBoxClass);
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

    describe("resize enabled", () => {
      it("from the top left", () => {
        testResize(dragstartX, dragendY, {
          xMin: dragmidX,
          yMin: dragstartY,
          xMax: dragendX,
          yMax: dragmidY
        });
      });

      it("from the top", () => {
        testResize(dragmidX, dragendY, {
          xMin: dragstartX,
          yMin: dragstartY,
          xMax: dragendX,
          yMax: dragmidY
        });
      });

      it("from the top right", () => {
        testResize(dragendX, dragendY, {
          xMin: dragstartX,
          yMin: dragstartY,
          xMax: dragmidX,
          yMax: dragmidY
        });
      });

      it("from the right", () => {
        testResize(dragendX, dragmidY, {
          xMin: dragstartX,
          yMin: dragstartY,
          xMax: dragmidX,
          yMax: dragendY
        });
      });

      it("from the bottom right", () => {
        testResize(dragendX, dragstartY, {
          xMin: dragstartX,
          yMin: dragmidY,
          xMax: dragmidX,
          yMax: dragendY
        });
      });

      it("from the bottom", () => {
        testResize(dragmidX, dragstartY, {
          xMin: dragstartX,
          yMin: dragmidY,
          xMax: dragendX,
          yMax: dragendY
        });
      });

      it("from the bottom left", () => {
        testResize(dragstartX, dragstartY, {
          xMin: dragmidX,
          yMin: dragmidY,
          xMax: dragendX,
          yMax: dragendY
        });
      });

      it("from the left", () => {
        testResize(dragstartX, dragmidY, {
          xMin: dragmidX,
          yMin: dragstartY,
          xMax: dragendX,
          yMax: dragendY
        });
      });
    });

    after(() => {
      svg.remove();
    });
  });

  describe("YDragBoxInteraction", () => {

    before(() => {
      svg = generateSVG(svgWidth, svgHeight);
      dataset = new Plottable.Dataset(makeLinearSeries(10));
      xScale = new Plottable.Scale.Linear();
      yScale = new Plottable.Scale.Linear();
      plot = new Plottable.Plot.Scatter(xScale, yScale);
      plot.addDataset(dataset);
      plot.project("x", "x", xScale);
      plot.project("y", "y", yScale);
      plot.renderTo(svg);

      interaction = new Plottable.Interaction.YDragBox();
      plot.registerInteraction(interaction);
    });

    afterEach(() => {
      interaction.dragstart(null);
      interaction.drag(null);
      interaction.dragend(null);
      interaction.clearBox();
    });

    it("All callbacks are notified with appropriate data when a drag finishes", () => {
      var dragStartCalled = 0, dragEndCalled = 0;
      interaction.dragstart(function(a: Plottable.Point) {
        dragStartCalled++;
        var expectedY = dragstartY;
        assert.deepEqual(a.y, expectedY, "areaCallback called with null arg on dragstart");
      });
      interaction.dragend(function(a: Plottable.Point, b: Plottable.Point) {
        dragEndCalled++;
        var expectedStartY = dragstartY;
        var expectedEndY = dragendY;
        assert.deepEqual(a.y, expectedStartY);
        assert.deepEqual(b.y, expectedEndY);
      });

      // fake a drag event
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);

      assert.equal(dragStartCalled, 1, "dragstart callback is called once");
      assert.equal(dragEndCalled, 1, "dragend callback is called once");
    });

    it("Highlights and un-highlights areas appropriately", () => {
      fakeDragSequence((<any> interaction), dragstartX, dragstartY, dragendX, dragendY);
      var dragBoxClass = "." + (<any> Plottable.Interaction.XYDragBox)._CLASS_DRAG_BOX;
      var dragBox = plot.background().select(dragBoxClass);
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

    describe("resize enabled", () => {
      it("from the top left", () => {
        testResize(dragstartX, dragendY, {
          xMin: 0,
          yMin: dragstartY,
          xMax: svgWidth,
          yMax: dragmidY
        });
      });

      it("from the top", () => {
        testResize(dragmidX, dragendY, {
          xMin: 0,
          yMin: dragstartY,
          xMax: svgWidth,
          yMax: dragmidY
        });
      });

      it("from the top right", () => {
        testResize(dragendX, dragendY, {
          xMin: 0,
          yMin: dragstartY,
          xMax: svgWidth,
          yMax: dragmidY
        });
      });

      it("from the bottom right", () => {
        testResize(dragendX, dragstartY, {
          xMin: 0,
          yMin: dragmidY,
          xMax: svgWidth,
          yMax: dragendY
        });
      });

      it("from the bottom", () => {
        testResize(dragmidX, dragstartY, {
          xMin: 0,
          yMin: dragmidY,
          xMax: svgWidth,
          yMax: dragendY
        });
      });

      it("from the bottom left", () => {
        testResize(dragstartX, dragstartY, {
          xMin: 0,
          yMin: dragmidY,
          xMax: svgWidth,
          yMax: dragendY
        });
      });
    });

    after(() => {
      svg.remove();
    });
  });
});
