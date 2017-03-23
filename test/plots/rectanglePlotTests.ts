import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("RectanglePlot", () => {
    describe("rendering", () => {
      it("renders rectangles with the input x1, x2, y1, y2 edges", () => {
        const data = [
          { x: 0, y: 0, x2: 1, y2: 1 },
          { x: 1, y: 1, x2: 2, y2: 2 },
          { x: 2, y: 2, x2: 3, y2: 3 },
          { x: 3, y: 3, x2: 4, y2: 4 },
          { x: 4, y: 4, x2: 5, y2: 5 },
        ];

        const div = TestMethods.generateDiv();
        const xScale = new Plottable.Scales.Linear();
        const yScale = new Plottable.Scales.Linear();
        const plot = new Plottable.Plots.Rectangle<number, number>();
        const xAccessor = (d: any) => d.x;
        const yAccessor = (d: any) => d.y;
        const x2Accessor = (d: any) => d.x2;
        const y2Accessor = (d: any) => d.y2;
        plot.x(xAccessor, xScale).x2(x2Accessor);
        plot.y(yAccessor, yScale).y2(y2Accessor);
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const rects = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(rects.size(), data.length, "one rectangle per datum");
        rects.each(function(d, i) {
          const rect = d3.select(this);
          assert.closeTo(TestMethods.numAttr(rect, "height"), Math.abs(yScale.scale(yAccessor(d)) - yScale.scale(y2Accessor(d))),
            window.Pixel_CloseTo_Requirement, `rect ${i} height is correct`);
          assert.closeTo(TestMethods.numAttr(rect, "width"), Math.abs(xScale.scale(xAccessor(d)) - xScale.scale(x2Accessor(d))),
            window.Pixel_CloseTo_Requirement, `rect ${i} width is correct`);
          assert.closeTo(TestMethods.numAttr(rect, "x"), Math.min(xScale.scale(xAccessor(d)), xScale.scale(x2Accessor(d))),
            window.Pixel_CloseTo_Requirement, `rect ${i} x coordinate is correct`);
          assert.closeTo(TestMethods.numAttr(rect, "y"), Math.min(yScale.scale(yAccessor(d)), yScale.scale(y2Accessor(d))),
            window.Pixel_CloseTo_Requirement, `rect ${i} y coordinate is correct`);
        });
        div.remove();
      });
    });

    describe("retreiving entities", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Rectangle<number, number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Rectangle<number, number>();
        plot.x((d) => d.x, xScale).x2((d) => d.x2);
        plot.y((d) => d.y, yScale).y2((d) => d.y2);
      });

      function createNonIntersectingRectangleData(count: number) {
        return Plottable.Utils.Math.range(0, count).map((rectangleNumber) => {
          return {
            x: rectangleNumber,
            y: rectangleNumber,
            x2: rectangleNumber + 1,
            y2: rectangleNumber + 1,
          };
        });
      }

      function createIntersectingRectangleData(count: number) {
        return Plottable.Utils.Math.range(0, count).map((rectangleNumber) => {
          return {
            x: rectangleNumber,
            y: rectangleNumber,
            x2: rectangleNumber + 1.5,
            y2: rectangleNumber + 1.5,
          };
        });
      }

      it("retrieves the correct entity under a point", () => {
        const data = createNonIntersectingRectangleData(5);
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const entities = plot.entitiesAt({
          x: (xScale.scale(data[2].x) + xScale.scale(data[3].x)) / 2,
          y: (yScale.scale(data[2].y) + yScale.scale(data[3].y)) / 2,
        });
        assert.lengthOf(entities, 1, "found only one entity when querying a point inside a rectangle");
        assert.strictEqual(entities[0].index, 2, "entity retrieved is at index 2");
        div.remove();
      });

      it("retrieves correct entities under a point when rectangles intersect", () => {
        const data = createIntersectingRectangleData(2);
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const intersectingEntities = plot.entitiesAt({ x: xScale.scale(data[1].x), y: yScale.scale(data[1].y) });
        assert.lengthOf(intersectingEntities, 2, "two entities when querying a point in intersection");
        assert.strictEqual(intersectingEntities[0].index, 0, "entity retrieved is at index 0");
        assert.strictEqual(intersectingEntities[1].index, 1, "entity retrieved is at index 1");

        let nonIntersectingEntities = plot.entitiesAt({ x: xScale.scale(data[1].x2), y: yScale.scale(data[1].y2) });
        assert.lengthOf(nonIntersectingEntities, 1, "found only one entity when querying a point inside the second rectangle");
        assert.strictEqual(nonIntersectingEntities[0].index, 1, "entity retrieved is at index 1");

        nonIntersectingEntities = plot.entitiesAt({ x: xScale.scale(data[0].x), y: yScale.scale(data[1].y) });
        assert.lengthOf(nonIntersectingEntities, 1, "found only one entity when querying a point inside the first rectangle");
        assert.strictEqual(nonIntersectingEntities[0].index, 0, "entity retrieved is at index 0");
        div.remove();
      });

      it("retrieves the entities that intersect with the bounding box", () => {
        const data = createNonIntersectingRectangleData(5);
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const entities = plot.entitiesIn({
          topLeft: { x: (xScale.scale(data[1].x) + xScale.scale(data[2].x)) / 2,
            y: (yScale.scale(data[2].y) + yScale.scale(data[3].y)) / 2 },
          bottomRight: { x: (xScale.scale(data[2].x) + xScale.scale(data[3].x)) / 2,
            y: (yScale.scale(data[1].y) + yScale.scale(data[2].y)) / 2 } });
        assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the box");
        assert.strictEqual(entities[0].index, 1, "the entity of index 1 is retrieved");
        assert.strictEqual(entities[1].index, 2, "the entity of index 2 is retrieved");
        div.remove();
      });

      it("retrieves the entities that intersect with the given ranges", () => {
        const data = createNonIntersectingRectangleData(5);
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const entities = plot.entitiesIn(
          {
            min: (xScale.scale(data[1].x) + xScale.scale(data[2].x)) / 2,
            max: (xScale.scale(data[2].x) + xScale.scale(data[3].x)) / 2,
          },
          {
            min: (yScale.scale(data[2].y) + yScale.scale(data[3].y)) / 2,
            max: (yScale.scale(data[1].y) + yScale.scale(data[2].y)) / 2,
          },
        );
        assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the box");
        assert.strictEqual(entities[0].index, 1, "the entity of index 1 is retrieved");
        assert.strictEqual(entities[1].index, 2, "the entity of index 2 is retrieved");
        div.remove();
      });

      it("retrieves undefined from entityNearest when no entities are rendered", () => {
        plot.addDataset(new Plottable.Dataset([]));
        plot.renderTo(div);
        let closest = plot.entityNearest({
          x: plot.width() / 2,
          y: plot.height() / 2,
        });
        assert.strictEqual(closest, undefined, "no datum has been retrieved");
        div.remove();
      });
    });

    describe("autoranging the x and y scales", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
      });

      it("adjusts the xScale domain with respect to the yScale domain when autorangeMode is set to x", () => {
        const data = [
          { y: "A", x: 0, x2: 1 },
          { y: "B", x: 1, x2: 2 },
        ];

        const xScale = new Plottable.Scales.Linear();
        const yScale = new Plottable.Scales.Category();
        xScale.padProportion(0);

        const plot = new Plottable.Plots.Rectangle();
        plot.x((d) => d.x, xScale);
        plot.x2((d) => d.x2);
        plot.y((d) => d.y, yScale);
        plot.addDataset(new Plottable.Dataset(data));
        plot.autorangeMode("x");
        plot.renderTo(div);

        assert.deepEqual(xScale.domain(), [0, 2], "x domain includes both visible segments");

        yScale.domain(["A"]);
        assert.deepEqual(xScale.domain(), [0, 1], "x domain includes only the visible segment (first)");

        yScale.domain(["B"]);
        assert.deepEqual(xScale.domain(), [1, 2], "x domain includes only the visible segment (second)");
        div.remove();
      });

      it("adjusts the yScale domain with respect to the xScale domain when autorangeMode is set to y", () => {
        const data = [
          { x: "A", y: 0, y2: 1 },
          { x: "B", y: 1, y2: 2 },
        ];

        const xScale = new Plottable.Scales.Category();
        const yScale = new Plottable.Scales.Linear();
        yScale.padProportion(0);

        const plot = new Plottable.Plots.Rectangle();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data));
        plot.autorangeMode("y");
        plot.renderTo(div);

        assert.deepEqual(yScale.domain(), [0, 2], "y domain includes both visible segments");

        xScale.domain(["A"]);
        assert.deepEqual(yScale.domain(), [0, 1], "y domain includes only the visible segment (first)");

        xScale.domain(["B"]);
        assert.deepEqual(yScale.domain(), [1, 2], "y domain includes only the visible segment (second)");
        div.remove();
      });
    });

    describe("using invalid data", () => {
      it("does not draw rectangles for data points containing NaN", () => {
        const div = TestMethods.generateDiv();

        const data = [
          { x: "A", y: 1, y2: 2 },
          { x: "B", y: 2, y2: 3 },
          { x: "C", y: 3, y2: NaN },
        ];

        const xScale = new Plottable.Scales.Category();
        const yScale = new Plottable.Scales.Linear();

        const plot = new Plottable.Plots.Rectangle();
        plot.x((d: any) => d.x, xScale);
        plot.y((d: any) => d.y, yScale);
        plot.y2((d: any) => d.y2);
        plot.addDataset(new Plottable.Dataset(data));

        plot.renderTo(div);

        const rectangles = plot.selections();

        assert.strictEqual(rectangles.size(), data.length - 1, "rectangle per valid datum");

        rectangles.each(function(d: any, i: number) {
          const rect = d3.select(this);
          assert.isFalse(Plottable.Utils.Math.isNaN(TestMethods.numAttr(rect, "x")), `x is not NaN for rect ${i}`);
          assert.isFalse(Plottable.Utils.Math.isNaN(TestMethods.numAttr(rect, "y")), `y is not NaN for rect ${i}`);
          assert.isFalse(Plottable.Utils.Math.isNaN(TestMethods.numAttr(rect, "height")), `height is not NaN for rect ${i}`);
          assert.isFalse(Plottable.Utils.Math.isNaN(TestMethods.numAttr(rect, "width")), `width is not NaN for rect ${i}`);
        });

        div.remove();
      });
    });

    describe("using category scales", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Category;
      let plot: Plottable.Plots.Rectangle<string, string>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Category();

        plot = new Plottable.Plots.Rectangle<string, string>();
        plot.x((d: any) => d.x, xScale);
        plot.y((d: any) => d.y, yScale);
      });

      it("renders rectangles with the correct x, y, width, and ehgiht", () => {
        const data = [
          {x: "A", y: "U"},
          {x: "B", y: "U"},
          {x: "A", y: "V"},
          {x: "B", y: "V"},
        ];
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const rects = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(rects.size(), data.length, "rect for each datum");

        rects.each(function(d, i) {
          const rect = d3.select(this);
          const rectCenterX = TestMethods.numAttr(rect, "x") + TestMethods.numAttr(rect, "width") / 2;
          const rectCenterY = TestMethods.numAttr(rect, "y") + TestMethods.numAttr(rect, "height") / 2;
          assert.closeTo(xScale.scale(d.x), rectCenterX,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in x is scaled version of input data`);
          assert.closeTo(yScale.scale(d.y), rectCenterY,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in y is scaled version of input data`);
        });
        div.remove();
      });

      it("renders rectangles when data is set after construction", () => {
        const dataset = new Plottable.Dataset();
        plot.addDataset(dataset);
        plot.renderTo(div);
        const data = [
          {x: "X", y: "Z"},
          {x: "Y", y: "T"},
        ];
        dataset.data(data);

        const rects = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(rects.size(), data.length, "rect for each datum");

        rects.each(function(d, i) {
          const rect = d3.select(this);
          const rectCenterX = TestMethods.numAttr(rect, "x") + TestMethods.numAttr(rect, "width") / 2;
          const rectCenterY = TestMethods.numAttr(rect, "y") + TestMethods.numAttr(rect, "height") / 2;
          assert.closeTo(xScale.scale(d.x), rectCenterX,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in x is scaled version of input data`);
          assert.closeTo(yScale.scale(d.y), rectCenterY,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in y is scaled version of input data`);
        });
        div.remove();
      });

      it("renders rectangles even when there isn't data for every spot", () => {
        const data = [
          {x: "A", y: "W"},
          {x: "B", y: "X"},
          {x: "C", y: "Y"},
          {x: "D", y: "Z"},
        ];
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        const rects = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(rects.size(), data.length, "rect for each datum");

        rects.each(function(d, i) {
          const rect = d3.select(this);
          const rectCenterX = TestMethods.numAttr(rect, "x") + TestMethods.numAttr(rect, "width") / 2;
          const rectCenterY = TestMethods.numAttr(rect, "y") + TestMethods.numAttr(rect, "height") / 2;
          assert.closeTo(xScale.scale(d.x), rectCenterX,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in x is scaled version of input data`);
          assert.closeTo(yScale.scale(d.y), rectCenterY,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in y is scaled version of input data`);
        });
        div.remove();
      });

      it("renders rectangles in the correct x and y locations even with a reversed y domain", () => {
        const data = [
          {x: "A", y: "U"},
          {x: "B", y: "U"},
          {x: "A", y: "V"},
          {x: "B", y: "V"},
        ];
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(div);

        yScale.domain(yScale.domain().reverse());

        const rects = plot.content().selectAll<Element, any>("rect");
        assert.strictEqual(rects.size(), data.length, "rect for each datum");

        rects.each(function(d, i) {
          const rect = d3.select(this);
          const rectCenterX = TestMethods.numAttr(rect, "x") + TestMethods.numAttr(rect, "width") / 2;
          const rectCenterY = TestMethods.numAttr(rect, "y") + TestMethods.numAttr(rect, "height") / 2;
          assert.closeTo(xScale.scale(d.x), rectCenterX,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in x is scaled version of input data`);
          assert.closeTo(yScale.scale(d.y), rectCenterY,
            window.Pixel_CloseTo_Requirement, `center of rect ${i} in y is scaled version of input data`);
        });
        div.remove();
      });
    });

    describe("retrieving D3 Selections from the plot", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Category;
      let plot: Plottable.Plots.Rectangle<string, string>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Category();

        plot = new Plottable.Plots.Rectangle<string, string>();
        plot.x((d: any) => d.x, xScale);
        plot.y((d: any) => d.y, yScale);

        const data = [
          {x: "A", y: "U"},
          {x: "B", y: "U"},
          {x: "A", y: "V"},
          {x: "B", y: "V"},
        ];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);
        plot.renderTo(div);
      });

      it("retrieves all selections with no args", () => {
        let allCells = plot.selections();
        assert.strictEqual(allCells.size(), plot.datasets()[0].data().length, "rect for each datum");
        let selectionData = allCells.data();
        assert.includeMembers(selectionData, plot.datasets()[0].data(), "data in selection data");
        div.remove();
      });

      it("retrieves correct selections", () => {
        let allCells = plot.selections([plot.datasets()[0]]);
        assert.strictEqual(allCells.size(), plot.datasets()[0].data().length, "rect for each datum");
        let selectionData = allCells.data();
        assert.includeMembers(selectionData, plot.datasets()[0].data(), "data in selection data");
        div.remove();
      });

      it("skips invalid Datasets", () => {
        let dummyDataset = new Plottable.Dataset([]);
        let allCells = plot.selections([plot.datasets()[0], dummyDataset]);
        assert.strictEqual(allCells.size(), plot.datasets()[0].data().length, "rect for each datum");
        let selectionData = allCells.data();
        assert.includeMembers(selectionData, plot.datasets()[0].data(), "data in selection data");
        div.remove();
      });

    });

    describe("labelling plot elements", () => {
      let plot: Plottable.Plots.Rectangle<number, number>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let div: d3.Selection<HTMLDivElement, any, any, any>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Rectangle<number, number>();

        const data = [
          { x: 0, y: 0, x2: 1, y2: 1, val: "1" },
          { x: 0, y: 1, x2: 1, y2: 2, val: "2" },
        ];

        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);
        plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .x2((d: any) => d.x2)
          .y2((d: any) => d.y2)
          .label((d: any) => d.val);
      });

      it("does not display rectangle labels by default", () => {
        plot.renderTo(div);
        const texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), 0, "no labels are drawn by default");
        div.remove();
      });

      it("renders correct text for the labels", () => {
        plot.renderTo(div);
        plot.labelsEnabled(true);
        const texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), 2, "all labels are drawn");
        texts.each(function(d, i) {
          const textString = d3.select(this).text();
          assert.strictEqual(textString, plot.datasets()[0].data()[i].val, `label ${i} is rendered`);
        });
        div.remove();
      });

      it("hides labels when rectangles do not offer enough width", () => {
        let constrainedWidth = 150;
        div.style("width", constrainedWidth + "px");
        plot.renderTo(div);
        plot.labelsEnabled(true);
        plot.label(() => "a really really really long string");
        const texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), 0, "labels not drawn if not enough width");
        div.remove();
      });

      it("hides labels when rectangles do not offer enough height", () => {
        const constrainedHeight = 30;
        div.style("height", constrainedHeight + "px");
        plot.renderTo(div);
        plot.labelsEnabled(true);
        plot.label((d: any) => d.val);
        const texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), 0, "labels not drawn if not enough height");
        div.remove();
      });

      it("updates labels on dataset change", () => {
        plot.renderTo(div);
        plot.labelsEnabled(true);
        const texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), plot.datasets()[0].data().length, "all labels are drawn");

        const data2 = [{ x: 0, y: 0, x2: 1, y2: 1, val: "5" }];
        plot.datasets()[0].data(data2);
        const updatedTexts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(updatedTexts.size(), data2.length, "label for each datum");
        updatedTexts.each(function(d, i) {
          const textString = d3.select(this).text();
          assert.strictEqual(textString, data2[i].val, "new label drawn");
        });
        div.remove();
      });

      it("hides labels cut off by edges", () => {
        plot.labelsEnabled(true);

        const xDomainMin = 1;
        const xDomainMax = 4;

        const data = Plottable.Utils.Math.range(xDomainMin - 1, xDomainMax + 1, 0.5).map((d) => {
          return { x: d, y: 2, x2: d + 0.5, y2: 3, val: d.toString() };
        });

        plot.datasets()[0].data(data);
        xScale.domain([xDomainMin, xDomainMax]);
        plot.renderTo(div);

        const texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), (xDomainMax - xDomainMin) / 0.5, "labels inside the edges are drawn");
        texts.each(function(d, i) {
          const value = parseFloat(d3.select(this).text());
          assert.operator(value, ">=", xDomainMin, "label drawn inside left edge");
          assert.operator(value, "<=", xDomainMax, "label drawn inside right edge");
        });
        div.remove();
      });

      it("hides labels cut off by other rectangles", () => {
        plot.labelsEnabled(true);

        const constantValue = 5;
        const overlappingRectangleData = Plottable.Utils.Math.range(0, 4).map((index) => {
          return { x: constantValue, y: constantValue, x2: constantValue + 2, y2: constantValue + 2, val: index.toString() };
        });
        plot.datasets()[0].data(overlappingRectangleData);
        plot.renderTo(div);

        let texts = plot.content().selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), 1, "only top most label is rendered");
        div.remove();
      });
    });
  });
});
